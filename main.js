let originalDocumentHTML = null;

window.addEventListener('load', () => {
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
    }
  });
});

function injectCustomDOM(documentHTML) {

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
  const iframe = document.createElement('iframe');
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.src = window.location.href;
  shadowRoot.appendChild(iframe);

  iframe.onload = () => {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.head.appendChild(createCustomStyles());

    console.log("Iframe loaded successfully.");
    chrome.runtime.sendMessage({ action: "insertHTML" });
  };
}


function createCustomStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .highlight { border: 4px solid red !important; }
  `;
  return styleElement;
}