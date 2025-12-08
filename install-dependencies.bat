@echo off
echo Installing additional dependencies...

REM Install state management
call npm install zustand

REM UI component library dependencies
call npm install class-variance-authority clsx tailwind-merge lucide-react

REM IndexedDB wrapper
call npm install idb

REM Date handling
call npm install date-fns

REM PWA support
call npm install next-pwa

REM Form handling
call npm install react-hook-form @hookform/resolvers zod

REM Development dependencies
call npm install -D @types/node @types/react @types/react-dom

echo All dependencies installed successfully!
pause

