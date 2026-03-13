# JavaLab - Online Editor

This is a full-stack Java code runner.

## Quick Start
1. Install dependencies: `npm install`
2. Start the runner backend: `node server.js`
3. Start the frontend: `npm run dev`

## Deployment
For Vercel/Netlify, note that standard serverless functions cannot run `javac` or `java` as the JDK is usually not included in the runtime environment. This project works best on a VPS (DigitalOcean/Linode) or Railway.app where you can install a JDK.

## Features
- Full Monaco Editor with Java Syntax highlighting
- Responsive mobile/desktop layout
- LocalStorage persistence
- Import/Export `.java` files
- Execution timeouts and sandboxed directory logic