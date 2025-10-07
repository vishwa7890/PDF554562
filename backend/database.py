from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from decouple import config
import os

# Database configuration
DATABASE_URL = config(
    'DATABASE_URL',
    default='postgresql://pdfgenie:X5rqyTHeXEkUtYyAzZAUlYUIrHjZAp9h@dpg-d3igqjggjchc73ebks5g-a/pdfgenie'
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()