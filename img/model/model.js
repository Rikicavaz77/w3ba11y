class ImgModel {
  constructor(tag, src, hook, width, height, memorySize, isBackground, isVisible, alt) {
    this._tag = tag;
    this._src = src;
    this._id = tag.getAttribute('id');
    this._hook = hook;
    this._isVisible = isVisible;
    this._isBackground = isBackground;
    this._width = width;
    this._height = height;
    this._memorySize = memorySize === 0 ? this.estimatedMemorySize() : memorySize;
    this._alt = alt;
    this._memorySizeStatus = this.imageSizeStatusMessage();
    this._altStatus = this.altStatusMessage(alt, isBackground);
    this._customStatus = [];

    tag.classList.add(hook, "w3ba11y_imgTag");
  }

  get tag() {
    return this._tag;
  }

  get src() {
    return this._src;
  }

  get id() {
    return this._id;
  }

  get hook() {
    return this._hook;
  }

  get isVisible() {
    return this._isVisible;
  }

  get isBackground() {
    return this._isBackground;
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  get memorySize() {
    return this._memorySize;
  }

  get alt() {
    return this._alt;
  }

  get memorySizeStatus() {
    return this._memorySizeStatus;
  }

  get altStatus() {
    return this._altStatus;
  }

  get customStatus() {
    return this._customStatus;
  }

  set memorySizeStatus(status) {
    this._memorySizeStatus = status;
  }

  set altStatus(status) {
    this._altStatus = status;
  }

  altStatusMessage() {
    if (!this.isBackground && this.alt === null)
      return new Status('error', 'Image alt', 'Missing image alt');
    else if (!this.isBackground && this.alt === '')
      return new Status('error', 'Image alt', 'Empty image alt');
    else if (!this.isBackground && this.alt.length > 100)
      return new Status('error', 'Image alt', 'Image alt has more than 100 chars');
    else if (!this.isBackground && this.alt.length > 75 && this.alt.length <= 100)
      return new Status('warning', 'Image alt', 'Image alt has more than 75 chars');
    else return new Status('correct', 'Image alt', '');
  }

  imageSizeStatusMessage() {
    if (this.memorySize >= 1536)
      return new Status('error', 'Image size', 'Image size too big');
    else if (this.memorySize > this.estimatedMemorySize())
      return new Status('warning', 'Image size', 'Image size too big');
    else
      return new Status('correct', 'Image size', '');
  }

  estimatedMemorySize() {
    const ext = this.src.split('.').pop().toLowerCase();
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
    return Math.ceil(this.width * this.height * bytesPerPixel / 1024);
  }

  addCustomStatus(status) {
    this.customStatus.push(status);
  }

  deleteCustomStatus(index) {
    if (index < 0 || index >= this.customStatus.length) 
      return;
    this.customStatus.splice(index, 1);
  }

  getAltLength() {
    if (this.alt === null || this.alt === undefined) return 'null';
    if (this.alt === '') return 'empty';
    return this.alt.length;
  }

  getTotalErrors() {
    return this.getErrors().length;
  }

  getErrors() {
    let errors = new Array();
    if (this.altStatus.status === 'error')
      errors.push(this.altStatus);
    if (this.memorySizeStatus.status === 'error')
      errors.push(this.memorySizeStatus);
    errors = [...errors, ...this.customStatus.filter(status => status.status === 'error')];
    return errors;
  }

  getCustomErrors() {
    return this.customStatus.filter(status => status.status === 'error');
  }

  getTotalWarnings() {
    return this.getWarnings().length;
  }

  getWarnings() {
    let warnings = new Array();
    if (this.altStatus.status === 'warning') {
      warnings.push(this.altStatus);
    }
    if (this.memorySizeStatus.status === 'warning') {
      warnings.push(this.memorySizeStatus);
    }
    warnings = [...warnings, ...this.customStatus.filter(status => status.status === 'warning')];
    return warnings;
  }

  getCustomWarnings() {
    return this.customStatus.filter(status => status.status === 'warning');
  }

  getImageData() {
    const replaceSpecialChars = (node) => {
      let inQuotes = false;
      let result = '';
    
      for (let i = 0; i < node.length; i++) {
        const char = node[i];
    
        if (char === '"') {
          inQuotes = !inQuotes;
          result += char;
        } else if (!inQuotes && char === ' ') {
          result += '\n';
        } else {
          switch (char) {
            case '&':
              result += '&amp;';
              break;
            case '<':
              result += '&lt;';
              break;
            case '>':
              result += '&gt;';
              break;
            case "'":
              result += '&#039;';
              break;
            case '"':
              result += '&quot;';
              break;
            default:
              result += char;
          }
        }
      }
      return result;
    }

    return {
      node: replaceSpecialChars(this.tag.outerHTML),
      src: this.src,
      id: this.id,
      hook: this.hook,
      isVisible: this.isVisible,
      isBackground: this.isBackground,
      width: this.width,
      height: this.height,
      memorySize: this.memorySize,
      alt: this.alt,
      altLength: this.getAltLength(),
      memorySizeStatus: this.memorySizeStatus,
      altStatus: this.altStatus,
      customStatus: this.customStatus,
      totalWarnings: this.getTotalWarnings(),
      totalErrors: this.getTotalErrors(),
      customWarnings: this.getCustomWarnings(),
      customErrors: this.getCustomErrors()
    };
  }
}