const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, 'client', 'src');

function updateImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = content.replace(
      /from ["']@\/lib\/utils["']/g,
      'from "@/utils/utils"'
    );
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`Updated imports in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

function processDirectory(directory) {
  const files = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(directory, file.name);
    
    if (file.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
      updateImports(fullPath);
    }
  }
}

// Update API imports in page components
const apiImportFiles = [
  'pages/SplitPDF.tsx',
  'pages/OCRPage.tsx',
  'pages/MergePDF.tsx',
  'pages/ConvertPDF.tsx',
  'pages/CompressPDF.tsx',
  'contexts/AuthContext.tsx'
];

for (const file of apiImportFiles) {
  const filePath = path.join(rootDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = content.replace(
      /from ["']@\/lib\/api["']/g,
      'from "@/utils/api"'
    );
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`Updated API import in: ${filePath}`);
    }
  }
}

// Process all TypeScript/TSX files for utils imports
processDirectory(rootDir);

console.log('Import updates completed!');
