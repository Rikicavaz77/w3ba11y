[![codecov](https://codecov.io/gh/Rikicavaz77/w3ba11y/graph/badge.svg?token=1CR8AZRW61)](https://codecov.io/gh/Rikicavaz77/w3ba11y)
[![Workflow status badge](https://github.com/Rikicavaz77/w3ba11y/actions/workflows/test.yml/badge.svg)](https://github.com/Rikicavaz77/w3ba11y/actions/workflows/test.yml)
[![GitHub release (latest by tag)](https://img.shields.io/github/v/release/Rikicavaz77/w3ba11y)](https://github.com/Rikicavaz77/w3ba11y/releases)
[![GitHub release date](https://img.shields.io/github/release-date/Rikicavaz77/w3ba11y)](https://github.com/Rikicavaz77/w3ba11y/releases)
[![Language](https://img.shields.io/github/languages/top/Rikicavaz77/w3ba11y)](https://github.com/Rikicavaz77/w3ba11y)

<div align="center">
  <img src="static/img/icon.png" alt="w3ba11y logo" width="120" height="120">
  <h3 align="center">📘w3ba11y - User Manual</h3>
  <p align="center">
    <em>"For better accessibility and seo optimization..."</em>
    <br />
    <a href="https://github.com/Rikicavaz77/Stage-Docs"><strong>Explore the docs »</strong></a>
  </p>
</div>

<details>
  <summary><strong>Table of Contents</strong></summary>
  <ol>
    <li>
      📦<a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">🛠️Built With</a></li>
        <li><a href="#structure">📁Structure</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">🔧Getting Started</a>
      <ul>
        <li><a href="#prerequisites">⚙️Prerequisites</a></li>
        <li><a href="#installation">💾Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">🚀Usage</a></li>
    <li><a href="#bug-report">🐞Bug Report</a></li>
    <li><a href="#usage-terms">🔒Usage Terms</a></li>
    <li><a href="#contacts">📬Contacts</a></li>
    <li><a href="#credits">📝Credits</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## 📦About The Project

**w3ba11y** is a browser extension designed to analyze and improve the accessibility and SEO optimization of websites.  

It is being developed as part of a university project shared among multiple interns.

The extension allows users to inspect headings, keywords, images, and other on-page content relevant to accessibility or SEO.

### 🛠️Built With

- [**JavaScript**](https://developer.mozilla.org/en-US/docs/Web/JavaScript): core logic and browser scripting;
- [**HTML5**](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5): markup and structure;
- [**CSS3**](https://developer.mozilla.org/en-US/docs/Web/CSS): custom styles and layout;
- [**Chrome Extensions API**](https://developer.chrome.com/docs/extensions?hl=en): extension architecture (Manifest V3);
- [**Jest**](https://jestjs.io): testing framework; 
- **Icons**:
    - [**Remix Icon**](https://remixicon.com);
    - [**Font Awesome**](https://fontawesome.com);
    - [**Heroicons**](https://heroicons.com).
- [**Stopword**](https://github.com/fergiemcdowall/stopword) - JavaScript third-party module by Fergus McDowall *(MIT Licensed)*. 

### 📁Structure

The project follows the **MVC** (Model-View-Controller) architectural pattern to ensure a clear separation of concerns.

<details>
  <summary><strong>Show Structure</strong></summary>
  <pre>
  .
  ├── main.js    
  ├── background.js      
  ├── interface.js       
  ├── manifest.json         
  ├── .github/
  │   └── workflows/                
  ├── heading/
  │   ├── main.js                   
  │   ├── controller/               
  │   ├── model/                    
  │   └── view/                     
  ├── img/
  │   ├── main.js                   
  │   ├── controller/               
  │   ├── model/                   
  │   └── view/                     
  ├── keyword/
  │   ├── main.js                   
  │   ├── controller/               
  │   ├── model/                    
  │   ├── services/
  │   │   └── strategy/             
  │   ├── utils/                    
  │   ├── view/                     
  │   └── tests/                    
  └── static/                      
      ├── fonts/                   
      ├── img/                     
      └── libs/    
  </pre>          
</details>   

<!-- GETTING STARTED -->
## 🔧Getting Started

This section provides instructions to run the extension locally.

### ⚙️Prerequisites

To run the extension, you need:

- A modern Chromium-based browser (e.g., Google Chrome, Microsoft Edge);
- An active Internet connection.

### 💾Installation

1. Download the extension code by either:
    - Cloning this repository:

      ```bash
      git clone https://github.com/Rikicavaz77/w3ba11y.git
      ```

    - Or downloading it as a ZIP archive from [GitHub](https://github.com/Rikicavaz77/w3ba11y/archive/refs/heads/main.zip) and extracting it.
2. Open the extensions page in your browser:  
    - For **Chrome**:

      ```text
      chrome://extensions/
      ```

    - For **Microsoft Edge**:

      ```text
      edge://extensions/
      ```
3. Enable **Developer mode** (top right toggle);
4. Click **Load unpacked**;
5. Select the root folder of the project (the one containing `manifest.json`).

The extension will now be loaded and available in your browser.

<!-- USAGE -->
## 🚀Usage

Once the extension is installed and loaded in your browser:

1. Navigate to any webpage you want to analyze;
2. Click on the extension icon in the browser toolbar;
3. A left sidebar will appear, allowing you to:
    - 📚 Inspect heading structure (H1–H6);
    - 🖼️ Inspect images and check for missing alt attributes;
    - 🔑 Analyze and visually highlight keyword distribution;
    - ℹ️ Get general information about other accessibility and SEO metrics.

#### 📚Headings

This feature analyzes the **heading hierarchy**. Any headings that do not follow a consistent structure will be flagged as incorrect.

#### 🖼️Images

This feature collects images on the page, including purely decorative ones inserted via CSS. In addition to checking for the presence of **alternative text** (alt attributes), the extension also analyzes image **sizes**. A general summary is provided, highlighting any errors or warnings, along with filtering options for easier navigation. A detailed list of detected images is also generated, each accompanied by specific information (such as alt text, size, etc.) and related status messages. It is also possible to **visually highlight** an image directly on the page.

#### 🔑Keywords

This feature provides a general overview of the **on-page SEO analysis**:
- Meta keywords tag content;
- Page language;
- Total word count;
- Unique word count.

These values serve as a base for keyword analysis. The interface is divided into four lists: meta keywords, user-defined keywords, most frequent single-word and two-word keywords. Each list can be sorted and filtered.

The keyword analysis results include:
- **Frequency** (warning if 0);
- **Density** (warning if 0%);
- Number of occurrences within a predefined set of **semantic tags**.

Each keyword can be **visually highlighted** within the page. User-defined keywords can be highlighted even if they are not included in any list. Each occurrence is styled with different background, text, and border colors based on the semantic tag that contains it (colors are customizable via settings).

The analysis is performed on a static copy of the DOM to ensure consistency across all keywords. A dedicated button allows for global reanalysis at any time.

<!-- BUG REPORT -->
## 🐞Bug Report

If you encounter any bugs or unexpected behavior while using the extension, feel free to open an issue in this repository:

🔗 [Submit a Bug Report](https://github.com/Rikicavaz77/w3ba11y/issues)

When reporting a bug, please include:
- A clear and concise description of the issue;
- Steps to reproduce the problem;
- The browser version and operating system;
- (Optional) Screenshots or console logs.

<!-- LICENSE -->
## 🔒Usage Terms

This repository is a fork of [fabbricca/w3ba11y](https://github.com/fabbricca/w3ba11y), which was developed as part of a **university project** and does not include an open-source license.  

As such, this fork inherits the original copyright restrictions.

All rights to the original code remain with its author(s). See `manifest.json` for details. 

You are permitted to **download and use the extension locally** by cloning this repository or downloading the ZIP archive.

Any public fork, redistribution, or reuse must be explicitly approved by the copyright holder(s) or the commissioning institution.

This fork was created with the permission of the original project's commissioner, as part of an ongoing academic project.  

**All rights reserved**.

<!-- CONTACTS -->
## 📬Contacts

For questions or support requests:

📧 **Email:**
1. [riccardo.cavalli@studenti.unipd.it](mailto:riccardo.cavalli@studenti.unipd.it)
2. [rikicavalli2002@gmail.com](mailto:rikicavalli2002@gmail.com)

<!-- CREDITS -->
## 📝Credits

The icons used in this project are provided by:

- [**Font Awesome**](https://fontawesome.com): a vast library of free and premium vector icons;
- [**Heroicons**](https://heroicons.com): a collection of hand-crafted SVG icons, by the makers of Tailwind CSS;
- [**Remix Icon**](https://remixicon.com): an open-source library of carefully crafted icons.
