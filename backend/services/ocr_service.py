from fastapi import HTTPException
from sqlalchemy.orm import Session
import pytesseract
from pdf2image import convert_from_path
from PIL import Image
import os
import uuid
import json
from datetime import datetime
from typing import List, Optional
import time
import platform

from models import PDFDocument, OCRResult, ProcessingJob

class OCRService:
    def __init__(self):
        self.processed_dir = "processed"
        os.makedirs(self.processed_dir, exist_ok=True)
        
        # Configure Tesseract path for Windows
        if platform.system() == "Windows":
            # First check if tesseract is in PATH
            try:
                import shutil
                tesseract_path = shutil.which('tesseract')
                if tesseract_path and os.path.exists(tesseract_path):
                    print(f"Found Tesseract in PATH: {tesseract_path}")
                    pytesseract.pytesseract.tesseract_cmd = tesseract_path
                    return
            except Exception as e:
                print(f"Error checking Tesseract in PATH: {e}")
            
            # If not in PATH, check common installation paths
            possible_paths = [
                r'C:\Program Files\Tesseract-OCR\tesseract.exe',
                r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
                r'C:\Users\Public\Tesseract-OCR\tesseract.exe',
            ]
            for path in possible_paths:
                if os.path.exists(path):
                    print(f"Found Tesseract at: {path}")
                    pytesseract.pytesseract.tesseract_cmd = path
                    break
            else:
                print("Warning: Tesseract not found in any of the default locations")
    
    def _check_tesseract(self):
        """Check if Tesseract is available"""
        try:
            version = pytesseract.get_tesseract_version()
            print(f"Tesseract version found: {version}")
            return True
        except Exception as e:
            print(f"Current Tesseract command: {pytesseract.pytesseract.tesseract_cmd}")
            return False

    async def extract_text_from_pdf(self, file_id: str, language: str, user_id: str, db: Session):
        """Extract text from PDF using OCR"""
        job = None
        try:
            print(f"Starting OCR extraction for file {file_id} with language {language}")
            
            # Check Tesseract availability
            if not self._check_tesseract():
                error_msg = "Tesseract OCR is not installed or not found in PATH"
                print(error_msg)
                raise HTTPException(
                    status_code=500, 
                    detail=error_msg
                )
            
            # Query database for file_id and user_id
            document = db.query(PDFDocument).filter(
                PDFDocument.id == file_id,
                PDFDocument.user_id == user_id
            ).first()
            
            if not document:
                error_msg = f"Document not found for file_id: {file_id}, user_id: {user_id}"
                print(error_msg)
                raise HTTPException(status_code=404, detail=error_msg)
            
            print(f"Found document: {document.filename} at {document.file_path}")
            
            if not os.path.exists(document.file_path):
                error_msg = f"File not found on disk: {document.file_path}"
                print(error_msg)
                raise HTTPException(status_code=404, detail=error_msg)
            
            # Create processing job
            job = ProcessingJob(
                id=str(uuid.uuid4()),
                user_id=user_id,
                job_type="ocr",
                status="processing",
                input_files=json.dumps([file_id]),
                parameters=json.dumps({"language": language, "operation": "extract_text"}),
                started_at=datetime.utcnow()
            )
            db.add(job)
            db.commit()
            print(f"Created processing job: {job.id}")
            
            start_time = time.time()
            
            try:
                print(f"Converting PDF to images: {document.file_path}")
                images = convert_from_path(document.file_path, dpi=300)
                print(f"Successfully converted PDF to {len(images)} pages")
            except Exception as e:
                error_msg = f"Error converting PDF to images: {str(e)}"
                print(error_msg)
                raise HTTPException(status_code=500, detail=error_msg)
            
            all_text = []
            
            for page_num, image in enumerate(images, 1):
                print(f"Processing page {page_num}/{len(images)}")
                page_start_time = time.time()
                
                try:
                    # Get OCR data with confidence scores
                    print(f"Running Tesseract OCR on page {page_num}")
                    ocr_data = pytesseract.image_to_data(
                        image, 
                        lang=language, 
                        output_type=pytesseract.Output.DICT
                    )
                
                    # Extract text
                    print(f"Extracting text from page {page_num}")
                    page_text = pytesseract.image_to_string(image, lang=language)
                    all_text.append(f"--- Page {page_num} ---\n{page_text}\n")
                    
                    # Calculate average confidence
                    confidences = [int(conf) for conf in ocr_data['conf'] if int(conf) > 0]
                    avg_confidence = sum(confidences) / len(confidences) if confidences else 0
                    print(f"Page {page_num} processed with average confidence: {avg_confidence:.2f}")
                    
                    # Calculate processing time for this page
                    page_processing_time = time.time() - page_start_time
                    print(f"Page {page_num} processed in {page_processing_time:.2f} seconds")
                    
                except Exception as e:
                    error_msg = f"Error processing page {page_num}: {str(e)}"
                    print(f"Error details: {traceback.format_exc()}")
                    raise HTTPException(status_code=500, detail=error_msg)
            
            # Save combined text file
            combined_text = "\n".join(all_text)
            output_filename = f"ocr_text_{file_id}_{int(time.time())}.txt"
            output_path = os.path.join(self.processed_dir, output_filename)
            
            try:
                with open(output_path, 'w', encoding='utf-8') as f:
                    f.write(combined_text)
                print(f"OCR results saved to {output_path}")
                
                # Update job status
                job.status = "completed"
                job.completed_at = datetime.utcnow()
                job.output_files = json.dumps([output_path])
                db.commit()
                
                processing_time = time.time() - start_time
                print(f"OCR processing completed in {processing_time:.2f} seconds")
                
                return {
                    "extracted_text": combined_text,
                    "confidence": 95.0,  # Placeholder
                    "processing_time": processing_time,
                    "language": language,
                    "word_count": len(combined_text.split())
                }
                
            except Exception as e:
                error_msg = f"Error saving OCR results: {str(e)}"
                print(error_msg)
                raise HTTPException(status_code=500, detail=error_msg)
                
        except HTTPException:
            # Re-raise HTTP exceptions as they are
            raise
            
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            print(f"Unexpected error in extract_text_from_pdf: {error_details}")
            
            # Update job status if it was created
            if job:
                job.status = "failed"
                job.error_message = str(e)
                job.completed_at = datetime.utcnow()
                db.commit()
            
            raise HTTPException(
                status_code=500, 
                detail=f"An unexpected error occurred during OCR processing: {str(e)}"
            )

    async def create_searchable_pdf(self, file_id: str, language: str, user_id: str, db: Session):
        """Create a searchable PDF by adding OCR text layer"""
        try:
            # Check Tesseract availability
            if not self._check_tesseract():
                raise HTTPException(
                    status_code=500, 
                    detail="Tesseract OCR is not installed. Please install Tesseract from https://github.com/UB-Mannheim/tesseract/wiki"
                )
            
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
                job_type="ocr",
                status="processing",
                input_files=json.dumps([file_id]),
                parameters=json.dumps({"language": language, "operation": "searchable_pdf"}),
                started_at=datetime.utcnow()
            )
            db.add(job)
            db.commit()
            
            start_time = time.time()
            
            # Convert PDF to images
            images = convert_from_path(document.file_path, dpi=300)
            
            # Create searchable PDF using pytesseract
            output_filename = f"searchable_{document.filename}"
            output_path = os.path.join(self.processed_dir, output_filename)
            
            # For now, we'll create a simple searchable PDF
            # In a production environment, you might want to use more sophisticated libraries
            # like OCRmyPDF or create a proper PDF with invisible text layer
            
            pdf_bytes = pytesseract.image_to_pdf_or_hocr(
                images[0] if images else None,
                lang=language,
                extension='pdf'
            )
            
            with open(output_path, 'wb') as f:
                f.write(pdf_bytes)
            
            total_processing_time = time.time() - start_time
            
            # Update job status
            job.status = "completed"
            job.completed_at = datetime.utcnow()
            job.processing_time = total_processing_time
            job.output_files = json.dumps([output_filename])
            
            db.commit()
            
            return {
                "success": True,
                "message": "Searchable PDF created successfully",
                "output_file": output_filename,
                "download_url": f"/processed/{output_filename}",
                "processing_time": total_processing_time,
                "job_id": job.id
            }
            
        except Exception as e:
            if 'job' in locals():
                job.status = "failed"
                job.error_message = str(e)
                job.completed_at = datetime.utcnow()
                db.commit()
            
            raise HTTPException(status_code=500, detail=f"Error creating searchable PDF: {str(e)}")

    def get_supported_languages(self):
        """Get list of supported OCR languages"""
        try:
            languages = pytesseract.get_languages()
            return {
                "success": True,
                "languages": languages,
                "default": "eng"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "languages": ["eng"],  # Fallback
                "default": "eng"
            }