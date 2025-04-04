// State management
let state = {
  focusModeActive: false,
  sessionInProgress: false,
  timerMinutes: 25,
  timerSeconds: 0,
  defaultBlockedSites: [
    'twitter.com',
    'facebook.com',
    'reddit.com',
    'youtube.com',
    'instagram.com'
  ]
};

// Initialize storage with default values
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    blockedSites: state.defaultBlockedSites,
    focusHistory: [],
    settings: {
      timerDuration: 25,
      notifications: true,
      autoCloseBlocked: true
    }
  });
});

// Listen for focus mode toggle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'TOGGLE_FOCUS_MODE') {
    toggleFocusMode();
    sendResponse({ success: true });
  }
  if (request.type === 'START_TIMER') {
    startFocusTimer();
    sendResponse({ success: true });
  }
  return true;
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (state.focusModeActive && changeInfo.url) {
    checkBlockedSite(tab);
  }
});

// Handle new tabs
chrome.tabs.onCreated.addListener((tab) => {
  if (state.focusModeActive) {
    checkBlockedSite(tab);
  }
});

async function toggleFocusMode() {
  state.focusModeActive = !state.focusModeActive;
  
  if (state.focusModeActive) {
    // Get all tabs and hide/close blocked ones
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      await checkBlockedSite(tab);
    }
  } else {
    // End focus session if active
    if (state.sessionInProgress) {
      endFocusSession();
    }
  }
  
  // Update extension badge
  chrome.action.setBadgeText({
    text: state.focusModeActive ? 'ON' : ''
  });
  chrome.action.setBadgeBackgroundColor({
    color: '#6FCF97'
  });
}

async function checkBlockedSite(tab) {
  const blockedSites = await chrome.storage.local.get('blockedSites');
  const settings = await chrome.storage.local.get('settings');
  
  if (!tab.url) return;
  
  const isBlocked = blockedSites.blockedSites.some(site => 
    tab.url.includes(site)
  );
  
  if (isBlocked) {
    if (settings.settings.autoCloseBlocked) {
      chrome.tabs.remove(tab.id);
    } else {
      // Inject blocking overlay
      chrome.tabs.sendMessage(tab.id, {
        type: 'BLOCK_SITE'
      });
    }
  }
}

function startFocusTimer() {
  if (state.sessionInProgress) return;
  
  state.sessionInProgress = true;
  state.timerMinutes = 25;
  state.timerSeconds = 0;
  
  // Create alarm for timer updates
  chrome.alarms.create('focusTimer', {
    periodInMinutes: 1
  });
}

// Handle timer ticks
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'focusTimer') {
    updateTimer();
  }
});

function updateTimer() {
  if (!state.sessionInProgress) return;
  
  if (state.timerSeconds === 0) {
    if (state.timerMinutes === 0) {
      endFocusSession();
      return;
    }
    state.timerMinutes--;
    state.timerSeconds = 59;
  } else {
    state.timerSeconds--;
  }
  
  // Update popup with new time
  chrome.runtime.sendMessage({
    type: 'TIMER_UPDATE',
    time: {
      minutes: state.timerMinutes,
      seconds: state.timerSeconds
    }
  });
}

async function endFocusSession() {
  state.sessionInProgress = false;
  chrome.alarms.clear('focusTimer');
  
  // Log session
  const now = new Date();
  const session = {
    date: now.toISOString(),
    duration: 25 - state.timerMinutes
  };
  
  const { focusHistory } = await chrome.storage.local.get('focusHistory');
  focusHistory.push(session);
  await chrome.storage.local.set({ focusHistory });
  
  // Show notification
  const settings = await chrome.storage.local.get('settings');
  if (settings.settings.notifications) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Focus Session Complete!',
      message: `Great job! You focused for ${25 - state.timerMinutes} minutes.`
    });
  }
  
  // Reset timer
  state.timerMinutes = 25;
  state.timerSeconds = 0;
  
  // Update popup
  chrome.runtime.sendMessage({
    type: 'SESSION_COMPLETE'
  });
} 