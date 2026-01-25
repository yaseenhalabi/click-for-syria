# Click for Syria Chrome Extension

A Chrome extension built with React, TypeScript, and Vite to help support humanitarian efforts in Syria.

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
