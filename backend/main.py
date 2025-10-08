from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import uvicorn
import os
import time
from typing import List, Optional
import aiofiles
import uuid
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext

from database import get_db, engine
from models import Base, User, PDFDocument, OCRResult
from schemas import (
    UserCreate, UserLogin, UserResponse, Token,
    PDFUploadResponse, PDFMergeRequest, PDFSplitRequest,
    PDFCompressRequest, PDFConvertRequest, OCRRequest
)
from services.pdf_service import PDFService
from services.ocr_service import OCRService
from services.auth_service import AuthService

# Create necessary directories
os.makedirs("processed", exist_ok=True)
os.makedirs("uploads", exist_ok=True)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PDFGenie API",
    description="A comprehensive PDF processing API with OCR capabilities for PDFGenie application",
    version="1.0.0"
)

# Mount static files
app.mount("/processed", StaticFiles(directory="processed"), name="processed")

# Get allowed origins from environment variable or use defaults
ALLOWED_ORIGINS = os.getenv(
    'CORS_ORIGINS', 
    'http://localhost:3000,http://localhost:5173,https://pdfgenie.netlify.app,https://pdfgenie.mindapt.in'
).split(',')

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Services
pdf_service = PDFService()
ocr_service = OCRService()
auth_service = AuthService()

# Create upload directory
os.makedirs("uploads", exist_ok=True)
os.makedirs("processed", exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/processed", StaticFiles(directory="processed"), name="processed")

@app.get("/")
async def root():
    return {"message": "PDF Master API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Initialize services
auth_service = AuthService()
security = HTTPBearer()

# Authentication endpoints
@app.post("/auth/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    return await auth_service.register_user(user, db)

@app.post("/auth/login", response_model=Token)
async def login(user: UserLogin, db: Session = Depends(get_db)):
    return await auth_service.authenticate_user(user, db)

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    return await auth_service.get_current_user(credentials.credentials, db)

# PDF Processing endpoints
@app.post("/pdf/upload", response_model=PDFUploadResponse)
async def upload_pdf(
    file: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    user = await auth_service.get_current_user(credentials.credentials, db)
    
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Save uploaded file
    file_id = str(uuid.uuid4())
    file_path = f"uploads/{file_id}_{file.filename}"
    
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    # Save to database
    pdf_doc = PDFDocument(
        id=file_id,
        filename=file.filename,
        original_filename=file.filename,
        file_path=file_path,
        file_size=len(content),
        user_id=user.id
    )
    db.add(pdf_doc)
    db.commit()
    
    return PDFUploadResponse(
        id=file_id,
        filename=file.filename,
        file_size=len(content),
        upload_time=pdf_doc.created_at
    )

@app.post("/pdf/merge")
async def merge_pdfs(
    request: PDFMergeRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    user = await auth_service.get_current_user(credentials.credentials, db)
    result = await pdf_service.merge_pdfs(request.file_ids, user.id, db)
    
    # Get the file path from the result
    file_path = os.path.join("processed", result["output_file"])
    
    # Return the file with content-disposition header to force download
    from fastapi.responses import FileResponse
    return FileResponse(
        path=file_path,
        filename=result["output_file"],
        media_type='application/octet-stream',
        headers={
            'Content-Disposition': f'attachment; filename="{result["output_file"]}"'
        }
    )

@app.post("/pdf/split")
async def split_pdf(
    request: PDFSplitRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    user = await auth_service.get_current_user(credentials.credentials, db)
    result = await pdf_service.split_pdf(request.file_id, request.pages, user.id, db)
    
    # Create a zip file containing all split PDFs
    import zipfile
    import os
    from fastapi.responses import FileResponse
    
    # Create a zip file
    zip_filename = f"split_pages_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.zip"
    zip_path = os.path.join("processed", zip_filename)
    
    with zipfile.ZipFile(zip_path, 'w') as zipf:
        for file_path in result["output_paths"]:
            if os.path.exists(file_path):
                zipf.write(file_path, os.path.basename(file_path))
    
    # Return the zip file for download
    return FileResponse(
        path=zip_path,
        filename=zip_filename,
        media_type='application/zip',
        headers={
            'Content-Disposition': f'attachment; filename="{zip_filename}"'
        }
    )

@app.post("/pdf/compress")
async def compress_pdf(
    request: PDFCompressRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    user = await auth_service.get_current_user(credentials.credentials, db)
    result = await pdf_service.compress_pdf(request.file_id, request.quality, user.id, db)
    
    # Return the compressed file for download
    file_path = os.path.join("processed", result["output_file"])
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Compressed file not found")
    
    return FileResponse(
        path=file_path,
        filename=result["output_file"],
        media_type='application/pdf',
        headers={
            'Content-Disposition': f'attachment; filename="{result["output_file"]}"'
        }
    )

@app.post("/pdf/convert")
async def convert_pdf(
    request: PDFConvertRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    user = await auth_service.get_current_user(credentials.credentials, db)
    result = await pdf_service.convert_to_images(request.file_id, request.format, user.id, db)
    
    # Create a zip file with all the images
    import zipfile
    from fastapi.responses import FileResponse
    
    zip_filename = f"converted_images_{int(time.time())}.zip"
    zip_path = os.path.join("processed", zip_filename)
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for img_path in result["output_files"]:
            full_path = os.path.join("processed", img_path)
            if os.path.exists(full_path):
                zipf.write(full_path, os.path.basename(img_path))
    
    # Return the zip file for download
    return FileResponse(
        path=zip_path,
        filename=zip_filename,
        media_type='application/zip',
        headers={
            'Content-Disposition': f'attachment; filename="{zip_filename}"'
        }
    )

# OCR endpoints
@app.post("/ocr/extract-text")
async def extract_text_ocr(
    request: OCRRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    user = await auth_service.get_current_user(credentials.credentials, db)
    return await ocr_service.extract_text_from_pdf(request.file_id, request.language, user.id, db)

@app.post("/ocr/searchable-pdf")
async def create_searchable_pdf(
    request: OCRRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    user = await auth_service.get_current_user(credentials.credentials, db)
    return await ocr_service.create_searchable_pdf(request.file_id, request.language, user.id, db)

# User documents
@app.get("/user/documents")
async def get_user_documents(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    user = await auth_service.get_current_user(credentials.credentials, db)
    documents = db.query(PDFDocument).filter(PDFDocument.user_id == user.id).all()
    return documents

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)