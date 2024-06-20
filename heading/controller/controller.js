class HController {
  constructor(iframe) {
    this.view = new HView(iframe);
    this.model;
    this.init();
  }

  init() {
    const hList = this.findAllHeadings(this.view.iframe);

    this.model = hList.map((h, i) => {
        let parent = null;

        if (i !== 0) {
            for (let j = i - 1; j >= 0; j--) {
                if (hList[j].level < h.level) {
                    parent = hList[j];
                    break;
                }
            }
        }
        return new HModel(h.tag, h.level, h.text, parent);
    });

    const hData = [];
    this.model.forEach(h => hData.push(h.getHeadingData()));
    this.view.render(hData);
}


  findAllHeadings(doc) {
    const searchDOM = (doc) => {
      const isVisible = (node) => {
        while (node) {
          const style = window.getComputedStyle(node);
          if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
            return false;
          }
          node = node.parentElement;
        }
        return true;
      };
    
      const collectHeadingsFromNode = (node, collection) => {
        if (/^h[1-6]$/i.test(node.tagName)) {
          collection.push({
            tag: node.tagName,
            level: parseInt(node.tagName.substring(1), 10),
            node: node,
            text: node.textContent,
            isVisible: isVisible(node)
          });
        }
      };
    
      try {
        return Array.from(doc.querySelectorAll('*')).reduce((collection, node) => {
          collectHeadingsFromNode(node, collection);
          return collection;
        }, []);
      } catch (e) {
        return [];
      }
    };

    return searchDOM(doc);
  }
}