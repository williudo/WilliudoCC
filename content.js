let capturing = false;
let captions = [];

const captureCaptions = (captionText) => {
    if (capturing) {
        captions.push(captionText);
        console.log(`Caption captured: ${captionText}`);
    }
};

const observeCaptions = () => {
    try {
        const targetNode = document.querySelector('.VbkSUe'); // Verifique o seletor correto para as legendas
        if (targetNode) {
            const config = { childList: true, subtree: true };
            const callback = (mutationsList) => {
                for (let mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === 1) {
                                const captionText = node.innerText;
                                captureCaptions(captionText);
                            }
                        });
                    }
                }
            };
            const observer = new MutationObserver(callback);
            observer.observe(targetNode, config);
            console.log('Observer started.');
        } else {
            console.error('Captions container not found.');
        }
    } catch (error) {
        console.error('Error in observeCaptions:', error);
    }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
        if (request.command === 'start') {
            capturing = true;
            observeCaptions();
            console.log('Capturing started.');
        } else if (request.command === 'pause') {
            capturing = false;
            console.log('Capturing paused.');
        } else if (request.command === 'stop') {
            capturing = false;
            chrome.runtime.sendMessage({ type: 'download', data: captions.join('\n') });
            console.log('Capturing stopped and data sent for download.');
            captions = [];
        }
    } catch (error) {
        console.error('Error in onMessage listener:', error);
    }
});
