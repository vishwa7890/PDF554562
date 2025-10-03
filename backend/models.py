from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Float, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    documents = relationship("PDFDocument", back_populates="user")
    ocr_results = relationship("OCRResult", back_populates="user")

class PDFDocument(Base):
    __tablename__ = "pdf_documents"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), default="application/pdf")
    pages_count = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Processing status
    is_processed = Column(Boolean, default=False)
    processing_status = Column(String(50), default="uploaded")  # uploaded, processing, completed, failed
    
    # Relationships
    user = relationship("User", back_populates="documents")
    ocr_results = relationship("OCRResult", back_populates="document")

class OCRResult(Base):
    __tablename__ = "ocr_results"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, ForeignKey("pdf_documents.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    extracted_text = Column(Text)
    confidence_score = Column(Float)
    language = Column(String(10), default="eng")
    page_number = Column(Integer)
    processing_time = Column(Float)  # in seconds
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    document = relationship("PDFDocument", back_populates="ocr_results")
    user = relationship("User", back_populates="ocr_results")

class ProcessingJob(Base):
    __tablename__ = "processing_jobs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    job_type = Column(String(50), nullable=False)  # merge, split, compress, convert, ocr
    status = Column(String(20), default="pending")  # pending, processing, completed, failed
    input_files = Column(Text)  # JSON array of file IDs
    output_files = Column(Text)  # JSON array of output file paths
    parameters = Column(Text)  # JSON object with job parameters
    error_message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    processing_time = Column(Float)