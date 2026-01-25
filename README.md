# Click for Syria Chrome Extension

**Click for Syria** is a browser extension dedicated to supporting humanitarian efforts in Syria. Millions of people in Syria are currently facing severe humanitarian crises, and this tool aims to simplify the process of taking action—whether through awareness, outreach, or direct support. 

To learn more about the cause and how you can help beyond this extension, visit [unblocksyria.com](https://unblocksyria.com).

This project is built with React, TypeScript, and Vite to provide a seamless and effective user experience.


## 🚀 Quick Start (Installation)

If you just want to use the extension, follow these steps:

1. **Download**: Download the latest release ZIP file: [click-for-syria-v1.0.0.zip](./click-for-syria-v1.0.0.zip)
2. **Extract**: Unzip the file to a folder on your computer.
3. **Open Extensions**: In Chrome, go to `chrome://extensions/`.
4. **Developer Mode**: Toggle **"Developer mode"** (top right) to ON.
5. **Load Extension**: Click **"Load unpacked"** and select the **`dist`** folder from your extracted files.

## 🛠 For Developers

### Setup
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```
This will generate a `dist` folder ready for packaging.

## Features
- Shared configuration for blocked sites.
- Dynamic manifest generation using CRXJS.
- Injected React overlay via Shadow DOM.
- Integrated Instagram Post Generator and Email Outreach tools.
