chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'download') {
        try {
            const blob = new Blob([request.data], { type: 'text/plain' });
            const reader = new FileReader();
            reader.onload = function(e) {
                const url = e.target.result;
                chrome.downloads.download({
                    url: url,
                    filename: 'captions.txt',
                    conflictAction: 'overwrite'
                }, () => {
                    console.log('Download completed.');
                });
                console.log('Download initiated.');
            };
            reader.readAsDataURL(blob);
        } catch (error) {
            console.error('Error during download:', error);
        }
    }
});
