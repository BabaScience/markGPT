chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'logError') {
    console.error('Error from popup.js:', message.message);
  }
});
