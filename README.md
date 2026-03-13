# JavaLab

A modern, responsive Java IDE in your browser.

## Fixed Deployment & Issues:
1.  **Mobile Support**: Adjusted layout from `flex flex-row` to `flex-col md:flex-row`.
2.  **Vercel/Build Fix**: Added `react` and `react-dom` to regular dependencies (fixed common Vercel build missing dep error).
3.  **Local Storage**: Integrated `localStorage` to persist code across refreshes.
4.  **Import/Export**: Added file upload and download functionality for `.java` files.

## Local Setup:
1. `npm install`
2. Run backend: `node server.js`
3. Run frontend: `npm run dev`

Note: The backend requires a local Java JDK installed (`javac` and `java` in PATH). Serverless platforms like Vercel won't run `child_process` execution of Java; for production use, host the backend on a VPS or Docker container with JDK installed.