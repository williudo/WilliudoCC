chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'download' && request.data) {
        //console.log('Download request received with data:', request.data);
        const blob = new Blob([request.data], { type: 'text/plain' });
        const reader = new FileReader();

        reader.onload = function() {
            const url = reader.result;
            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = now.getFullYear();
            const hour = String(now.getHours()).padStart(2, '0');
            const minute = String(now.getMinutes()).padStart(2, '0');
            const second = String(now.getSeconds()).padStart(2, '0');
            const filename = `legendas_google_meet_${day}_${month}_${year}__${hour}_${minute}_${second}.txt`;

            chrome.downloads.download({
                url: url,
                filename: filename,
                conflictAction: 'overwrite'
            }, (downloadId) => {
                if (chrome.runtime.lastError) {
                    //console.error('Error downloading file:', chrome.runtime.lastError.message);
                    sendResponse({ status: 'error', message: chrome.runtime.lastError.message });
                } else {
                    //console.log('File downloaded with ID:', downloadId);
                    sendResponse({ status: 'success' });
                }
            });
        };

        reader.readAsDataURL(blob);
    } else {
        //console.error('No data to download:', request);
        sendResponse({ status: 'error', message: 'No data to download' });
    }
    return true; // Indica que a resposta será enviada de forma assíncrona
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        if (tab.url.includes('https://meet.google.com/')) {
            chrome.action.enable(tabId);
        } else {
            chrome.action.disable(tabId);
        }
    }
});
