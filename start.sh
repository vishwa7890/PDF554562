#!/bin/bash
echo "Starting PDFGenie Application..."
echo

# Check if Docker is available
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "Docker found! Starting with Docker Compose..."
    docker-compose up -d
    
    echo
    echo "Application started successfully!"
    echo "Frontend: http://localhost:3000"
    echo "Backend API: http://localhost:8000"
    echo "API Docs: http://localhost:8000/docs"
    echo
    echo "Press Ctrl+C to stop the application..."
    
    # Wait for interrupt
    trap 'echo "Stopping application..."; docker-compose down; exit' INT
    while true; do
        sleep 1
    done
else
    echo "Docker not found. Please install Docker or run manually."
    echo
    echo "Manual setup instructions:"
    echo "1. Install Node.js 18+ and Python 3.11+"
    echo "2. Install PostgreSQL 15+"
    echo "3. Run: npm install"
    echo "4. Set up backend: cd backend && pip install -r requirements.txt"
    echo "5. Start backend: uvicorn main:app --reload"
    echo "6. Start frontend: npm run dev"
    echo
fi