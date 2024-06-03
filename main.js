let originalDocumentHTML = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'run') {
    if (!originalDocumentHTML) {
      originalDocumentHTML = document.documentElement.cloneNode(true);
    } else {
      location.reload();
      return;
    }

    const documentHTML = document.documentElement.cloneNode(true);
    injectCustomDOM(documentHTML);

    chrome.runtime.sendMessage({ action: "insertCSS", style: "css.css" });
    chrome.runtime.sendMessage({ action: "insertHTML" });
  }
});

function injectCustomDOM(documentHTML) {
  const cssVariablesStyle = extractAndCreateCSSVariablesStyle();

  const newHTML = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <link href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css" rel="stylesheet"/>
      </head>
      <body>
        <aside>
          <header class="w3ba11y__header">
            <img src="${chrome.runtime.getURL('/static/img/logo.png')}" alt="Logo" width="100px">
            <h1>w3ba11y</h1>
          </header>
        </aside>
        <main></main>
      </body>
    </html>
  `;

  document.documentElement.innerHTML = newHTML;

  const main = document.querySelector('main');
  const shadowRoot = main.attachShadow({ mode: 'open' });
  shadowRoot.appendChild(documentHTML);

  appendStylesToShadowRoot(shadowRoot, cssVariablesStyle, createCustomStyles());
}

function extractAndCreateCSSVariablesStyle() {
  const res = {};

  if ("computedStyleMap" in document.documentElement) {
    const styles = document.documentElement.computedStyleMap();
    Array.from(styles).forEach(([prop, val]) => {
      if (prop.startsWith("--")) {
        res[prop] = val.toString();
      }
    });
  } else {
    const styles = getComputedStyle(document.documentElement);
    for (let i = 0; i < styles.length; i++) {
      const propertyName = styles[i];
      if (propertyName.startsWith("--")) {
        const value = styles.getPropertyValue(propertyName);
        res[propertyName] = value;
      }
    }
  }

  let cssVariablesText = ':host {';
  for (const [key, value] of Object.entries(res)) {
    cssVariablesText += `${key}: ${value};`;
  }
  cssVariablesText += '}';

  const styleElement = document.createElement('style');
  styleElement.textContent = cssVariablesText;

  return styleElement;
}
function createCustomStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .highlight { border: 4px solid red !important; }
  `;
  return styleElement;
}

function appendStylesToShadowRoot(shadowRoot, ...styles) {
  styles.forEach(style => shadowRoot.appendChild(style));
}
