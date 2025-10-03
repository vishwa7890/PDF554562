# Installing Tesseract OCR for PDF Master

## Windows Installation

### 1. Download Tesseract
Download the Tesseract installer for Windows:
- **Recommended**: [Tesseract 5.x installer](https://github.com/UB-Mannheim/tesseract/wiki)
- Direct link: https://digi.bib.uni-mannheim.de/tesseract/tesseract-ocr-w64-setup-5.3.3.20231005.exe

### 2. Install Tesseract
1. Run the downloaded installer
2. **Important**: During installation, note the installation path (default: `C:\Program Files\Tesseract-OCR`)
3. Make sure to check "Add to PATH" option if available
4. Complete the installation

### 3. Install Poppler (for PDF to Image conversion)
1. Download Poppler for Windows: https://github.com/oschwartz10612/poppler-windows/releases
2. Extract the ZIP file to `C:\poppler` (or another location)
3. Add Poppler's `bin` folder to your system PATH:
   - Open System Properties → Environment Variables
   - Under System Variables, find and edit `Path`
   - Add: `C:\poppler\Library\bin` (or your extraction path + `\Library\bin`)

### 4. Verify Installation

Open a new terminal and run:
```bash
tesseract --version
pdftoppm -v
```

Both commands should display version information.

### 5. Restart Backend Server
After installation, restart your FastAPI backend:
```bash
cd backend
uvicorn main:app --reload
```

## Alternative: Mock OCR for Testing

If you don't want to install Tesseract right now, you can temporarily use a mock OCR service for testing. The frontend already has fallback handling for failed OCR requests.

## Troubleshooting

### Error: "Tesseract is not installed"
- Verify Tesseract is installed: `tesseract --version`
- Check the path in `services/ocr_service.py` matches your installation

### Error: "Unable to get page count"
- Install Poppler and add to PATH
- Restart your terminal/IDE after adding to PATH

### Error: "Permission denied"
- Run terminal as Administrator
- Check file permissions in `uploads/` and `processed/` directories
