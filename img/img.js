class Img {
    constructor(tag, src, id, imgWidth, imgHeight, imgMemorySize, imgBackgroundImage, imgAlt, imgId, imgClasses) {
        tag.id = tag.getAttribute('id') || id;
        this.src = src;
        this.id = tag.getAttribute('id');
        this.imgWidth = imgWidth;
        this.imgHeight = imgHeight;
        this.imgMemorySize = imgMemorySize;
        this.memorySizeStatus = new Status(imgMemorySize > this.getEstimatedMemorySize(imgWidth, imgHeight, src) ? 'warning' : 'correct', 'Image size', imgMemorySize > this.getEstimatedMemorySize(imgWidth, imgHeight, src) ? 'Image size too big' : '');
        this.imgBackgroundImage = imgBackgroundImage;
        this.imgAlt = imgAlt;
        this.altStatus = this.getAltStatusMessage(imgAlt, imgBackgroundImage);
        this.imgId = imgId;
        this.imgClasses = imgClasses;
        this.customStatus = [];
    }

    getAltStatusMessage(imgAlt, imgBackgroundImage) {
        if (imgAlt === null && !imgBackgroundImage) {
            return new Status('error', 'Image alt', 'Missing image alt');
        } else if (imgAlt === '') {
            return new Status('warning', 'Image alt', 'Empty image alt');
        } else {
            return new Status('correct', 'Image alt', '');
        }
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

    getClasses() {
        return this.imgClasses;
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
        return this.getErrors().length + (this.memorySizeStatus.getStatus() === 'error' ? 1 : 0) + (this.altStatus.getStatus() === 'error' ? 1 : 0);
    }

    getErrors() {
        return this.customStatus.filter(status => status.getStatus() === 'error');
    }

    getTotalWarnings() {
        return this.getWarnings().length + (this.memorySizeStatus.getStatus() === 'warning' ? 1 : 0) + (this.altStatus.getStatus() === 'warning' ? 1 : 0);
    }

    getWarnings() {
        return this.customStatus.filter(status => status.getStatus() === 'warning');
    }

    getStatus() {
        return this.customStatus;
    }

    addStatus(status) {
        this.customStatus.push(status);
    }

    getStatusHTML(status) {
        return `
            <li class="tag__info">
                <div>
                    <h3>${status.title}</h3>
                    <p>${status.message}</p>
                </div>
                <ul class="hlist">
                    <li class="hlist"><button class="status status--${status.getStatus() === 'warning' ? 'warning status--current' : 'warning'}"></button></li>
                    <li class="hlist"><button class="status status--${status.getStatus() === 'error' ? 'error status--current' : 'error'}"></button></li>
                    <li class="hlist"><button class="info__remove ri-delete-bin-line"></button></li>
                </ul>
            </li>`;
    }

    getHTML(body = false) {
        const customMessages = [...this.getErrors(), ...this.getWarnings()].map(this.getStatusHTML).join('');
        const size = this.imgMemorySize > 1024 ? `${Math.round(this.imgMemorySize / 1024, 1)}MB` : `${this.imgMemorySize}kB`;
        return `
            <div id="${this.getTagId()}" class="tag">
                <header class="tag__header">
                    <img src="${this.getSrc()}" alt="" class="tag__img">
                    <ul class="hlist tag__status">
                        <li class="hlist"><span class="status status--warning"></span>${this.getTotalWarnings()}</li>
                        <li class="hlist"><span class="status status--error"></span>${this.getTotalErrors()}</li>
                        <li>
                            <button class="ri-eye-fill"></button>
                        </li>
                        <li>
                            <button class="ri-arrow-drop-down-line ${body ? 'ri-arrow-drop-down-line--rotate' : ''}"></button>
                        </li>
                    </ul>
                </header>
                <div class="tag__body ${body ? 'more' : ''}">
                    <ul class="tag__data">
                        <li class="tag__info">
                            <div>
                                <h3>Id</h3>
                                <p>${this.getId()}</p>
                            </div>
                        </li>
                        <li class="tag__info">
                            <div>
                                <h3>Classes</h3>
                                <p>${this.getClasses()}</p>
                            </div>
                        </li>
                        <li class="tag__info">
                            <div>
                                <h3>Width</h3>
                                <p>${this.getWidth()}px</p>
                            </div>
                        </li>
                        <li class="tag__info">
                            <div>
                                <h3>Height</h3>
                                <p>${this.getHeight()}px</p>
                            </div>
                        </li>
                        <li class="tag__info">
                            <div>
                                <h3>Type</h3>
                                <p>${this.getBackgroundImage() ? "Background image" : "Tag image"}</p>
                            </div>
                        </li>
                        <li class="tag__info tag__info--alt">
                            <div>
                                <h3>Alt (${this.getAltLength()} chars)</h3>
                                <p>${this.getAlt()}</p>
                            </div>
                            <ul class="hlist">
                                <li class="hlist"><button class="status status--correct ${this.getAltStatus().getStatus() === 'correct' ? 'status--current' : ''}"></button></li>
                                <li class="hlist"><button class="status status--warning ${this.getAltStatus().getStatus() === 'warning' ? 'status--current' : ''}"></button></li>
                                <li class="hlist"><button class="status status--error ${this.getAltStatus().getStatus() === 'error' ? 'status--current' : ''}"></button></li>
                            </ul>
                        </li>
                        <li class="tag__info tag__info--size">
                            <div>
                                <h3>Size</h3>
                                <p>${size}</p>
                            </div>
                            <ul class="hlist">
                                <li class="hlist"><button class="status status--correct ${this.getMemorySizeStatus().getStatus() === 'correct' ? 'status--current' : ''}"></button></li>
                                <li class="hlist"><button class="status status--warning ${this.getMemorySizeStatus().getStatus() === 'warning' ? 'status--current' : ''}"></button></li>
                                <li class="hlist"><button class="status status--error ${this.getMemorySizeStatus().getStatus() === 'error' ? 'status--current' : ''}"></button></li>
                            </ul>
                        </li>
                        ${customMessages}
                    </ul>
                </div>
            </div>`;
    }
}
