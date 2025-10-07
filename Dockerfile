# Build stage for Node.js
FROM node:16.14.0 as node-build

WORKDIR /app

# Install client dependencies
COPY client/package*.json ./client/
RUN cd client && npm install

# Copy client source
COPY client/ ./client/

# Build the client
RUN cd client && npm run build

# Final stage
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-fra \
    tesseract-ocr-spa \
    tesseract-ocr-deu \
    tesseract-ocr-ita \
    poppler-utils \
    ghostscript \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Python requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the built client from the node-build stage
COPY --from=node-build /app/client/dist ./client/dist

# Copy the rest of the application
COPY . .

# Create necessary directories
RUN mkdir -p /app/uploads /app/processed

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV TESSDATA_PREFIX=/usr/share/tesseract-ocr/4.00/tessdata

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
