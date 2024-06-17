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
    this.model;
    this.filter = {};
  
    this.init();
  }


  // INIT FUNCTION
  async init() {
    const imgList = await this.findAllImgs(this.view.iframe);
    const imgInstances = imgList.map((img, index) => new ImgModel(
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
    this.model = await Promise.all(imgInstances);
    this.renderView();
    this.setupTabListeners();
    this.setupPaginationListeners();
    this.setupFilterListeners();
    this.setupImgListeners();
  }


  // UPDATE FUNCTION
  async update() {
    const imgList = await this.findAllImgs(this.view.iframe);
    const imgInstances = imgList.map((img, index) => new ImgModel(
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
    this.model = [...this.cleanModel(), ...await Promise.all(imgInstances)];
    this.renderView();
    this.setupTabListeners();
    this.setupPaginationListeners();
    this.setupFilterListeners();
    this.setupImgListeners();
  }


  // CLEAN MODEL FUNCTION
  cleanModel() {
    return this.model.filter(img => {
      if (!img.tag || !img.tag.isConnected) 
        return false;
      return true;
    });
  }


  // RENDER FUNCTION
  renderView() {
    const customErrors = this.model.flatMap(img => img.getErrors ? img.getErrors() : []);
    const customWarnings = this.model.flatMap(img => img.getWarnings ? img.getWarnings() : []);
    const imagesData = this.model.slice(0, this.BATCH_SIZE).map(img => img.getImageData());

    this.view.render(imagesData, this.model.length, customErrors, customWarnings);
  }


  // CHANGE PAGE FUNCTION
  changePage(clickedButton) {
    if (clickedButton === this.view.currentPageButton)
      return;

    const imagesData = [];
    const index = clickedButton.dataset.index;

    this.model.slice(parseInt(index) * this.BATCH_SIZE, Math.min((parseInt(index) + 1) * this.BATCH_SIZE, this.model.length)).forEach(img => imagesData.push(img.getImageData()));
    this.view.changePage(imagesData, clickedButton);
    this.setupImgListeners(index);
  }


  // FILTER STATUS FUNCTION
  filterStatus(status) {
    if (!this.filter.status)
      return false;
    const checkStatus = status.status === this.filter.status || !this.filter.status;
    const checkTitle = status.title === this.filter.title || !this.filter.title;
    const checkMessage = status.message === this.filter.message || !this.filter.message;
    return checkStatus && checkTitle && checkMessage;
  }


  // FIND ALL IMAGES FUNCTION
  async findAllImgs(doc) {
    const searchDOM = (doc) => {
      const srcChecker = /url\(\s*?['"]?\s*?(\S+?)\s*?["']?\s*?\)/i;
      const clsChecker = /^w3ba11y_imgTag_\d+$/;
      
      const hasMatchingClass = (node, regex) => {
        return Array.from(node.classList).some(cls => regex.test(cls));
      };

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

      const collectImagesFromNode = (node, collection) => {
        if (hasMatchingClass(node, clsChecker)) return;

        const prop = window.getComputedStyle(node).getPropertyValue('background-image');
        let match = srcChecker.exec(prop);
        if (match) collection.add({ src: match[1], node, isBackground: true, isVisible: isVisible(node) });

        else if (!match && node.style && node.style.backgroundImage) {
          match = srcChecker.exec(node.style.backgroundImage);
          if (match) {
            collection.add({ src: match[1], node, isBackground: true });
          }
        }

        if (/^img$/i.test(node.tagName)) {
          if (node.dataset.src)
            collection.add({ src: node.dataset.src, node, isBackground: false, isVisible: isVisible(node) });
          else if (node.src !== '')
            collection.add({ src: node.src, node, isBackground: false, isVisible: isVisible(node) });
        }

        if (/^picture$/i.test(node.tagName)) {
          const sources = node.querySelectorAll('source');
          const img = node.querySelector('img');
          sources.forEach(source => {
            if (source.srcset) {
              source.srcset.split(',').map(s => s.trim().split(' ')[0]).forEach(src => {
                collection.add({ src, node, isBackground: false, isVisible: isVisible(source) && (src === img.currentSrc) });
              });
            }
          });
        }

        if (/^frame$/i.test(node.tagName)) {
          try {
            Array.from(searchDOM(node.contentDocument || node.contentWindow.document)).forEach(img => {
              if (img) { collection.add(img); }
            });
          } catch (e) {}
        }
      };

      try {
        return Array.from(doc.querySelectorAll('*')).reduce((collection, node) => {
          collectImagesFromNode(node, collection);
          return collection;
        }, new Set());
      } catch (e) {
        return new Set();
      }
    };

    const loadImg = async ({ src, node, isBackground, isVisible }, timeout = 60000) => {
      const getMemorySize = async (src) => {
        const resources = performance.getEntriesByType('resource');
        const resource = resources.find(res => {
          const resUrl = new URL(res.name, window.location.href);
          const srcUrl = new URL(src, window.location.href);
          return resUrl.href === srcUrl.href;
        });
    
        if (resource && resource.decodedBodySize) {
          return (resource.decodedBodySize / 1024).toFixed(2);
        }
    
        return new Promise((resolve, reject) => {
          const handleMessage = (message) => {
            if (message.action === 'fetchImageSizeResponse' && message.src === src) {
              chrome.runtime.onMessage.removeListener(handleMessage);
              resolve((message.size / 1024).toFixed(2));
            }
          };
    
          chrome.runtime.onMessage.addListener(handleMessage);
          chrome.runtime.sendMessage({ action: 'fetchImageSize', src });
    
          setTimeout(() => {
            chrome.runtime.onMessage.removeListener(handleMessage);
            reject(new Error('Timeout waiting for image size response'));
          }, timeout);
        });
      };
    
      try {
        const memorySize = await getMemorySize(src);
    
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
    
          img.onload = () => resolve({
            node,
            src,
            width: img.naturalWidth,
            height: img.naturalHeight,
            memorySize,
            alt: isBackground ? null : (node.alt || node.querySelector('img')?.alt || ''),
            backgroundImage: isBackground,
            isVisible,
            id: node.id || '',
          });
    
          img.onerror = () => resolve(null);
    
          setTimeout(() => reject(new Error('Timeout loading image')), timeout);
        });
      } catch (error) {
        console.error("Error loading image:", error);
        return null;
      }
    };
    
    const loadImgAll = (imgList, timeout = 10000) => {
      return Promise.all(imgList.map(imgObj => loadImg(imgObj, timeout).catch(() => null)))
        .then(results => results.filter(Boolean));
    };

    try {
      return await loadImgAll(Array.from(searchDOM(doc)));
    } catch (error) {
      return [];
    }
  }


  // SETUP LISTENERS
  setupTabListeners() {
    this.view.tabButtons.forEach(button => {
      button.addEventListener('click', () => this.eventHandlers.changeTab(button));
    });
  }

  setupPaginationListeners() {
    this.view.paginationButtons.forEach(button => {
      button.addEventListener('click', () => this.changePage(button));
    });
  }

  setupFilterListeners() {
    this.view.filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        button.dataset.status ? this.filter.status = button.dataset.status : delete this.filter.status;
        button.dataset.title ? this.filter.title = button.dataset.title : delete this.filter.title;
        button.dataset.message ? this.filter.message = button.dataset.message : delete this.filter.message;
        this.renderView();
        this.setupImgListeners();
        this.setupFilterListeners();
        this.setupPaginationListeners();
        this.view.analysisTabButton.click();
      });
    });
  }

  setupImgListeners(index = 0) {
    this.model.slice(parseInt(index) * this.BATCH_SIZE, Math.min((parseInt(index) + 1) * this.BATCH_SIZE, this.model.length)).forEach(img => {
      const {imgTag, imgShowButton, imgMoreButton} = this.view.getImgTags(img.hook);

      if (imgShowButton) {
        imgShowButton.addEventListener('click', () => this.eventHandlers.show(img.hook));
      }
      
      const handleTagDataClick = () => {
        const {imgTag, imgShowButton, imgMoreButton, imgAltStatusButtons, imgSizeStatusButtons, imgDeleteButtons, imgAddStatusButton, imgAddNoteSubmitButton} = this.view.getImgTags(img.hook);
        if (imgMoreButton.classList.contains('ri-arrow-drop-down-line--rotate')) {
          imgAltStatusButtons.forEach(button => button.removeEventListener('click', this.handleAltStatusClick));
          imgSizeStatusButtons.forEach(button => button.removeEventListener('click', this.handleSizeStatusClick));
          imgAddStatusButton.forEach(button => button.removeEventListener('click', this.handleAddStatusClick));
          imgAddNoteSubmitButton.removeEventListener('click', this.handleAddNoteSubmitClick);
          if (imgDeleteButtons) {
            imgDeleteButtons.forEach(button => button.removeEventListener('click', this.handleDeleteClick));
          }
        } 
        else {
          imgAltStatusButtons.forEach(button => {
            button.addEventListener('click', this.handleAltStatusClick = () => {
              img.altStatus = new Status(button.dataset.status, `Image alt`, `Image alt ${button.dataset.status}`);
              const customErrors = this.model.flatMap(img => img.getErrors ? img.getErrors() : []);
              const customWarnings = this.model.flatMap(img => img.getWarnings ? img.getWarnings() : []);
              this.eventHandlers.updateDefaultStatus(customErrors, customWarnings, img.hook, img.getTotalErrors(), img.getTotalWarnings(), '.tag__info--alt', button.dataset.status);
              this.setupFilterListeners();
            });
          });
          imgSizeStatusButtons.forEach(button => {
            button.addEventListener('click', this.handleSizeStatusClick = () => {
              img.memorySizeStatus = new Status(button.dataset.status, `Image size`, `Image size ${button.dataset.status}`);
              const customErrors = this.model.flatMap(img => img.getErrors ? img.getErrors() : []);
              const customWarnings = this.model.flatMap(img => img.getWarnings ? img.getWarnings() : []);
              this.eventHandlers.updateDefaultStatus(customErrors, customWarnings, img.hook, img.getTotalErrors(), img.getTotalWarnings(), '.tag__info--size', button.dataset.status);
              this.setupFilterListeners();
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
            this.setupFilterListeners();
            imgMoreButton.click();
            imgMoreButton.click();
          });
          imgDeleteButtons?.forEach(button => {
            button.addEventListener('click', this.handleDeleteClick = () => {
              img.deleteCustomStatus(button.dataset.index);
              const customErrors = this.model.flatMap(img => img.getErrors ? img.getErrors() : []);
              const customWarnings = this.model.flatMap(img => img.getWarnings ? img.getWarnings() : []);
              this.eventHandlers.removeCustomStatus(customErrors, customWarnings, img.hook, img.getTotalErrors(), img.getTotalWarnings(), img.customStatus);
              this.setupFilterListeners();
              imgMoreButton.click();
              imgMoreButton.click();
            });
          });
        }
        this.eventHandlers.more(img.hook);
      };
      imgMoreButton.addEventListener('click', handleTagDataClick);
      const isFiltered = [img.altStatus, img.memorySizeStatus, ...img.customStatus].map(status => this.filterStatus(status)).find(res => res === true);
      if (isFiltered)
        imgMoreButton.click();
    });
    this.view.removeLoading();
  }
}