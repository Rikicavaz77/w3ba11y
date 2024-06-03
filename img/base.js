chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action == 'insertHTML') {
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
                img.id
            ));
    
            Promise.all(imgInstances).then((resolvedInstances) => {                
                setupImgEventListeners(resolvedInstances);
                const aside = document.querySelector('aside');
            
                const imgSection = document.createElement('section');
                imgSection.classList.add('w3ba11y__section');
                imgSection.classList.add('w3ba11y__section--img');
                imgSection.innerHTML = 
                `<header class="section__header">
                    <h2>Images Analysis</h2>
                    <div class="header__tabs">
                        <button class="tab__button tab__button--active tab__button--results">
                            <h3>Results</h3>
                        </button>
                        <button class="tab__button tab__button--analysis">
                            <h3>Analysis</h3>
                        </button>
                    </div>
                </header>
                <div class="section__body">
                    <div class="tab tab--active tab--results">
                        <h2>Results</h2>
                        ${updateImgResults(resolvedInstances)}
                    </div>
                    <div class="tab tab--analysis">
                        ${resolvedInstances.map(img => img.getHTML()).join('\n')}
                    </div>
                </div>`;
    
                aside.appendChild(imgSection);
            });
        });
    }
});