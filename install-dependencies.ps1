# PowerShell script to install additional dependencies for GTD Agent

Write-Host "Installing additional dependencies..." -ForegroundColor Green

# Install state management
npm install zustand

# UI component library dependencies
npm install class-variance-authority clsx tailwind-merge lucide-react

# IndexedDB wrapper
npm install idb

# Date handling
npm install date-fns

# PWA support
npm install next-pwa

# Form handling
npm install react-hook-form @hookform/resolvers zod

# Development dependencies
npm install -D @types/node @types/react @types/react-dom

Write-Host "All dependencies installed successfully!" -ForegroundColor Green

