class Img {
    constructor(tag, src, id, imgWidth, imgHeight, imgMemorySize, imgBackgroundImage, imgAlt, imgId) {
        tag.id = tag.getAttribute('id') || id;
        this.src = src;
        this.id = tag.getAttribute('id');
        this.imgWidth = imgWidth;
        this.imgHeight = imgHeight;
        this.imgMemorySize = imgMemorySize;
        this.memorySizeStatus = this.getImageSizeStatusMessage();
        this.imgAlt = imgAlt;
        this.altStatus = this.getAltStatusMessage(imgAlt, imgBackgroundImage);
        this.imgBackgroundImage = imgBackgroundImage;
        this.imgId = imgId;
        this.customStatus = [];
    }

    getAltStatusMessage(imgAlt, imgBackgroundImage) {
        if (!imgBackgroundImage && (imgAlt === null || imgAlt === '' || imgAlt.length > 100)) {
            let error = '';
            if (imgAlt === null) error = 'Missing image alt';
            else if (imgAlt === '') error = 'Empty image alt';
            else if (imgAlt.length > 100) error = 'Image alt has more than 100 chars'
            return new Status('error', 'Image alt', error);
        } else if (!imgBackgroundImage && imgAlt.length > 75 && imgAlt.length <= 100) return new Status('warning', 'Image alt', 'Image alt has more than 75 chars'); 
          else return new Status('correct', 'Image alt', '');
    }

    getImageSizeStatusMessage(imgMemorySize, estimatedMemorySize) {
        if (imgMemorySize > 1536) return new Status('error', 'Image size', 'Image size too big');
        else if (imgMemorySize > estimatedMemorySize) return new Status('warning', 'Image size', 'Image size too big');
        else return new Status('correct', 'Image size', '');
    }

    getEstimatedMemorySize(width, height, src) {
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
        return Math.ceil(width * height * bytesPerPixel / 1024);
      }

    getSrc() {
        return this.src;
    }

    getTagId() {
        return this.id;
    }

    getId() {
        return this.imgId;
    }

    getWidth() {
        return this.imgWidth;
    }

    getHeight() {
        return this.imgHeight;
    }

    getMemorySize() {
        return this.imgMemorySize;
    }

    getMemorySizeStatus() {
        return this.memorySizeStatus;
    }

    getBackgroundImage() {
        return this.imgBackgroundImage;
    }

    getAlt() {
        return this.imgAlt;
    }

    getAltStatus() {
        return this.altStatus;
    }

    getAltLength() {
        if (this.imgAlt === null || this.imgAlt === undefined) return 'null';
        if (this.imgAlt === '') return 'empty';
        return this.imgAlt.length;
    }

    getTotalErrors() {
        return this.getErrors().length;
    }

    getErrors() {
        let errors = new Array();
        if (this.getAltStatus().getStatus() === 'error') {
            errors.push(this.altStatus);
        }
        if (this.getMemorySizeStatus().getStatus() === 'error') {
            errors.push(this.memorySizeStatus);
        }
        errors = [...errors, ...this.customStatus.filter(status => status.getStatus() === 'error')];
        return errors;
    }

    getCustomErrors() {
        return this.customStatus.filter(status => status.getStatus() === 'error');
    }

    getTotalWarnings() {
        return this.getWarnings().length;
    }

    getWarnings() {
        let warnings = new Array();
        if (this.getAltStatus().getStatus() === 'warning') {
            warnings.push(this.altStatus);
        }
        if (this.getMemorySizeStatus().getStatus() === 'warning') {
            warnings.push(this.memorySizeStatus);
        }
        warnings = [...warnings, ...this.customStatus.filter(status => status.getStatus() === 'warning')];
        return warnings;
    }

    getCustomWarnings() {
        return this.customStatus.filter(status => status.getStatus() === 'warning');
    }

    getStatus() {
        return this.customStatus;
    }

    addStatus(status) {
        this.customStatus.push(status);
    }

    getStatusHTML(status, index) {
        return `
            <li class="tag__info">
                <div>
                    <h4>${status.title}</h4>
                    <p>${status.message}</p>
                </div>
                <ul class="hlist">
                    <li class="hlist"><button class="status status--${status.getStatus() === 'warning' ? 'warning status--current' : 'error status--current'}"></button></li>
                    <li class="hlist"><button data-index="${index}" class="info__remove ri-delete-bin-line"></button></li>
                </ul>
            </li>`;
    }

    getHTML(body = false) {
        const customMessages = [...this.getCustomErrors(), ...this.getCustomWarnings()].map((status, index) => this.getStatusHTML(status, index)).join('');
        const size = this.imgMemorySize > 1024 ? `${Math.round(this.imgMemorySize / 1024, 1)}MB` : `${this.imgMemorySize}kB`;
        return `
            <div id="${this.getTagId()}" class="tag">
                <header class="tag__header">
                    <img src="${this.getSrc()}" alt="" class="tag__img">
                    <ul class="hlist tag__status">
                        <li class="hlist">${this.getBackgroundImage() ? "B" : "T"}</li>
                        <li class="hlist"><span class="status status--warning"></span>${this.getTotalWarnings()}</li>
                        <li class="hlist"><span class="status status--error"></span>${this.getTotalErrors()}</li>
                        <li>
                            <button class="ri-eye-fill"><span class="visually-hidden">Show image</span></button>
                        </li>
                        <li>
                            <button class="ri-arrow-drop-down-line ${body ? 'ri-arrow-drop-down-line--rotate' : ''}"><span class="visually-hidden">More informations</span></button>
                        </li>
                    </ul>
                </header>
                <div class="tag__body ${body ? 'more' : ''}">
                    <ul class="tag__data">
                        <li class="tag__info">
                            <div>
                                <h4>Id</h4>
                                <p>${this.getId()}</p>
                            </div>
                        </li>
                        <li class="tag__info">
                            <div>
                                <h4>Width</h4>
                                <p>${this.getWidth()}px</p>
                            </div>
                        </li>
                        <li class="tag__info">
                            <div>
                                <h4>Height</h4>
                                <p>${this.getHeight()}px</p>
                            </div>
                        </li>
                        <li class="tag__info">
                            <div>
                                <h4>Type</h4>
                                <p>${this.getBackgroundImage() ? "Background image" : "Tag image"}</p>
                            </div>
                        </li>
                        <li class="tag__info tag__info--alt">
                            <div>
                                <h4>Alt (${this.getAltLength()} chars)</h4>
                                <p>${this.getAlt()}</p>
                            </div>
                            <ul class="hlist">
                                <li class="hlist"><button class="status status--correct ${this.getAltStatus().getStatus() === 'correct' ? 'status--current' : ''}"><span class="visually-hidden">Correct</span></button></li>
                                <li class="hlist"><button class="status status--warning ${this.getAltStatus().getStatus() === 'warning' ? 'status--current' : ''}"><span class="visually-hidden">Warning</span></button></li>
                                <li class="hlist"><button class="status status--error ${this.getAltStatus().getStatus() === 'error' ? 'status--current' : ''}"><span class="visually-hidden">Error</span></button></li>
                            </ul>
                        </li>
                        <li class="tag__info tag__info--size">
                            <div>
                                <h4>Size</h4>
                                <p>${size}</p>
                            </div>
                            <ul class="hlist">
                                <li class="hlist"><button class="status status--correct ${this.getMemorySizeStatus().getStatus() === 'correct' ? 'status--current' : ''}"><span class="visually-hidden">Correct</span></button></li>
                                <li class="hlist"><button class="status status--warning ${this.getMemorySizeStatus().getStatus() === 'warning' ? 'status--current' : ''}"><span class="visually-hidden">Warning</span></button></li>
                                <li class="hlist"><button class="status status--error ${this.getMemorySizeStatus().getStatus() === 'error' ? 'status--current' : ''}"><span class="visually-hidden">Error</span></button></li>
                            </ul>
                        </li>
                        ${customMessages}
                    </ul>
                    <form action="/" class="tag__form">
                        <ul class="hlist form__status-bar">
                            <li><button type="button" class="status status--warning status--current form__status"><span class="visually-hidden">Warning</span></button></li>
                            <li><button type="button" class="status status--error form__status"><span class="visually-hidden">Error</span></button></li>
                        </ul>
                        <label class="form__label" for="title--${this.getId()}">Title</label>
                        <input class="form__input--text" type="text" name="title" id="title--${this.getId()}">
                        <label class="form__label" for="message--${this.getId()}">Message</label>
                        <input class="form__input--text" type="text" name="message" id="message--${this.getId()}">
                        <button type="button" class="form__input--submit">Submit</button>
                    </form> 
                </div>
            </div>`;
    }
}
