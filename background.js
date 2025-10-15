// Background script for YouTube Repeat Extension

// When the extension icon is clicked, send a message to toggle the panel
chrome.action.onClicked.addListener((tab) => {
  // Only work on YouTube pages
  if (tab.url && tab.url.includes('youtube.com/watch')) {
    chrome.tabs.sendMessage(tab.id, { type: 'toggle_panel' }).catch(() => {
      // If content script isn't loaded, show a notification
      console.log('Content script not loaded. Please refresh the page.');
    });
  }
});

// Listen for tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('youtube.com/watch')) {
    // Verify content script is loaded
    chrome.tabs.sendMessage(tabId, { type: 'ping' }).catch(() => {
      console.log('Content script not responding on tab', tabId);
    });
  }
});
