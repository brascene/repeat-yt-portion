// YouTube Repeat Extension - Content Script

let repeatConfig = {
  enabled: false,
  startTime: 0,
  endTime: 0,
  repeatCount: 0,
  currentCount: 0
};

let video = null;
let checkInterval = null;
let uiPanel = null;
let isPanelVisible = false;

// Convert seconds to HH:MM:SS or MM:SS format
function secondsToTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  } else {
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  }
}

// Convert time string to seconds
function timeToSeconds(timeStr) {
  if (!timeStr) return 0;
  const asNumber = parseFloat(timeStr);
  if (!isNaN(asNumber) && !timeStr.includes(':')) {
    return asNumber;
  }
  const parts = timeStr.split(':').map(p => parseFloat(p));
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }
  return 0;
}

// Initialize the extension when the page loads
function initialize() {
  // Find the YouTube video element
  video = document.querySelector('video');

  if (video) {
    console.log('YouTube Repeat: Video element found');
    setupVideoListeners();
    createUIPanel();
  } else {
    // Wait for the video element to load
    const observer = new MutationObserver(() => {
      video = document.querySelector('video');
      if (video) {
        console.log('YouTube Repeat: Video element found via observer');
        setupVideoListeners();
        createUIPanel();
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Create the UI panel injected into the page
function createUIPanel() {
  // Check if UI already exists
  if (document.getElementById('yt-repeat-toggle')) {
    console.log('YouTube Repeat: UI already exists');
    return;
  }

  console.log('YouTube Repeat: Creating UI panel');

  // Create toggle button
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'yt-repeat-toggle';
  toggleBtn.innerHTML = `
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 2L22 7L17 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M22 7H9C6.23858 7 4 9.23858 4 12V12" stroke="white" stroke-width="2" stroke-linecap="round"/>
      <path d="M7 22L2 17L7 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M2 17H15C17.7614 17 20 14.7614 20 12V12" stroke="white" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;
  toggleBtn.title = 'YouTube Repeat - Click to open';
  toggleBtn.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #ff0000;
    color: white;
    border: none;
    cursor: pointer;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s, background 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  `;
  toggleBtn.addEventListener('mouseover', () => {
    toggleBtn.style.transform = 'scale(1.1)';
    toggleBtn.style.background = '#cc0000';
  });
  toggleBtn.addEventListener('mouseout', () => {
    toggleBtn.style.transform = 'scale(1)';
    toggleBtn.style.background = '#ff0000';
  });
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePanel();
  });
  document.body.appendChild(toggleBtn);
  console.log('YouTube Repeat: Toggle button added');

  // Create panel
  uiPanel = document.createElement('div');
  uiPanel.id = 'yt-repeat-panel';
  uiPanel.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 320px;
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    z-index: 9998;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: none;
  `;

  uiPanel.innerHTML = `
    <style>
      #yt-repeat-panel h3 {
        margin: 0 0 16px 0;
        font-size: 18px;
        color: #1a1a1a;
        font-weight: 600;
      }
      #yt-repeat-panel .field {
        margin-bottom: 14px;
      }
      #yt-repeat-panel label {
        display: block;
        font-size: 13px;
        font-weight: 500;
        color: #333;
        margin-bottom: 6px;
      }
      #yt-repeat-panel input[type="text"],
      #yt-repeat-panel input[type="number"] {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        box-sizing: border-box;
      }
      #yt-repeat-panel input:focus {
        outline: none;
        border-color: #ff0000;
      }
      #yt-repeat-panel small {
        display: block;
        font-size: 11px;
        color: #666;
        margin-top: 4px;
      }
      #yt-repeat-panel .time-group {
        display: flex;
        gap: 8px;
        align-items: flex-end;
      }
      #yt-repeat-panel .time-group input {
        flex: 1;
      }
      #yt-repeat-panel .btn-small {
        padding: 8px 12px;
        background: #f0f0f0;
        color: #333;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        white-space: nowrap;
      }
      #yt-repeat-panel .btn-small:hover {
        background: #e0e0e0;
      }
      #yt-repeat-panel .info-box {
        background: #f8f8f8;
        padding: 10px;
        border-radius: 6px;
        font-size: 13px;
        margin-bottom: 14px;
      }
      #yt-repeat-panel .info-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
      }
      #yt-repeat-panel .info-row:last-child {
        margin-bottom: 0;
      }
      #yt-repeat-panel .btn-group {
        display: flex;
        gap: 8px;
        margin-top: 16px;
      }
      #yt-repeat-panel .btn-primary {
        flex: 1;
        padding: 10px;
        background: #ff0000;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }
      #yt-repeat-panel .btn-primary:hover {
        background: #cc0000;
      }
      #yt-repeat-panel .btn-secondary {
        flex: 1;
        padding: 10px;
        background: #e0e0e0;
        color: #333;
        border: none;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }
      #yt-repeat-panel .btn-secondary:hover {
        background: #d0d0d0;
      }
      #yt-repeat-panel .status {
        padding: 10px;
        border-radius: 6px;
        font-size: 13px;
        text-align: center;
        font-weight: 500;
        margin-bottom: 14px;
      }
      #yt-repeat-panel .status.success {
        background: #e8f5e9;
        color: #2e7d32;
      }
      #yt-repeat-panel .status.error {
        background: #ffebee;
        color: #c62828;
      }
      #yt-repeat-panel .status.info {
        background: #e3f2fd;
        color: #1565c0;
      }
    </style>
    <h3>🔁 YouTube Repeat</h3>

    <div class="field">
      <label>Start Time:</label>
      <div class="time-group">
        <input type="text" id="yt-repeat-start" placeholder="0:00">
        <button class="btn-small" id="yt-repeat-use-current">Use Current</button>
      </div>
      <small>Format: MM:SS or HH:MM:SS</small>
    </div>

    <div class="field">
      <label>End Time:</label>
      <input type="text" id="yt-repeat-end" placeholder="0:10">
      <small>Scrub video to find end time</small>
    </div>

    <div class="field">
      <label>Repeat Count:</label>
      <input type="number" id="yt-repeat-count" min="0" placeholder="0 (infinite)">
      <small>Set to 0 for infinite loop</small>
    </div>

    <div class="info-box">
      <div class="info-row">
        <strong>Current:</strong>
        <span id="yt-repeat-current-time">0:00</span>
      </div>
      <div class="info-row">
        <strong>Duration:</strong>
        <span id="yt-repeat-duration">0:00</span>
      </div>
    </div>

    <div class="status info" id="yt-repeat-status">Ready to start</div>

    <div class="btn-group">
      <button class="btn-primary" id="yt-repeat-start-btn">Start Repeat</button>
      <button class="btn-secondary" id="yt-repeat-stop-btn">Stop</button>
    </div>
  `;

  document.body.appendChild(uiPanel);

  // Set up event listeners
  document.getElementById('yt-repeat-use-current').addEventListener('click', useCurrentTime);
  document.getElementById('yt-repeat-start-btn').addEventListener('click', startRepeatFromUI);
  document.getElementById('yt-repeat-stop-btn').addEventListener('click', stopRepeat);

  // Update time display
  setInterval(updateTimeDisplay, 1000);
}

// Toggle panel visibility
function togglePanel() {
  isPanelVisible = !isPanelVisible;
  uiPanel.style.display = isPanelVisible ? 'block' : 'none';
}

// Update time display
function updateTimeDisplay() {
  if (!video || !uiPanel) return;
  document.getElementById('yt-repeat-current-time').textContent = secondsToTime(video.currentTime);
  document.getElementById('yt-repeat-duration').textContent = secondsToTime(video.duration);
}

// Use current time
function useCurrentTime() {
  if (!video) return;
  document.getElementById('yt-repeat-start').value = secondsToTime(video.currentTime);
  showStatus('Start time set to ' + secondsToTime(video.currentTime), 'success');
}

// Start repeat from UI
function startRepeatFromUI() {
  const startTime = timeToSeconds(document.getElementById('yt-repeat-start').value);
  const endTime = timeToSeconds(document.getElementById('yt-repeat-end').value);
  const repeatCount = parseInt(document.getElementById('yt-repeat-count').value) || 0;

  if (endTime <= startTime) {
    showStatus('End time must be greater than start time', 'error');
    return;
  }

  if (endTime === 0) {
    showStatus('Please set an end time', 'error');
    return;
  }

  startRepeat({
    startTime: startTime,
    endTime: endTime,
    repeatCount: repeatCount
  });

  showStatus(`Repeat started (${repeatCount === 0 ? 'infinite' : repeatCount + ' times'})`, 'success');
}

// Show status in UI
function showStatus(message, type = 'info') {
  const statusEl = document.getElementById('yt-repeat-status');
  if (statusEl) {
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
  }
}

// Set up video event listeners
function setupVideoListeners() {
  // Listen for timeupdate events to check if we need to loop
  video.addEventListener('timeupdate', handleTimeUpdate);

  // Listen for video end
  video.addEventListener('ended', handleVideoEnd);
}

// Handle time updates during playback
function handleTimeUpdate() {
  if (!repeatConfig.enabled || !video) return;

  const currentTime = video.currentTime;

  // Check if we've reached the end time
  if (currentTime >= repeatConfig.endTime) {
    repeatConfig.currentCount++;

    // Check if we've completed all repeats
    if (repeatConfig.repeatCount > 0 && repeatConfig.currentCount >= repeatConfig.repeatCount) {
      stopRepeat();
      video.pause();
      sendStatusUpdate('Repeat completed - video paused');
    } else {
      // Loop back to start time
      video.currentTime = repeatConfig.startTime;
      sendStatusUpdate(`Repeat ${repeatConfig.currentCount}${repeatConfig.repeatCount > 0 ? `/${repeatConfig.repeatCount}` : ''}`);
    }
  }
}

// Handle video ending
function handleVideoEnd() {
  if (repeatConfig.enabled) {
    stopRepeat();
  }
}

// Start the repeat functionality
function startRepeat(config) {
  repeatConfig = {
    enabled: true,
    startTime: config.startTime,
    endTime: config.endTime,
    repeatCount: config.repeatCount,
    currentCount: 0
  };

  if (video) {
    video.currentTime = repeatConfig.startTime;
    video.play();
    sendStatusUpdate('Repeat started');
  }
}

// Stop the repeat functionality
function stopRepeat() {
  repeatConfig.enabled = false;
  repeatConfig.currentCount = 0;
  sendStatusUpdate('Repeat stopped');
}

// Send status updates to the popup
function sendStatusUpdate(message) {
  chrome.runtime.sendMessage({
    type: 'status_update',
    message: message,
    currentCount: repeatConfig.currentCount,
    totalCount: repeatConfig.repeatCount
  });
}

// Get current video time
function getCurrentTime() {
  return video ? video.currentTime : 0;
}

// Get video duration
function getVideoDuration() {
  return video ? video.duration : 0;
}

// Listen for messages from the popup and background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'ping':
      sendResponse({ loaded: true });
      break;

    case 'toggle_panel':
      togglePanel();
      sendResponse({ success: true });
      break;

    case 'start_repeat':
      startRepeat(request.config);
      sendResponse({ success: true });
      break;

    case 'stop_repeat':
      stopRepeat();
      sendResponse({ success: true });
      break;

    case 'get_current_time':
      sendResponse({ currentTime: getCurrentTime() });
      break;

    case 'get_duration':
      sendResponse({ duration: getVideoDuration() });
      break;

    case 'get_status':
      sendResponse({
        enabled: repeatConfig.enabled,
        currentCount: repeatConfig.currentCount,
        totalCount: repeatConfig.repeatCount
      });
      break;

    case 'set_current_time':
      if (video) {
        video.currentTime = request.time;
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'No video found' });
      }
      break;
  }

  return true; // Keep the message channel open for async responses
});

// Initialize when the script loads
initialize();
