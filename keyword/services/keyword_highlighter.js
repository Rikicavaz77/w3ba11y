class KeywordHighlighter {
  constructor(textProcessor) {
    this._textProcessor = textProcessor;
    this._colorMap = {
      h1:     { bg: "#eb9fc5", color: "#560e63", border: "#af0bcc" },
      h2:     { bg: "#ffae90", color: "#8e282a", border: "#e53935" },
      h3:     { bg: "#fff94f", color: "#c24315", border: "#ffa588" },
      h4:     { bg: "#1984b5", color: "#000048", border: "#bfd5e2" },
      h5:     { bg: "#00ff8c", color: "#0c5f09", border: "#81e392" },
      h6:     { bg: "#fc7faa", color: "#790041", border: "#d81b60" },
      p:      { bg: "#c8e6c9", color: "#007032", border: "#66bb6a" },
      strong: { bg: "#eb0f0f", color: "#000022", border: "#e77f45" },
      em:     { bg: "#e281fa", color: "#501f6d", border: "#d98ae0" },
      a:      { bg: "#81d4fa", color: "#0d47a1", border: "#0288d1" },
      li:     { bg: "#ff6f00", color: "#562020", border: "#e68c19" }
    };
    this._injectHighlightBlock();
  }

  get doc() {
    return this._textProcessor.doc;
  }

  get root() {
    return this._textProcessor.root;
  }

  get colorMap() {
    return this._colorMap;
  }

  updateTagColors(tag, prop, value) {
    if (!this._colorMap[tag]) return;
    if (!['bg', 'color', 'border'].includes(prop)) return;
    this._colorMap[tag][prop] = value;
    this._injectHighlightBlock();
  }

  _injectHighlightBlock() {
    const staticCSS = `
      .w3ba11y__highlight-keyword {
        --highlight-bg-color: #98746d;
        --highlight-color: #011502;
        --highlight-border-color: #ba9588;
        background: linear-gradient(to right, var(--highlight-bg-color), rgba(255, 255, 255, 0.4));
        color: var(--highlight-color);
        position: relative;
        display: inline-block;
        padding: 0.2em 1em;
        border-radius: 6px;
        border: 2px solid var(--highlight-border-color);
      }
      .w3ba11y__highlight-keyword::before {
        font-size: calc((0.6em + 0.6rem) / 2);
        background-color: #000;
        color: #fff;
        content: attr(data-parent);
        text-transform: capitalize;
        position: absolute;
        top: -4px;
        left: -2px;
        padding: 0 0.2em;
        border-radius: 6px;
      }
    `;

    const dynamicCSS = Object.entries(this._colorMap)
      .map(([key, value]) => `
        .w3ba11y__highlight-keyword[data-parent="${key}"] {
          --highlight-bg-color: ${value.bg};
          --highlight-color: ${value.color};
          --highlight-border-color: ${value.border};
        }
      `).join('\n');

    let styleEl = this.doc.getElementById('w3ba11y-highlight-keyword-style-override');
    if (!styleEl) {
      styleEl = this.doc.createElement('style');
      styleEl.id = 'w3ba11y-highlight-keyword-style-override';
      this.doc.head.appendChild(styleEl);
    }
    styleEl.textContent = staticCSS + dynamicCSS;
  }

  removeHighlight() {
    const highlightedKeywords = this.root.querySelectorAll('.w3ba11y__highlight-keyword');
    highlightedKeywords.forEach(element => {
      const newTextNode = this.doc.createTextNode(element.textContent);
      element.parentNode.replaceChild(newTextNode, element);
    });
  }

  highlightKeyword(keyword) {
    this.removeHighlight();
    const textNodes = this._textProcessor.getTextNodes();
    const pattern = this._textProcessor.getKeywordPattern(keyword, { capture: true, flags: 'iu' });
  
    textNodes.forEach(node => {
      if (pattern.test(node.nodeValue)) {
        const fragment = this.doc.createDocumentFragment();
        const parts = node.nodeValue.split(pattern);
        const parent = this._textProcessor.getParentName(node);

        let isMatch = false;
        parts.forEach((part, index) => {
          if (index % 2 === 1) {
            isMatch = true;
          } else {
            isMatch = false;
          }
          
          if (part !== "" && isMatch) {
            const span = this.doc.createElement("span");
            span.classList.add("w3ba11y__highlight-keyword");
            span.dataset.parent = parent.toLowerCase();
            span.textContent = part;
            fragment.appendChild(span);
          } else if (part !== "") {
            const newTextNode = this.doc.createTextNode(part);
            fragment.appendChild(newTextNode);
          }
        });
  
        node.parentNode.replaceChild(fragment, node);
      }
    });
  }
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = KeywordHighlighter;
}
