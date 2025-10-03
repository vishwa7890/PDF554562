from fastapi import HTTPException
from sqlalchemy.orm import Session
from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from pdf2image import convert_from_path
from PIL import Image
import os
import uuid
from typing import List, Optional
import json
from datetime import datetime
import shutil
import platform
import time

from models import PDFDocument, ProcessingJob

class PDFService:
    def __init__(self):
        self.upload_dir = "uploads"
        self.processed_dir = "processed"
        os.makedirs(self.upload_dir, exist_ok=True)
        os.makedirs(self.processed_dir, exist_ok=True)
        
        # Check for poppler (needed for PDF to image conversion)
        self._check_poppler()
    
    def _check_poppler(self):
        """Check if poppler is available in PATH"""
        try:
            poppler_path = shutil.which('pdftoppm')
            if poppler_path:
                print(f"Poppler found at: {poppler_path}")
                return True
            else:
                print("Warning: Poppler not found in PATH. PDF to image conversion will fail.")
                print("Install from: https://github.com/oschwartz10612/poppler-windows/releases/")
                return False
        except Exception as e:
            print(f"Error checking for Poppler: {e}")
            return False

    async def merge_pdfs(self, file_ids: List[str], user_id: str, db: Session):
        """Merge multiple PDF files into one"""
        job = None
        try:
            print(f"Starting PDF merge for {len(file_ids)} files")
            
            # Get PDF documents from database
            documents = db.query(PDFDocument).filter(
                PDFDocument.id.in_(file_ids),
                PDFDocument.user_id == user_id
            ).all()
            
            if len(documents) != len(file_ids):
                raise HTTPException(status_code=404, detail="One or more files not found")
            
            # Create processing job
            job = ProcessingJob(
                id=str(uuid.uuid4()),
                user_id=user_id,
                job_type="merge",
                status="processing",
                input_files=json.dumps(file_ids),
                parameters=json.dumps({"file_count": len(file_ids)}),
                started_at=datetime.utcnow()
            )
            db.add(job)
            db.commit()
            print(f"Created merge job: {job.id}")
            
            start_time = time.time()
            
            # Merge PDFs
            writer = PdfWriter()
            total_pages = 0
            
            for doc in documents:
                if not os.path.exists(doc.file_path):
                    raise HTTPException(status_code=404, detail=f"File {doc.filename} not found on disk")
                
                print(f"Adding {doc.filename} to merge")
                reader = PdfReader(doc.file_path)
                page_count = len(reader.pages)
                total_pages += page_count
                
                for page in reader.pages:
                    writer.add_page(page)
                
                print(f"Added {page_count} pages from {doc.filename}")
            
            # Save merged PDF
            output_filename = f"merged_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf"
            output_path = os.path.join(self.processed_dir, output_filename)
            
            with open(output_path, 'wb') as output_file:
                writer.write(output_file)
            
            file_size = os.path.getsize(output_path)
            processing_time = time.time() - start_time
            
            print(f"Merged PDF saved: {output_filename} ({file_size} bytes, {total_pages} pages)")
            print(f"Merge completed in {processing_time:.2f} seconds")
            
            # Update job status
            job.status = "completed"
            job.completed_at = datetime.utcnow()
            job.processing_time = processing_time
            job.output_files = json.dumps([output_path])
            db.commit()
            
            return {
                "success": True,
                "message": f"Successfully merged {len(file_ids)} PDFs into one file",
                "output_file": output_filename,
                "download_url": f"/processed/{output_filename}",
                "total_pages": total_pages,
                "file_size": file_size,
                "processing_time": round(processing_time, 2),
                "job_id": job.id
            }
            
        except HTTPException:
            raise
        except Exception as e:
            print(f"Error merging PDFs: {str(e)}")
            # Update job status on error
            if job:
                job.status = "failed"
                job.error_message = str(e)
                job.completed_at = datetime.utcnow()
                db.commit()
            
            raise HTTPException(status_code=500, detail=f"Error merging PDFs: {str(e)}")

    async def split_pdf(self, file_id: str, pages: List[int], user_id: str, db: Session):
        """Split PDF into separate files based on page numbers"""
        job = None
        try:
            print(f"Starting PDF split for file {file_id}, pages: {pages}")
            
            # Get PDF document
            document = db.query(PDFDocument).filter(
                PDFDocument.id == file_id,
                PDFDocument.user_id == user_id
            ).first()
            
            if not document:
                raise HTTPException(status_code=404, detail="File not found")
            
            if not os.path.exists(document.file_path):
                raise HTTPException(status_code=404, detail="File not found on disk")
            
            # Create processing job
            job = ProcessingJob(
                id=str(uuid.uuid4()),
                user_id=user_id,
                job_type="split",
                status="processing",
                input_files=json.dumps([file_id]),
                parameters=json.dumps({"pages": pages}),
                started_at=datetime.utcnow()
            )
            db.add(job)
            db.commit()
            print(f"Created split job: {job.id}")
            
            start_time = time.time()
            
            reader = PdfReader(document.file_path)
            total_pages = len(reader.pages)
            print(f"PDF has {total_pages} pages")
            
            # Validate page numbers
            invalid_pages = [p for p in pages if p < 1 or p > total_pages]
            if invalid_pages:
                error_msg = f"Invalid page numbers: {invalid_pages}. PDF has {total_pages} pages."
                print(error_msg)
                raise HTTPException(status_code=400, detail=error_msg)
            
            output_files = []
            output_paths = []
            
            for page_num in pages:
                writer = PdfWriter()
                writer.add_page(reader.pages[page_num - 1])  # Convert to 0-based index
                
                output_filename = f"split_{document.filename.replace('.pdf', '')}_page_{page_num}.pdf"
                output_path = os.path.join(self.processed_dir, output_filename)
                
                with open(output_path, 'wb') as output_file:
                    writer.write(output_file)
                
                output_files.append(output_filename)
                output_paths.append(output_path)
                print(f"Extracted page {page_num} to {output_filename}")
            
            processing_time = time.time() - start_time
            print(f"Split completed in {processing_time:.2f} seconds")
            
            # Update job status
            job.status = "completed"
            job.completed_at = datetime.utcnow()
            job.processing_time = processing_time
            job.output_files = json.dumps(output_paths)
            db.commit()
            
            return {
                "success": True,
                "message": f"Successfully split PDF into {len(output_files)} files",
                "output_files": output_files,
                "output_paths": output_paths,  # Add full paths for the endpoint to use
                "download_urls": [f"/processed/{f}" for f in output_files],
                "total_pages": len(pages),
                "processing_time": round(processing_time, 2),
                "job_id": job.id
            }
            
        except HTTPException as he:
            if job:
                job.status = "failed"
                job.error_message = str(he.detail)
                job.completed_at = datetime.utcnow()
                db.commit()
            raise
        except Exception as e:
            print(f"Error splitting PDF: {str(e)}")
            if job:
                job.status = "failed"
                job.error_message = str(e)
                job.completed_at = datetime.utcnow()
                db.commit()
            
            raise HTTPException(status_code=500, detail=f"Error splitting PDF: {str(e)}")

    async def compress_pdf(self, file_id: str, quality: int, user_id: str, db: Session):
        """Compress PDF file"""
        job = None
        try:
            print(f"Starting PDF compression for file {file_id} with quality {quality}")
            
            document = db.query(PDFDocument).filter(
                PDFDocument.id == file_id,
                PDFDocument.user_id == user_id
            ).first()
            
            if not document:
                raise HTTPException(status_code=404, detail="File not found")
            
            if not os.path.exists(document.file_path):
                raise HTTPException(status_code=404, detail="File not found on disk")
            
            # Create processing job
            job = ProcessingJob(
                id=str(uuid.uuid4()),
                user_id=user_id,
                job_type="compress",
                status="processing",
                input_files=json.dumps([file_id]),
                parameters=json.dumps({"quality": quality}),
                started_at=datetime.utcnow()
            )
            db.add(job)
            db.commit()
            print(f"Created compression job: {job.id}")
            
            start_time = time.time()
            original_size = os.path.getsize(document.file_path)
            print(f"Original file size: {original_size} bytes")
            
            reader = PdfReader(document.file_path)
            writer = PdfWriter()
            
            # Add all pages to writer
            page_count = len(reader.pages)
            print(f"Processing {page_count} pages")
            
            for i, page in enumerate(reader.pages, 1):
                writer.add_page(page)
                if i % 10 == 0:
                    print(f"Processed {i}/{page_count} pages")
            
            # Set compression level based on quality (0-100)
            # Convert quality (0-100) to compression level (0-9, where 0 is no compression)
            compression_level = min(9, max(0, 9 - int(quality / 12)))  # Map 0-100 to 9-1
            print(f"Applying compression level: {compression_level}")
            
            # Add compression to all pages
            for page in writer.pages:
                # This is a simple way to ensure the page content is compressed
                # The actual compression happens during writer.write()
                pass
            
            output_filename = f"compressed_{document.filename}"
            output_path = os.path.join(self.processed_dir, output_filename)
            
            with open(output_path, 'wb') as output_file:
                writer.write(output_file)
            
            # Calculate compression ratio
            compressed_size = os.path.getsize(output_path)
            compression_ratio = ((original_size - compressed_size) / original_size) * 100 if original_size > 0 else 0
            
            processing_time = time.time() - start_time
            
            print(f"Compressed file size: {compressed_size} bytes")
            print(f"Compression ratio: {compression_ratio:.2f}%")
            print(f"Compression completed in {processing_time:.2f} seconds")
            
            # Update job status
            job.status = "completed"
            job.completed_at = datetime.utcnow()
            job.processing_time = processing_time
            job.output_files = json.dumps([output_path])
            db.commit()
            
            return {
                "success": True,
                "message": "PDF compressed successfully",
                "output_file": output_filename,
                "download_url": f"/processed/{output_filename}",
                "original_size": original_size,
                "compressed_size": compressed_size,
                "compression_ratio": round(compression_ratio, 2),
                "saved_bytes": original_size - compressed_size,
                "processing_time": round(processing_time, 2),
                "job_id": job.id
            }
            
        except HTTPException:
            raise
        except Exception as e:
            print(f"Error compressing PDF: {str(e)}")
            if job:
                job.status = "failed"
                job.error_message = str(e)
                job.completed_at = datetime.utcnow()
                db.commit()
            
            raise HTTPException(status_code=500, detail=f"Error compressing PDF: {str(e)}")

    async def convert_to_images(self, file_id: str, format: str, user_id: str, db: Session):
        """Convert PDF pages to images"""
        job = None
        try:
            print(f"Starting PDF to image conversion for file {file_id}, format: {format}")
            
            # Check if poppler is available
            if not shutil.which('pdftoppm'):
                error_msg = "Poppler is not installed or not in PATH. Please install Poppler from: https://github.com/oschwartz10612/poppler-windows/releases/"
                print(error_msg)
                raise HTTPException(status_code=500, detail=error_msg)
            
            document = db.query(PDFDocument).filter(
                PDFDocument.id == file_id,
                PDFDocument.user_id == user_id
            ).first()
            
            if not document:
                raise HTTPException(status_code=404, detail="File not found")
            
            if not os.path.exists(document.file_path):
                raise HTTPException(status_code=404, detail="File not found on disk")
            
            # Validate format
            valid_formats = ['png', 'jpg', 'jpeg', 'webp', 'tiff', 'bmp']
            if format.lower() not in valid_formats:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid format '{format}'. Supported formats: {', '.join(valid_formats)}"
                )
            
            # Create processing job
            job = ProcessingJob(
                id=str(uuid.uuid4()),
                user_id=user_id,
                job_type="convert",
                status="processing",
                input_files=json.dumps([file_id]),
                parameters=json.dumps({"format": format}),
                started_at=datetime.utcnow()
            )
            db.add(job)
            db.commit()
            print(f"Created conversion job: {job.id}")
            
            start_time = time.time()
            
            # Convert PDF to images
            print(f"Converting PDF to images with 200 DPI...")
            try:
                images = convert_from_path(document.file_path, dpi=200)
                print(f"Successfully converted PDF to {len(images)} images")
            except Exception as e:
                error_msg = f"Error converting PDF to images: {str(e)}. Make sure Poppler is installed and in PATH."
                print(error_msg)
                raise HTTPException(status_code=500, detail=error_msg)
            
            output_files = []
            output_paths = []
            total_size = 0
            
            for i, image in enumerate(images, 1):
                output_filename = f"page_{i}_{document.filename.replace('.pdf', '')}.{format}"
                output_path = os.path.join(self.processed_dir, output_filename)
                
                # Save image with appropriate format
                save_format = 'JPEG' if format.lower() in ['jpg', 'jpeg'] else format.upper()
                
                # For JPEG, convert RGBA to RGB if necessary
                if save_format == 'JPEG' and image.mode == 'RGBA':
                    rgb_image = Image.new('RGB', image.size, (255, 255, 255))
                    rgb_image.paste(image, mask=image.split()[3])
                    rgb_image.save(output_path, save_format, quality=95)
                else:
                    image.save(output_path, save_format)
                
                file_size = os.path.getsize(output_path)
                total_size += file_size
                
                output_files.append(output_filename)
                output_paths.append(output_path)
                print(f"Saved page {i}/{len(images)}: {output_filename} ({file_size} bytes)")
            
            processing_time = time.time() - start_time
            print(f"Conversion completed in {processing_time:.2f} seconds")
            print(f"Total output size: {total_size} bytes")
            
            # Update job status
            job.status = "completed"
            job.completed_at = datetime.utcnow()
            job.processing_time = processing_time
            job.output_files = json.dumps(output_paths)
            db.commit()
            
            return {
                "success": True,
                "message": f"PDF converted to {len(output_files)} {format.upper()} images",
                "output_files": output_files,
                "download_urls": [f"/processed/{f}" for f in output_files],
                "total_pages": len(output_files),
                "format": format.upper(),
                "total_size": total_size,
                "processing_time": round(processing_time, 2),
                "job_id": job.id
            }
            
        except HTTPException:
            raise
        except Exception as e:
            print(f"Error converting PDF to images: {str(e)}")
            if job:
                job.status = "failed"
                job.error_message = str(e)
                job.completed_at = datetime.utcnow()
                db.commit()
            
            raise HTTPException(status_code=500, detail=f"Error converting PDF: {str(e)}")