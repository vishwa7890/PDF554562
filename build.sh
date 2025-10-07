#!/bin/bash
# Exit on error
set -e

# Print environment information for debugging
echo "Python version: $(python --version)"
echo "Pip version: $(pip --version)"

# Upgrade pip
pip install --upgrade pip

# Install Python dependencies
pip install -r backend/requirements.txt

# Install system dependencies for Tesseract and other tools
apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    poppler-utils \
    ghostscript

# Create necessary directories
mkdir -p uploads processed

# Print final Python and package versions for debugging
echo "=== Final Environment ==="
python --version
pip list
