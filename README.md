# JavaLab

A modern Java online IDE built with React and Node.js.

## Prerequisites
- Node.js installed
- JDK (Java Development Kit) installed and `javac`/`java` in your PATH.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the backend server:
   ```bash
   npm run server
   ```

3. In a new terminal, run the frontend:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

## Features
- Monaco Editor (VS Code style)
- Java Syntax Highlighting
- Live Compilation via Node.js backend
- Secured via temporary file sandboxing and 5s execution timeout
- LocalStorage session saving
- Keyboard Shortcut: `Ctrl+Enter` to run code