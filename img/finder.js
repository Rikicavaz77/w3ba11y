function getImgAll(doc) {
    return new Promise((resolve, reject) => {
      loadImgAll(Array.from(searchDOM(doc)))
        .then(resolve, reject);
    });
  
    function searchDOM(doc) {
      const srcChecker = /url\(\s*?['"]?\s*?(\S+?)\s*?["']?\s*?\)/i;
    
      function collectImagesFromNode(node, collection) {
        let prop = window.getComputedStyle(node, null).getPropertyValue('background-image');
        let match = srcChecker.exec(prop);
        if (match) {
          collection.add({ src: match[1], node, isBackground: true });
        }

        if (node.style && node.style.backgroundImage) {
          match = srcChecker.exec(node.style.backgroundImage);
          if (match) {
            collection.add({ src: match[1], node, isBackground: true });
          }
        }
    
        if (/^img$/i.test(node.tagName)) {
          if (node.src != '') collection.add({ src: node.src, node, isBackground: false });
          else if (node.dataset.src) collection.add({ src: node.dataset.src, node, isBackground: false });
        } 

        else if (/^frame$/i.test(node.tagName)) {
          try {
            searchDOM(node.contentDocument || node.contentWindow.document)
              .forEach(img => {
                if (img) { collection.add(img); }
              });
          } catch (e) {}
        }
      }

      return Array.from(doc.querySelectorAll('*'))
        .reduce((collection, node) => {
          collectImagesFromNode(node, collection);
          return collection;
        }, new Set());
    }
  
    function getEstimatedMemorySize(width, height, src) {
      const ext = src.split('.').pop().toLowerCase();
      let bytesPerPixel;
      switch (ext) {
        case 'jpg':
        case 'jpeg':
          bytesPerPixel = 1.5;
          break;
        case 'png':
          bytesPerPixel = 3;
          break;
        case 'gif':
          bytesPerPixel = 1;
          break;
        default:
          bytesPerPixel = 4;
      }
      return Math.ceil(width * height * bytesPerPixel);
    }
  
    function loadImg(srcObj, timeout = 10000) {
      const { src, node, isBackground } = srcObj;
  
      var imgPromise = new Promise((resolve, reject) => {
          const cleanUrl = src.replace(/[?#].*$/, '');
          const fileName = cleanUrl.substring(cleanUrl.lastIndexOf('/') + 1);
          let memorySize = 0;
          const resources = performance.getEntriesByType('resource');
          const resource = resources.find(res => res.name === src);
  
          if (resource && resource.decodedBodySize) {
              memorySize = (resource.decodedBodySize / 1024).toFixed(2);
              resolve({
                  node: node,
                  src: src,
                  width: node.naturalWidth,
                  height: node.naturalHeight,
                  memorySize: memorySize,
                  alt: isBackground ? null : node.alt || '',
                  backgroundImage: isBackground,
                  id: node.id || '',
              });
          } else {
              let img = new Image();
              img.onload = () => {
                  memorySize = (getEstimatedMemorySize(img.naturalWidth, img.naturalHeight, fileName) / 1024).toFixed(2);
                  resolve({
                      node: node,
                      src: src,
                      width: img.naturalWidth,
                      height: img.naturalHeight,
                      memorySize: memorySize,
                      alt: isBackground ? null : node.alt || '',
                      backgroundImage: isBackground,
                      id: node.id || '',
                  });
              };
              img.onerror = reject;
              img.src = src;
          }
      });
  
      var timer = new Promise((resolve, reject) => {
          setTimeout(reject, timeout);
      });
  
      return Promise.race([imgPromise, timer]);
  }
  
    function loadImgAll(imgList, timeout = 10000) {
      return new Promise((resolve, reject) => {
        Promise.all(
          imgList
            .map(srcObj => loadImg(srcObj, timeout))
            .map(p => p.catch(e => false))
        ).then(results => resolve(results.filter(r => r)));
      });
    }
}