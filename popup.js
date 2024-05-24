document.getElementById('start').addEventListener('click', () => {
    try {
        document.getElementById('start').classList.add('hidden');
        document.getElementById('controls').classList.remove('hidden');
        chrome.storage.local.set({ isRecording: true, isPaused: false });
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    files: ['content.js']
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.error('Error injecting content script:', chrome.runtime.lastError.message);
                    } else {
                        chrome.tabs.sendMessage(tabs[0].id, { command: 'start' }, (response) => {
                            if (chrome.runtime.lastError) {
                                console.error('Error sending start command:', chrome.runtime.lastError.message);
                            } else {
                                console.log('Start command sent:', response);
                            }
                        });
                    }
                });
            } else {
                console.error('No active tabs found.');
            }
        });
    } catch (error) {
        console.error('Error on start button click:', error);
    }
});

document.getElementById('pause').addEventListener('click', () => {
    try {
        chrome.storage.local.set({ isPaused: true });
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, { command: 'pause' }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error sending pause command:', chrome.runtime.lastError.message);
                    } else {
                        console.log('Pause command sent:', response);
                        // Alterne a visibilidade dos botões
                        document.getElementById('pause').classList.add('hidden');
                        document.getElementById('start').classList.remove('hidden');
                    }
                });
            } else {
                console.error('No active tabs found.');
            }
        });
    } catch (error) {
        console.error('Error on pause button click:', error);
    }
});

document.getElementById('stop').addEventListener('click', () => {
    try {
        chrome.storage.local.set({ isRecording: false, isPaused: false });
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                // Mostrar mensagem de salvamento
                document.getElementById('saving-message').classList.remove('hidden');
                setTimeout(() => {
                    chrome.tabs.sendMessage(tabs[0].id, { command: 'stop' }, (response) => {
                        if (chrome.runtime.lastError) {
                            console.error('Error sending stop command:', chrome.runtime.lastError.message);
                        } else {
                            console.log('Stop command sent:', response);
                        }
                    });
                    document.getElementById('controls').classList.add('hidden');
                    document.getElementById('start').classList.remove('hidden');
                    document.getElementById('saving-message').classList.add('hidden');
                }, 5000);
            } else {
                console.error('No active tabs found.');
            }
        });
    } catch (error) {
        console.error('Error on stop button click:', error);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['isRecording', 'isPaused'], (result) => {
        if (result.isRecording) {
            document.getElementById('start').classList.add('hidden');
            document.getElementById('controls').classList.remove('hidden');
        }
        if (result.isPaused) {
            document.getElementById('pause').classList.add('hidden');
            document.getElementById('start').classList.remove('hidden');
        }
    });
});
