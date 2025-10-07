#!/bin/bash
# Exit on error
set -e

# Install Python 3.10.12
pyenv install -s 3.10.12
pyenv global 3.10.12

# Install dependencies
pip install -r requirements.txt

# Print Python version for debugging
python --version
