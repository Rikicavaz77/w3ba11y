chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    getImgAll(document.querySelector('main').shadowRoot).then(list => {
        const imgInstances = list.map((img, index) => new Img(
            img.node, 
            img.src, 
            `w3ba11y_imgTag_${index}`, 
            img.width, 
            img.height, 
            img.memorySize, 
            img.backgroundImage, 
            img.alt, 
            img.id, 
            img.classes
        ));

        Promise.all(imgInstances).then((resolvedInstances) => {
            setupImgEventListeners(resolvedInstances);
        
            const imgSection = document.createElement('section');
            imgSection.classList.add('w3ba11y_img');
            imgSection.innerHTML = resolvedInstances.map(img => img.getHTML()).join('\n');

            document.querySelector('aside').appendChild(imgSection);
        });
    });
});
