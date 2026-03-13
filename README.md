# JavaLab - Online Java Editor

A high-performance Java code runner with syntax highlighting and instant compilation.

## Prerequisites
- Node.js installed
- Java JDK installed and `javac/java` available in your system PATH.

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the Frontend (Vite):**
   ```bash
   npm run dev
   ```

3. **Start the Execution Backend:**
   ```bash
   npm run server
   ```

4. **Open your browser:**
   Go to `http://localhost:3000`

## Features
- **Monaco Editor:** VS Code-like coding experience.
- **File Management:** Import from your computer or download your code as `Main.java`.
- **Session Persistence:** Code is automatically saved to LocalStorage.
- **Safety:** Backend runs code in isolated temporary directories with a 5s execution limit.