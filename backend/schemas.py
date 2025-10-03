from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: UserResponse

# PDF Document schemas
class PDFDocumentBase(BaseModel):
    filename: str
    file_size: int

class PDFUploadResponse(PDFDocumentBase):
    id: str
    upload_time: datetime

class PDFDocumentResponse(PDFDocumentBase):
    id: str
    original_filename: str
    pages_count: Optional[int]
    created_at: datetime
    processing_status: str
    is_processed: bool
    
    class Config:
        from_attributes = True

# PDF Processing schemas
class PDFMergeRequest(BaseModel):
    file_ids: List[str]
    output_filename: Optional[str] = None

class PDFSplitRequest(BaseModel):
    file_id: str
    pages: List[int]  # Page numbers to extract
    output_filename: Optional[str] = None

class PDFCompressRequest(BaseModel):
    file_id: str
    quality: int = 80  # Compression quality 1-100
    output_filename: Optional[str] = None

class PDFConvertRequest(BaseModel):
    file_id: str
    format: str = "png"  # png, jpg, jpeg
    dpi: int = 200
    output_filename: Optional[str] = None

# OCR schemas
class OCRRequest(BaseModel):
    file_id: str
    language: str = "eng"  # Tesseract language code
    pages: Optional[List[int]] = None  # Specific pages, None for all

class OCRResponse(BaseModel):
    id: str
    document_id: str
    extracted_text: str
    confidence_score: float
    language: str
    page_number: Optional[int]
    processing_time: float
    created_at: datetime
    
    class Config:
        from_attributes = True

# Processing Job schemas
class ProcessingJobResponse(BaseModel):
    id: str
    job_type: str
    status: str
    input_files: List[str]
    output_files: Optional[List[str]]
    parameters: Dict[str, Any]
    error_message: Optional[str]
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    processing_time: Optional[float]
    
    class Config:
        from_attributes = True

# Generic response schemas
class MessageResponse(BaseModel):
    message: str
    success: bool = True

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    success: bool = False