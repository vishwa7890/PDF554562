# PDF Master

A comprehensive PDF processing application with advanced OCR capabilities, built with FastAPI backend and React frontend.

## Features

### 🔧 PDF Processing Tools
- **Merge PDFs**: Combine multiple PDF files into a single document
- **Split PDFs**: Extract specific pages or split into multiple files
- **Compress PDFs**: Reduce file size while maintaining quality
- **Convert to Images**: Transform PDF pages to high-quality images (PNG, JPG)

### 🔍 OCR Capabilities
- **Text Extraction**: Extract text from scanned PDFs and images
- **Multi-language Support**: Support for 100+ languages
- **Searchable PDFs**: Create searchable PDFs with text layers
- **High Accuracy**: Advanced OCR engine with 99%+ accuracy

### 🎨 Modern UI/UX
- **Dashboard Hub**: Centralized navigation and tool access
- **macOS-inspired Dock**: Bottom dock bar with contextual icons
- **Responsive Design**: Works perfectly on all devices
- **Glass Effect**: Modern transparent, blurry design elements
- **Dark Mode**: Full dark mode support

## Tech Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **PostgreSQL**: Robust relational database
- **SQLAlchemy**: Python SQL toolkit and ORM
- **Tesseract OCR**: Advanced OCR engine
- **Docker**: Containerization for easy deployment

### Frontend
- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **Radix UI**: Accessible component primitives
- **Wouter**: Lightweight routing

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL 15+
- Docker (optional)

### Option 1: Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PDFMaster
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Option 2: Manual Setup

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Install Tesseract OCR**
   
   **Ubuntu/Debian:**
   ```bash
   sudo apt-get install tesseract-ocr tesseract-ocr-eng
   ```
   
   **macOS:**
   ```bash
   brew install tesseract
   ```
   
   **Windows:**
   Download from: https://github.com/UB-Mannheim/tesseract/wiki

6. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb pdfmaster
   
   # Run migrations (tables will be created automatically)
   ```

7. **Start the backend server**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

#### Frontend Setup

1. **Navigate to project root**
   ```bash
   cd ..
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

## API Documentation

The FastAPI backend provides comprehensive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

#### PDF Processing
- `POST /api/pdf/upload` - Upload PDF file
- `POST /api/pdf/merge` - Merge multiple PDFs
- `POST /api/pdf/split` - Split PDF into pages
- `POST /api/pdf/compress` - Compress PDF file
- `POST /api/pdf/convert` - Convert PDF to images

#### OCR
- `POST /api/ocr/extract-text` - Extract text from PDF
- `POST /api/ocr/searchable-pdf` - Create searchable PDF

## Architecture

### Backend Architecture
```
backend/
├── main.py              # FastAPI application entry point
├── database.py          # Database configuration
├── models.py            # SQLAlchemy models
├── schemas.py           # Pydantic schemas
├── services/            # Business logic
│   ├── auth_service.py  # Authentication service
│   ├── pdf_service.py   # PDF processing service
│   └── ocr_service.py   # OCR service
├── uploads/             # Uploaded files storage
└── processed/           # Processed files storage
```

### Frontend Architecture
```
client/src/
├── components/          # Reusable components
│   ├── ui/             # UI component library
│   ├── DockBar.tsx     # macOS-inspired dock
│   ├── Navigation.tsx  # Top navigation
│   └── FileUploader.tsx # File upload component
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── MergePDF.tsx    # PDF merge tool
│   ├── OCRPage.tsx     # OCR functionality
│   └── ...
├── lib/                # Utilities and configuration
└── hooks/              # Custom React hooks
```

## Features in Detail

### Dashboard
- Central hub for all PDF tools
- Quick access to recent files
- Usage statistics and analytics
- Tool recommendations

### Dock Bar Navigation
- **Auto-hide**: Appears when mouse approaches bottom
- **Contextual Icons**: Adapts based on current page
- **Smooth Animations**: macOS-inspired transitions
- **Glass Effect**: Modern transparent design

### OCR Capabilities
- **Multi-language**: Support for 100+ languages
- **High Accuracy**: Advanced Tesseract OCR engine
- **Batch Processing**: Process multiple files
- **Text Export**: Export extracted text as TXT files
- **Searchable PDFs**: Create PDFs with searchable text layers

### Responsive Design
- **Mobile-first**: Optimized for mobile devices
- **Tablet Support**: Perfect tablet experience
- **Desktop Enhanced**: Full desktop functionality
- **Touch Friendly**: Touch-optimized interactions

## Development

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
npm test
```

### Building for Production
```bash
# Build frontend
npm run build

# Build backend
cd backend
pip install -r requirements.txt
```

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/pdfmaster
SECRET_KEY=your-secret-key
REDIS_URL=redis://localhost:6379
TESSERACT_CMD=/usr/bin/tesseract
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## Deployment

### Docker Deployment
```bash
# Build and deploy
docker-compose up -d --build

# Scale services
docker-compose up -d --scale backend=3
```

### Manual Deployment
1. Set up PostgreSQL database
2. Configure environment variables
3. Build frontend: `npm run build`
4. Deploy backend with gunicorn: `gunicorn main:app`
5. Serve frontend with nginx

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the API documentation at `/docs`
- Review the troubleshooting guide below

## Troubleshooting

### Common Issues

**OCR not working:**
- Ensure Tesseract is installed and in PATH
- Check language packs are installed
- Verify file permissions on upload directory

**Database connection errors:**
- Check PostgreSQL is running
- Verify database credentials in .env
- Ensure database exists

**Frontend build errors:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Verify all dependencies are installed

**Docker issues:**
- Ensure Docker daemon is running
- Check port availability (3000, 8000, 5432)
- Review Docker logs: `docker-compose logs`