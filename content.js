if (!window.captionCaptureInitialized) {
    let capturing = false;
    let captions = [];
    let currentSpeaker = '';
    let currentCaption = '';
    let observedSpans = new Map();

    chrome.storage.local.get(['isRecording'], (result) => {
        if (result.isRecording) {
            capturing = true;
            observeCaptions();
        }
    });

    const captureCaptions = (spanElements) => {
        if (capturing) {
            let newCaption = '';
            spanElements.forEach((span, index) => {
                const spanText = span.innerText.trim();
                if (observedSpans.has(index)) {
                    newCaption += ` ${spanText}`;
                    observedSpans.set(index, spanText);
                } else {
                    newCaption += ` ${spanText}`;
                    observedSpans.set(index, spanText);
                }
            });
            if (newCaption.trim() !== '') {
                currentCaption = newCaption.trim();
            }
            console.log(`Current caption: ${currentCaption}`);
        } else {
            console.log('Capturing is false, not capturing captions');
        }
    };

    const finalizeCurrentCaption = () => {
        if (currentCaption && currentSpeaker) {
            captions.push(`${currentSpeaker}: "${currentCaption}"`);
            currentCaption = '';
            observedSpans.clear();
            console.log('Finalized current caption, captions:', captions);
        } else {
            console.log('Current caption or current speaker is empty, not finalizing current caption');
        }
    };

    const observeCaptions = () => {
        try {
            const targetNode = document.querySelector('.iOzk7'); // Container principal das legendas
            if (targetNode) {
                const config = { childList: true, subtree: true, characterData: true };
                const callback = (mutationsList) => {
                    mutationsList.forEach((mutation) => {
                        let node = mutation.target;
                        if (node) {
                            let containerNode = (typeof node.closest === 'function') ? node.closest('.iOzk7') : null;
                            if (!containerNode) {
                                containerNode = node;
                            }
                            const speakerNode = (containerNode && typeof containerNode.querySelector === 'function') ? containerNode.querySelector('.jxFHg') : null;
                            if (speakerNode) {
                                if (currentSpeaker && currentSpeaker !== speakerNode.innerText.trim()) {
                                    finalizeCurrentCaption();
                                }
                                currentSpeaker = speakerNode.innerText.trim();
                            }
                            const textNodes = (containerNode && typeof containerNode.querySelectorAll === 'function') ? containerNode.querySelectorAll('.iTTPOb.VbkSUe span') : [];
                            captureCaptions(Array.from(textNodes));
                        }
                    });
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
                chrome.storage.local.set({ isRecording: true, isPaused: false });
                sendResponse({ status: 'started' });
                console.log('Capturing started.');
            } else if (request.command === 'pause') {
                capturing = false;
                chrome.storage.local.set({ isPaused: true });
                sendResponse({ status: 'paused' });
                console.log('Capturing paused.');
            } else if (request.command === 'stop') {
                capturing = false;
                finalizeCurrentCaption();
                chrome.storage.local.set({ isRecording: false, isPaused: false });
                const captionsText = captions.join('\n');
                console.log('Final captions:', captionsText);
                if (captionsText) {
                    chrome.runtime.sendMessage({ type: 'download', data: captionsText }, (response) => {
                        if (chrome.runtime.lastError) {
                            console.error('Error sending download command:', chrome.runtime.lastError.message);
                            sendResponse({ status: 'error', message: chrome.runtime.lastError.message });
                        } else {
                            console.log('Download command sent:', response);
                            sendResponse({ status: 'success' });
                        }
                    });
                } else {
                    console.error('No captions to download.');
                    sendResponse({ status: 'error', message: 'No captions to download.' });
                }
                console.log('Capturing stopped and data sent for download.');
                captions = [];
            }
        } catch (error) {
            console.error('Error in onMessage listener:', error);
            sendResponse({ status: 'error', message: error.message });
        }
        return true;  // Indica que a resposta será enviada de forma assíncrona
    });

    window.captionCaptureInitialized = true;
}