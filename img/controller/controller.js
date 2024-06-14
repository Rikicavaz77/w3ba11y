class ImgController {
  constructor(view) {
    this.BATCH_SIZE = 100;
    this.view = view;
    this.eventHandlers = {
      changeTab: this.view.changeTab.bind(this.view),
      show: this.view.show.bind(this.view),
      more: this.view.more.bind(this.view),
      updateDefaultStatus: this.view.updateDefaultStatus.bind(this.view),
      updateAddNoteStatus: this.view.updateAddNoteStatus.bind(this.view),
      addCustomStatus: this.view.addCustomStatus.bind(this.view),
      removeCustomStatus: this.view.removeCustomStatus.bind(this.view),
    };
  
    this.findAllImgs(this.view.iframe).then(list => {
      const imgInstances = list.map((img, index) => new ImgModel(
        img.node, 
        img.src, 
        `w3ba11y_imgTag_${index}`,
        img.width, 
        img.height, 
        img.memorySize, 
        img.backgroundImage,
        img.isVisible, 
        img.alt, 
        img.id
      ));
  
      Promise.all(imgInstances).then((resolvedInstances) => {
        this.model = resolvedInstances;

        const customErrors = this.model.flatMap(img => img.getErrors ? img.getErrors() : []);
        const customWarnings = this.model.flatMap(img => img.getWarnings ? img.getWarnings() : []);
        const imagesData = [];

        this.model.slice(0, this.BATCH_SIZE).forEach(img => imagesData.push(img.getImageData()));
        this.view.render(imagesData, this.model.length, customErrors, customWarnings);
        this.setupListeners();
      }).catch((error) => {
        console.error("Error processing images:", error);
      });
    });
  }

  findAllImgs(doc) {
    return new Promise((resolve, reject) => {
        loadImgAll(Array.from(searchDOM(doc)))
            .then(resolve, reject);
    });
  
    function searchDOM(doc) {
      const srcChecker = /url\(\s*?['"]?\s*?(\S+?)\s*?["']?\s*?\)/i;

      function isVisible(node) {
        while (node) {
          const style = window.getComputedStyle(node);
          if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
            return false;
          }
          node = node.parentElement;
        }
        return true;
      }

      function collectImagesFromNode(node, collection) {
        let prop = window.getComputedStyle(node, null).getPropertyValue('background-image');
        let match = srcChecker.exec(prop);
        if (match)
          collection.add({ src: match[1], node, isBackground: true, isVisible: isVisible(node) });

        if (/^img$/i.test(node.tagName)) {
          if (node.dataset.src)
            collection.add({ src: node.dataset.src, node, isBackground: false, isVisible: isVisible(node) });
          else if (node.src !== '')
            collection.add({ src: node.src, node, isBackground: false, isVisible: isVisible(node) });
        }

        else if (/^picture$/i.test(node.tagName)) {
          const sources = node.querySelectorAll('source');
          const img = node.querySelector('img');
          sources.forEach(source => {
            if (source.srcset) {
              const srcset = source.srcset.split(',').map(s => s.trim().split(' ')[0]);
              srcset.forEach(src => {
                collection.add({ src, node, isBackground: false, isVisible: isVisible(source) && (src === img.currentSrc) });
              });
            }
          });
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

      try {
        return Array.from(doc.querySelectorAll('*'))
        .reduce((collection, node) => {
          collectImagesFromNode(node, collection);
          return collection;
        }, new Set());
      }
      catch (e) {
        return [];
      }
  }

  function loadImg(srcObj, timeout = 10000) {
    const { src, node, isBackground, isVisible } = srcObj;

    var imgPromise = new Promise((resolve, reject) => {
      let memorySize = 0;
      const resources = performance.getEntriesByType('resource');
      const resource = resources.find(res => {
        const resUrl = new URL(res.name, window.location.href);
        const srcUrl = new URL(src, window.location.href);
        return resUrl.href === srcUrl.href;
      });

      if (resource && resource.decodedBodySize) {
        memorySize = (resource.decodedBodySize / 1024).toFixed(2);
        resolve({
          node: node,
          src: src,
          width: node.naturalWidth,
          height: node.naturalHeight,
          memorySize: memorySize,
          alt: isBackground ? null : (node.alt || node.querySelector('img')?.alt || ''),
          backgroundImage: isBackground,
          isVisible: isVisible,
          id: node.id || '',
        });
      }
      else {
        chrome.runtime.sendMessage({ action: 'fetchImageSize', src: src });
        chrome.runtime.onMessage.addListener((message) => {
          if (message.action === 'fetchImageSizeResponse' && message.src === src) {
            if (message.size) {
              const img = new Image();
              img.src = src;
              img.onload = () => {
                resolve({
                  node: node,
                  src: src,
                  width: img.naturalWidth,
                  height: img.naturalHeight,
                  memorySize: (message.size / 1024).toFixed(2),
                  alt: isBackground ? null : (node.alt || node.querySelector('img')?.alt || ''),
                  backgroundImage: isBackground,
                  isVisible: isVisible,
                  id: node.id || '',
                });
              };
              img.onerror = () => {
                resolve(null);
              }
            }
            else {
              resolve(null);
            }
          }
        });
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

  setupListeners() {
    this.view.container.querySelectorAll('.tab__button').forEach(button => {
      button.addEventListener('click', () => this.eventHandlers.changeTab(button));
    });

    this.view.container.querySelectorAll('.pagination__button').forEach(button => {
      button.addEventListener('click', () => this.changePage(button));
    });

    this.setupImgListeners(0)
  }

  setupImgListeners(index) {
    this.model.slice(parseInt(index) * this.BATCH_SIZE, Math.min((parseInt(index) + 1) * this.BATCH_SIZE, this.model.length)).forEach(img => {
      const imgTag = this.view.container.querySelector(`.${img.hook}`);

      const imgShowButton = imgTag.querySelector('.ri-eye-fill');
      const imgMoreButton = imgTag.querySelector('.ri-arrow-drop-down-line');

      if (imgShowButton) {
        imgShowButton.addEventListener('click', () => this.eventHandlers.show(img.hook));
      }
      
      const handleTagDataClick = () => {
        const imgAltStatusButtons = imgTag.querySelector('.tag__info--alt').querySelectorAll('.status');
        const imgSizeStatusButtons = imgTag.querySelector('.tag__info--size').querySelectorAll('.status');
        const imgDeleteButtons = imgTag.querySelectorAll('.ri-delete-bin-line');
        const imgAddStatusButton = imgTag.querySelectorAll('.form__status');
        const imgAddNoteSubmitButton = imgTag.querySelector('.form__input--submit');

        if (imgMoreButton.classList.contains('ri-arrow-drop-down-line--rotate')) {
          imgAltStatusButtons.forEach(button => button.removeEventListener('click', this.handleAltStatusClick));
          imgSizeStatusButtons.forEach(button => button.removeEventListener('click', this.handleSizeStatusClick));
          imgAddStatusButton.forEach(button => button.removeEventListener('click', this.handleAddStatusClick));
          imgAddNoteSubmitButton.removeEventListener('click', this.handleAddNoteSubmitClick);
          if (imgDeleteButtons) {
            imgDeleteButtons.forEach(button => button.removeEventListener('click', this.handleDeleteClick));
          }
        } else {
          imgAltStatusButtons.forEach(button => {
            button.addEventListener('click', this.handleAltStatusClick = () => {
              img.altStatus = new Status(button.dataset.status, `Image ${button.dataset.status}`, `Image ${button.dataset.status}`);
              const customErrors = this.model.flatMap(img => img.getErrors ? img.getErrors() : []);
              const customWarnings = this.model.flatMap(img => img.getWarnings ? img.getWarnings() : []);
              this.eventHandlers.updateDefaultStatus(customErrors, customWarnings, img.hook, img.getTotalErrors(), img.getTotalWarnings(), '.tag__info--alt', button.dataset.status);
            });
          });
          imgSizeStatusButtons.forEach(button => {
            button.addEventListener('click', this.handleSizeStatusClick = () => {
              img.memorySizeStatus = new Status(button.dataset.status, `Image ${button.dataset.status}`, `Image ${button.dataset.status}`);
              const customErrors = this.model.flatMap(img => img.getErrors ? img.getErrors() : []);
              const customWarnings = this.model.flatMap(img => img.getWarnings ? img.getWarnings() : []);
              this.eventHandlers.updateDefaultStatus(customErrors, customWarnings, img.hook, img.getTotalErrors(), img.getTotalWarnings(), '.tag__info--size', button.dataset.status);
            });
          });
          imgAddStatusButton.forEach(button => {
            button.addEventListener('click', this.handleAddStatusClick = () => {
              this.eventHandlers.updateAddNoteStatus(img.hook, button.dataset.status);
            });
          });
          imgAddNoteSubmitButton.addEventListener('click', this.handleAddNoteSubmitClick = () => {
            const viewData = this.view.getNewCustomStatus(img.hook);

            if (viewData.title === '' || viewData.message === '') {
              return;
            }

            const newStatus = new Status(viewData.status, viewData.title, viewData.message);
            img.addCustomStatus(newStatus);

            const customErrors = this.model.flatMap(img => img.getErrors ? img.getErrors() : []);
            const customWarnings = this.model.flatMap(img => img.getWarnings ? img.getWarnings() : []);
            
            this.eventHandlers.addCustomStatus(customErrors, customWarnings, img.hook, img.getTotalErrors(), img.getTotalWarnings(), newStatus);
            imgMoreButton.click();
            imgMoreButton.click();
          });
          if (imgDeleteButtons) {
            imgDeleteButtons.forEach(button => {
              button.addEventListener('click', this.handleDeleteClick = () => {
                img.deleteCustomStatus(button.dataset.index);
                const customErrors = this.model.flatMap(img => img.getErrors ? img.getErrors() : []);
                const customWarnings = this.model.flatMap(img => img.getWarnings ? img.getWarnings() : []);
                this.eventHandlers.removeCustomStatus(customErrors, customWarnings, img.hook, img.getTotalErrors(), img.getTotalWarnings(), img.customStatus);
                imgMoreButton.click();
                imgMoreButton.click();
              });
            });
          }
        }

        this.eventHandlers.more(img.hook);
      };

      imgMoreButton.addEventListener('click', handleTagDataClick);
    });

    this.view.removeLoading();
  }


  changePage(clickedButton) {
    if (clickedButton === this.view.currentPageButton)
      return;

    const imagesData = [];
    const index = clickedButton.dataset.index;

    this.model.slice(parseInt(index) * this.BATCH_SIZE, Math.min((parseInt(index) + 1) * this.BATCH_SIZE, this.model.length)).forEach(img => imagesData.push(img.getImageData()));
    this.view.changePage(imagesData, clickedButton);
    this.setupImgListeners(index);
  }
}