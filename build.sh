#!/bin/bash
# Exit on error
set -e

# Set Python version
export PYTHON_VERSION=3.11.0

# Print environment information for debugging
echo "System Python version: $(python --version)"
echo "Python 3.11 version: $(python3.11 --version 2>&1 || echo 'Python 3.11 not found') "
echo "Pip version: $(pip --version)"

# Install Python 3.11 if not present
if ! command -v python3.11 &> /dev/null; then
    echo "Installing Python 3.11..."
    apt-get update && apt-get install -y python3.11 python3.11-dev python3.11-venv
    update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1
    update-alternatives --set python3 /usr/bin/python3.11
fi

# Create and activate virtual environment
python3.11 -m venv .venv
source .venv/bin/activate

# Upgrade pip and setuptools
python -m pip install --upgrade pip setuptools wheel

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
