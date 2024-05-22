document.getElementById('start').addEventListener('click', () => {
    try {
        document.getElementById('start').classList.add('hidden');
        document.getElementById('controls').classList.remove('hidden');
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, { command: 'start' }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error sending start command:', chrome.runtime.lastError.message);
                    } else {
                        console.log('Start command sent.');
                    }
                });
            }
        });
    } catch (error) {
        console.error('Error on start button click:', error);
    }
});

document.getElementById('pause').addEventListener('click', () => {
    try {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, { command: 'pause' }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error sending pause command:', chrome.runtime.lastError.message);
                    } else {
                        console.log('Pause command sent.');
                    }
                });
            }
        });
    } catch (error) {
        console.error('Error on pause button click:', error);
    }
});

document.getElementById('stop').addEventListener('click', () => {
    try {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, { command: 'stop' }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error sending stop command:', chrome.runtime.lastError.message);
                    } else {
                        console.log('Stop command sent.');
                    }
                });
                document.getElementById('controls').classList.add('hidden');
                document.getElementById('start').classList.remove('hidden');
            }
        });
    } catch (error) {
        console.error('Error on stop button click:', error);
    }
});
