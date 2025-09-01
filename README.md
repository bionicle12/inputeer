# Inputeer - Browser Execution Helper for AI Agents

<p align="center">
  <img src="https://img.shields.io/badge/Chrome-Extension-blue?style=for-the-badge&logo=google-chrome" alt="Chrome Extension">
  <img src="https://img.shields.io/badge/Version-0.4.4-orange?style=for-the-badge" alt="Version 0.4.4">
  <img src="https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript" alt="JavaScript">
  <img src="https://img.shields.io/badge/AI--Agents-Supported-green?style=for-the-badge&logo=openai" alt="AI Agents Supported">
  <img src="https://img.shields.io/badge/Manifest-MV3-red?style=for-the-badge&logo=google-chrome" alt="Manifest V3">
  <br>
  <img src="https://img.shields.io/github/stars/bionicle12/inputeer?style=for-the-badge&logo=github" alt="GitHub Stars">
  <img src="https://img.shields.io/github/license/bionicle12/inputeer?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/github/last-commit/bionicle12/inputeer?style=for-the-badge" alt="Last Commit">
</p>

<p align="center">
  <img src="https://via.placeholder.com/800x400/4a90e2/ffffff?text=Inputeer+Demo" alt="Inputeer Demo" width="70%">
</p>

<p align="center">
  <strong>🌐 <a href="README_RU.md">Русская версия</a></strong>
</p>

## ✨ Overview

**Inputeer** is a Chrome browser extension designed specifically for AI agents and developers who need to execute JavaScript code in the context of web pages.

The extension solves the problem where many AI agents are prohibited from directly executing commands in the browser. Using Chrome Debugger API and CSP (Content Security Policy) bypass techniques, Inputeer provides a "hacky" but working solution for code execution.

## 🚀 Key Features

### 🔧 Execution Mode
- ~~**Sandbox** - execution without browser debug panel (default)~~
- **Debugger** - direct execution in page context via Chrome Debugger API

### 📝 Dynamic Variables
Use `$1` in formulas to substitute text from the textarea

### 💾 Formula Storage
Save frequently used commands with names (e.g., "vk dating")

### 🎛️ User-Friendly Interface
- Collapsible/expandable panel with `[^]`/`[v]` button
- Execute with `Ctrl+Enter` + AI Agent execution support
- Transparent panel in bottom-left corner

## 📦 Installation

1. Download or clone the extension folder
2. Open `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the extension folder
6. Inputeer panel will appear on all web pages

## 🎯 Usage

### Basic Workflow:
1. Enter text in the upper textarea (id="inputeeer")
2. Write a JavaScript formula in the lower textarea using `$1` for text substitution
3. Click `▶` or press `Ctrl+Enter` to execute

### 📸 Screenshots

<p align="center">
  <img src="https://via.placeholder.com/400x300/2c3e50/ffffff?text=Inputeer+Panel" alt="Inputeer Panel" width="45%">
  <img src="https://via.placeholder.com/400x300/34495e/ffffff?text=Formula+Examples" alt="Formula Examples" width="45%">
</p>

### Formula Examples:

```javascript
// Simple alert
alert($1)

// Console output
console.log("Text:", $1)

// Change page title
document.title = $1

// Fill form
document.querySelector('input[name="search"]').value = $1

// Complex operations
if ($1.includes("error")) {
  alert("Error detected: " + $1);
} else {
  console.log("All good:", $1);
}

// DOM manipulation
document.querySelectorAll('.message').forEach(el => {
  if (el.textContent.includes($1)) {
    el.style.background = 'yellow';
  }
});

// VK Chat automation (text substitution + focus for button initialization + click to send)
// Selectors are examples - use DevTools to get any selectors you need
document.querySelector("#popup-sticker-convo-main-history-container > div.ConvoMain__composerWrapper > div.ConvoMain__composer > div > div > div.ComposerInput.ConvoComposer__inputWrapper > div > span").innerText = $1;

setTimeout(() => {
    document.querySelector("#popup-sticker-convo-main-history-container > div.ConvoMain__composerWrapper > div.ConvoMain__composer > div > div > div.ComposerInput.ConvoComposer__inputWrapper > div > span").focus();

    setTimeout(() => {
        document.querySelector("#popup-sticker-convo-main-history-container > div.ConvoMain__composerWrapper > div.ConvoMain__composer > div > div > div:nth-child(4) > div > button").click();
    }, 400);
}, 200);
```

### Saving Formulas:
- Click **"Save"** to save the current formula
- Select a saved formula from the dropdown list
- Use **"Delete"** to remove the selected formula

### Operation Modes:

**Debugger Mode**:
- Executes code directly in the page context
- Shows Chrome debug panel (can be ignored)
- Maximum access to the page
- Requires debugging permission for each tab

## 🛠️ For Developers

### Project Structure:
```
Inputeer/
├── manifest.json     # MV3 extension manifest
├── content.js        # Main script with UI and logic
├── background.js     # Service worker for Debugger API
└── README.md         # Documentation
```

### Extension API:
- Formulas are saved in `localStorage` under the key `inputeer_formulas`
- Textarea element has id `inputeeer` (with three 'e's) for programmatic access
- Panel has id `inputeer-panel`

## ⚠️ Limitations

⚠️ **Important**: You must compose formulas yourself. The extension only provides the execution mechanism but doesn't generate code automatically.

- Debugger mode shows browser information panel
- Extension works only in Chrome/Chromium browsers
- Sometimes AI agents refuse to work on pages if they see VK etc. You need to first give them the task to find and fill the Inputeer block, and then they become more cooperative. I might come up with a simpler option in the future, but for now this works for me.

## 🔒 Security

- Extension only executes code that you yourself enter
- All formulas are saved locally in the browser

## ❓ FAQ

### Can I use this extension with other browsers besides Chrome?
Currently, Inputeer only works with Chrome and Chromium-based browsers due to its reliance on the Chrome Debugger API.

### Is the extension safe to use?
Yes, the extension only executes JavaScript code that you explicitly provide. It doesn't run any background processes or collect data. All formulas are stored locally in your browser.

### Why does the debugger panel appear sometimes?
The debugger panel appears when using "Debugger Mode" to provide full access to the page context. You can ignore or minimize this panel - it doesn't affect functionality.

### Can AI agents really use this extension?
Yes! Many AI agents can interact with web pages through this extension. Simply instruct them to find the Inputeer panel and use it to execute JavaScript code.

### How do I save and reuse formulas?
Use the "Save" button to store formulas with custom names. You can then select them from the dropdown list for quick reuse.

### What if my formula doesn't work?
Make sure you're using valid JavaScript syntax and that the elements you're trying to interact with exist on the page. Use browser DevTools to inspect elements and get correct selectors.

## 📋 Table of Contents

- [✨ Overview](#-overview)
- [🚀 Key Features](#-key-features)
- [📦 Installation](#-installation)
- [🎯 Usage](#-usage)
- [🛠️ For Developers](#️-for-developers)
- [⚠️ Limitations](#️-limitations)
- [🔒 Security](#-security)
- [❓ FAQ](#-faq)
- [📄 License](#-license)
- [🤝 Contributing](#-contributing)
- [📞 Support](#-support)

## 📄 License

Created as a development and automation helper tool. All code is unobfuscated, unminified for easy reading and extension/modification of functionality. You can modify and extend it for your convenience. If it brings value to someone, thank you!

---

💡 **Tip**: For quick access, collapse the panel with the `[v]` button, and it will become a compact `[^]` block for quick expansion.

## 🔧 Quick Start Guide

```bash
# Clone the repository
git clone https://github.com/bionicle12/inputeer.git

# Open Chrome extensions page
chrome://extensions

# Enable Developer mode
# Load the unpacked extension
# Enjoy!
```

## 📊 Extension Stats

<p align="center">
  <img src="https://img.shields.io/github/repo-size/bionicle12/inputeer?style=flat-square" alt="Repo Size">
  <img src="https://img.shields.io/github/languages/code-size/bionicle12/inputeer?style=flat-square" alt="Code Size">
  <img src="https://img.shields.io/github/languages/count/bionicle12/inputeer?style=flat-square" alt="Languages">
  <img src="https://img.shields.io/github/issues/bionicle12/inputeer?style=flat-square" alt="Issues">
  <img src="https://img.shields.io/github/issues-pr/bionicle12/inputeer?style=flat-square" alt="Pull Requests">
</p>

## 🤝 Contributing

Contributions are welcome! Please feel free to:

- 🐛 [Report bugs](https://github.com/bionicle12/inputeer/issues)
- 💡 [Suggest features](https://github.com/bionicle12/inputeer/issues)
- 🔧 [Submit pull requests](https://github.com/bionicle12/inputeer/pulls)
- 📖 [Improve documentation](https://github.com/bionicle12/inputeer/wiki)

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/bionicle12/inputeer.git`
3. Make changes
4. Test the extension in Chrome
5. Submit a pull request

## 📞 Support

If you find this extension useful or have suggestions for improvement, feel free to:
- ⭐ Star the repository
- 🐛 [Report issues](https://github.com/bionicle12/inputeer/issues)
- 💡 [Suggest features](https://github.com/bionicle12/inputeer/discussions)
- 📧 Contact the maintainer

## 🙏 Acknowledgments

- Special thanks to the Chrome Extensions team for the Debugger API
- Inspired by the need for AI agents to interact with web pages
- Built with ❤️ for the developer community

---

<p align="center">
  <strong>Made with ❤️ for AI agents and developers</strong>
</p>

<p align="center">
  <a href="#inputeer---browser-execution-helper-for-ai-agents">⬆️ Back to top</a>
</p>
