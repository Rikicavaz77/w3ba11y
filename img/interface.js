function setupImgEventListeners(images) {
    document.addEventListener('click', (event) => {
        const button = event.target;
        const tabButton = button.closest('.tab__button');
        const tagElement = button.closest('.tag');

        if (tabButton) handleTabElementClick(tabButton);
        if (tagElement) handleTagElementClick(tagElement, button, images);
    });
}

function handleTabElementClick(button) {
    const section = button.closest('.w3ba11y__section');

    if (!section.classList.contains('w3ba11y__section--img')) return;

    const header = section.querySelector('.section__header');
    const body = section.querySelector('.section__body');

    toggleActiveState(header.querySelectorAll('.tab__button'), button);
    toggleActiveState(body.querySelectorAll('.tab'), button);
}

function toggleActiveState(elements, activeElement) {
    elements.forEach(element => {
        const isActive = element === activeElement || element.classList.contains(`tab--${activeElement.classList[1].split('--')[1]}`);
        element.classList.toggle('tab__button--active', isActive);
        element.classList.toggle('tab--active', isActive);
    });
}

function handleTagElementClick(tagElement, button, images) {
    const shadowRoot = document.querySelector('main').shadowRoot;
    const iframe = shadowRoot.querySelector('iframe');
    const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
    const imgId = tagElement.getAttribute('id');
    const imgObject = images.find(img => img.id === imgId);

    if (!imgObject) return;

    const handleEyeClick = () => {
        const imgTag = iframeDocument.getElementById(imgId);
        if (imgTag) {
            const imgTagTop = imgTag.getBoundingClientRect().top + iframe.contentWindow.scrollY;
            iframe.contentWindow.scrollTo({
                top: imgTagTop,
                behavior: 'smooth'
            });
            images.forEach(img => {
                try {
                    const tagId = img.getTagId ? img.getTagId() : img.id;
                    const imgElement = iframeDocument.getElementById(tagId);
                    if (imgElement) {
                        imgElement.classList.remove('highlight');
                    }
                } catch (error) {
                    console.error('Error removing highlight:', error);
                }
            });
            imgTag.classList.add('highlight');
        }
    };

    const handleArrowClick = () => {
        tagElement.querySelector('.tag__body').classList.toggle('more');
        button.classList.toggle('ri-arrow-drop-down-line--rotate');
    };

    const handleStatusClick = () => {
        if (button.classList.contains('status--current')) return;

        const newStatus = button.classList.contains('status--correct') ? 'correct' :
                          button.classList.contains('status--warning') ? 'warning' : 'error';
        const ul = button.closest('ul');

        ul.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('status--current');
        });

        button.classList.add('status--current');

        if (ul.parentNode.classList.contains('tag__info--alt')) {
            imgObject.altStatus = new Status(newStatus, 'Image alt', `Image alt ${newStatus}`);
        } else if (ul.parentNode.classList.contains('tag__info--size')) {
            imgObject.memorySizeStatus = new Status(newStatus, 'Image size', `Image size ${newStatus}`);
        }

        if (ul.parentNode.classList.contains('tag__form')) return;

        tagElement.outerHTML = imgObject.getHTML(true);
        document.querySelector('.tab--results').innerHTML = `
        <h2>Results</h2>
        ${updateImgResults(images)}`;
    };

    const handleSubmitClick = () => {
        const form = button.closest('form');
        const formData = new FormData(form);
        const data = {};

        formData.forEach((value, key) => {
            data[key] = value;
        });

        if (data['title'] === '' || data['message'] === '') return;

        const status = form.querySelector('.status--warning').classList.contains('status--current');

        const newStatus = new Status(status ? 'warning' : 'error', data['title'], data['message']);
        imgObject.customStatus.push(newStatus);

        tagElement.outerHTML = imgObject.getHTML(true);
        document.querySelector('.tab--results').innerHTML = `
        <h2>Results</h2>
        ${updateImgResults(images)}`;
    };

    const handleDeleteClick = () => {
        const index = button.dataset.index;

        imgObject.customStatus.splice(index, 1);
        tagElement.outerHTML = imgObject.getHTML(true);
        document.querySelector('.tab--results').innerHTML = `
        <h2>Results</h2>
        ${updateImgResults(images)}`;
    }

    if (button.classList.contains('form__input--submit')) {
        handleSubmitClick();
    } else if (button.classList.contains('ri-delete-bin-line')) {
        handleDeleteClick();
    } else if (button.classList.contains('ri-eye-fill')) {
        handleEyeClick();
    } else if (button.classList.contains('ri-arrow-drop-down-line')) {
        handleArrowClick();
    } else if (button.classList.contains('status')) {
        handleStatusClick();
    }
}

function updateImgResults(images) {
    const errors = images.flatMap(img => img.getErrors());
    const warnings = images.flatMap(img => img.getWarnings());

    const groupByTitle = (statuses) => {
        return statuses.reduce((acc, status) => {
            if (!acc[status.getTitle()]) {
                acc[status.getTitle()] = [];
            }
            acc[status.getTitle()].push(status);
            return acc;
        }, {});
    };
    
    const groupedErrors = groupByTitle(errors);
    const groupedWarnings = groupByTitle(warnings);

    const generateStatusHTML = (groupedStatuses, statusType) => {
        return Object.keys(groupedStatuses).map(title => {
            const messageCount = {};
            groupedStatuses[title].forEach(status => {
                const message = status.getMessage();
                if (messageCount[message]) {
                    messageCount[message]++;
                } else {
                    messageCount[message] = 1;
                }
            });
    
            const statusItems = Object.keys(messageCount).map(message => `
                <li class="hlist">
                    ${message} (Total: ${messageCount[message]})
                </li>
            `).join('');
            const count = groupedStatuses[title].length;
    
            return `
                <div class="hlist">
                    <span class="status status--${statusType}"></span>
                    <span>${title} (Total: ${count})</span>
                </div>
                <ul>
                    ${statusItems}
                </ul>
            `;
        }).join('');
    };
    
    
    const groupedErrorsHTML = generateStatusHTML(groupedErrors, 'error');
    const groupedWarningsHTML = generateStatusHTML(groupedWarnings, 'warning');

    return `
    <div>
        <h3>Errors</h3>
        ${groupedErrorsHTML}
    </div>
    <div>
        <h3>Warnings</h3>
        ${groupedWarningsHTML}
    </div>`;
}