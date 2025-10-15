// Popup script for YouTube Repeat Extension

let currentTab = null;

// Convert seconds to HH:MM:SS or MM:SS format
function secondsToTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const decimals = (seconds % 1).toFixed(1).substring(1);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  } else {
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  }
}

// Convert time string (HH:MM:SS, MM:SS, or seconds) to seconds
function timeToSeconds(timeStr) {
  if (!timeStr) return 0;

  // If it's already a number (seconds), return it
  const asNumber = parseFloat(timeStr);
  if (!isNaN(asNumber) && !timeStr.includes(':')) {
    return asNumber;
  }

  // Parse time format (HH:MM:SS or MM:SS)
  const parts = timeStr.split(':').map(p => parseFloat(p));

  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    // Just seconds
    return parts[0];
  }

  return 0;
}

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  // Get current tab
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tabs[0];

  // Check if we're on a YouTube page
  if (!currentTab.url.includes('youtube.com/watch')) {
    showStatus('Please open a YouTube video page', 'warning');
    disableControls();
    return;
  }

  // Set up event listeners
  setupEventListeners();

  // Check if content script is loaded
  const isLoaded = await checkContentScriptLoaded();
  if (!isLoaded) {
    showStatus('Please refresh the YouTube page to activate the extension', 'warning');
    return;
  }

  // Update current time and duration
  updateVideoInfo();

  // Check current repeat status
  checkRepeatStatus();

  // Update video info periodically
  setInterval(updateVideoInfo, 1000);
});

// Check if content script is loaded
async function checkContentScriptLoaded() {
  try {
    const response = await chrome.tabs.sendMessage(currentTab.id, {
      type: 'ping'
    });
    return response && response.loaded;
  } catch (error) {
    return false;
  }
}

// Set up event listeners
function setupEventListeners() {
  document.getElementById('start-btn').addEventListener('click', startRepeat);
  document.getElementById('stop-btn').addEventListener('click', stopRepeat);
  document.getElementById('use-current-start').addEventListener('click', useCurrentTimeAsStart);
}

// Start repeat functionality
async function startRepeat() {
  const startTime = timeToSeconds(document.getElementById('start-time').value);
  const endTime = timeToSeconds(document.getElementById('end-time').value);
  const repeatCount = parseInt(document.getElementById('repeat-count').value) || 0;

  // Validate inputs
  if (endTime <= startTime) {
    showStatus('End time must be greater than start time', 'error');
    return;
  }

  if (endTime === 0) {
    showStatus('Please set an end time', 'error');
    return;
  }

  // Send message to content script
  try {
    const response = await chrome.tabs.sendMessage(currentTab.id, {
      type: 'start_repeat',
      config: {
        startTime: startTime,
        endTime: endTime,
        repeatCount: repeatCount
      }
    });

    if (response.success) {
      showStatus(`Repeat started (${repeatCount === 0 ? 'infinite' : repeatCount + ' times'})`, 'success');
    }
  } catch (error) {
    showStatus('Error: Please refresh the YouTube page', 'error');
    console.error(error);
  }
}

// Stop repeat functionality
async function stopRepeat() {
  try {
    const response = await chrome.tabs.sendMessage(currentTab.id, {
      type: 'stop_repeat'
    });

    if (response.success) {
      showStatus('Repeat stopped', 'info');
    }
  } catch (error) {
    showStatus('Error: Please refresh the YouTube page', 'error');
    console.error(error);
  }
}

// Use current video time as start time
async function useCurrentTimeAsStart() {
  try {
    const response = await chrome.tabs.sendMessage(currentTab.id, {
      type: 'get_current_time'
    });

    const timeStr = secondsToTime(response.currentTime);
    document.getElementById('start-time').value = timeStr;
    showStatus(`Start time set to ${timeStr}`, 'success');
  } catch (error) {
    showStatus('Error getting current time', 'error');
    console.error(error);
  }
}


// Update video info (current time and duration)
async function updateVideoInfo() {
  try {
    const [timeResponse, durationResponse] = await Promise.all([
      chrome.tabs.sendMessage(currentTab.id, { type: 'get_current_time' }),
      chrome.tabs.sendMessage(currentTab.id, { type: 'get_duration' })
    ]);

    document.getElementById('current-time').textContent = secondsToTime(timeResponse.currentTime);
    document.getElementById('duration').textContent = secondsToTime(durationResponse.duration);
  } catch (error) {
    // Silently fail - might be during page load
  }
}

// Check current repeat status
async function checkRepeatStatus() {
  try {
    const response = await chrome.tabs.sendMessage(currentTab.id, {
      type: 'get_status'
    });

    if (response.enabled) {
      showStatus(`Repeating: ${response.currentCount}${response.totalCount > 0 ? `/${response.totalCount}` : ''}`, 'success');
    }
  } catch (error) {
    // Silently fail
  }
}

// Show status message
function showStatus(message, type = 'info') {
  const statusElement = document.getElementById('status');
  statusElement.textContent = message;
  statusElement.className = `status ${type}`;
}

// Disable controls (when not on YouTube)
function disableControls() {
  document.getElementById('start-btn').disabled = true;
  document.getElementById('stop-btn').disabled = true;
  document.getElementById('use-current-start').disabled = true;
  document.getElementById('use-current-end').disabled = true;
  document.getElementById('start-time').disabled = true;
  document.getElementById('end-time').disabled = true;
  document.getElementById('repeat-count').disabled = true;
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'status_update') {
    showStatus(request.message, 'success');
  }
});
