function setupImgEventListeners(images) {
    document.addEventListener('click', (event) => {
        const shadowRoot = document.querySelector('main').shadowRoot;
        const button = event.target;
        const tagElement = button.closest('.tag');
    
        if (!tagElement) return;
    
        const imgId = tagElement.getAttribute('id');
        const imgObject = images.find(img => img.id === imgId);
    
        if (!imgObject) return;
    
        const handleEyeClick = () => {
            const imgTag = shadowRoot.getElementById(imgId);
            imgTag.scrollIntoView();
            images.forEach(img => {
                shadowRoot.getElementById(img.getTagId()).classList.remove('highlight');
            });
            imgTag.classList.add('highlight');
        };
    
        const handleArrowClick = () => {
            tagElement.querySelector('.tag__body').classList.toggle('more');
            button.classList.toggle('ri-arrow-drop-down-line--rotate');
        };
    
        const handleStatusClick = () => {
            if (button.classList.contains('status--current')) return;
    
            const newStatus = button.classList.contains('status--correct') ? 'correct' : button.classList.contains('status--warning') ? 'warning' : 'error';
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
            
            tagElement.outerHTML = imgObject.getHTML(true);
        };
    
        if (button.classList.contains('ri-eye-fill')) {
            handleEyeClick();
        } else if (button.classList.contains('ri-arrow-drop-down-line')) {
            handleArrowClick();
        } else if (button.classList.contains('status')) {
            handleStatusClick();
        }
    });
}
