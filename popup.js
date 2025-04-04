document.addEventListener('DOMContentLoaded', initializePopup);

// UI Elements
const focusToggle = document.getElementById('focusToggle');
const timerDisplay = document.getElementById('timer');
const startTimerBtn = document.getElementById('startTimer');
const resetTimerBtn = document.getElementById('resetTimer');
const todayMinutes = document.getElementById('todayMinutes');
const currentStreak = document.getElementById('currentStreak');
const settingsBtn = document.getElementById('settingsBtn');
const blockedSitesBtn = document.getElementById('blockedSitesBtn');

// Initialize popup state
async function initializePopup() {
  // Set up event listeners
  focusToggle.addEventListener('change', handleFocusToggle);
  startTimerBtn.addEventListener('click', handleStartTimer);
  resetTimerBtn.addEventListener('click', handleResetTimer);
  settingsBtn.addEventListener('click', openSettings);
  blockedSitesBtn.addEventListener('click', openBlockedSites);
  
  // Get current state
  const { focusModeActive, sessionInProgress } = await getCurrentState();
  focusToggle.checked = focusModeActive;
  
  if (sessionInProgress) {
    startTimerBtn.textContent = 'Pause Session';
    startTimerBtn.classList.add('active');
  }
  
  // Update stats
  updateStats();
  
  // Listen for updates from background
  chrome.runtime.onMessage.addListener(handleBackgroundMessages);
}

// Handle focus mode toggle
async function handleFocusToggle() {
  const active = focusToggle.checked;
  
  chrome.runtime.sendMessage({
    type: 'TOGGLE_FOCUS_MODE'
  }, (response) => {
    if (!response.success) {
      focusToggle.checked = !active;
    }
  });
}

// Handle timer start/pause
function handleStartTimer() {
  chrome.runtime.sendMessage({
    type: 'START_TIMER'
  }, (response) => {
    if (response.success) {
      startTimerBtn.textContent = 'Pause Session';
      startTimerBtn.classList.add('active');
    }
  });
}

// Handle timer reset
function handleResetTimer() {
  chrome.runtime.sendMessage({
    type: 'RESET_TIMER'
  }, (response) => {
    if (response.success) {
      timerDisplay.textContent = '25:00';
      startTimerBtn.textContent = 'Start Session';
      startTimerBtn.classList.remove('active');
    }
  });
}

// Update timer display
function updateTimer(minutes, seconds) {
  const displayMinutes = minutes.toString().padStart(2, '0');
  const displaySeconds = seconds.toString().padStart(2, '0');
  timerDisplay.textContent = `${displayMinutes}:${displaySeconds}`;
}

// Update stats display
async function updateStats() {
  const { focusHistory } = await chrome.storage.local.get('focusHistory');
  
  // Calculate today's minutes
  const today = new Date().toDateString();
  const todaysSessions = focusHistory.filter(session => 
    new Date(session.date).toDateString() === today
  );
  const totalMinutes = todaysSessions.reduce((acc, session) => 
    acc + session.duration, 0
  );
  
  todayMinutes.textContent = `${totalMinutes} mins`;
  
  // Calculate streak
  const streak = calculateStreak(focusHistory);
  currentStreak.textContent = `${streak} days`;
}

// Calculate current streak
function calculateStreak(history) {
  if (!history.length) return 0;
  
  const today = new Date().toDateString();
  const dates = [...new Set(
    history.map(session => 
      new Date(session.date).toDateString()
    )
  )].sort();
  
  let streak = 0;
  let currentDate = new Date(dates[dates.length - 1]);
  
  while (dates.includes(currentDate.toDateString())) {
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  return streak;
}

// Handle messages from background script
function handleBackgroundMessages(message) {
  switch (message.type) {
    case 'TIMER_UPDATE':
      updateTimer(message.time.minutes, message.time.seconds);
      break;
    case 'SESSION_COMPLETE':
      handleSessionComplete();
      break;
  }
}

// Handle session completion
function handleSessionComplete() {
  startTimerBtn.textContent = 'Start Session';
  startTimerBtn.classList.remove('active');
  updateStats();
}

// Get current state from background
function getCurrentState() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({
      type: 'GET_STATE'
    }, resolve);
  });
}

// Open settings page
function openSettings() {
  chrome.runtime.openOptionsPage();
}

// Open blocked sites page
function openBlockedSites() {
  chrome.tabs.create({
    url: 'blocked-sites.html'
  });
} 