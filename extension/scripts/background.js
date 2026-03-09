// Constants
const API_URL = "http://localhost:3000/api";
const POLL_INTERVAL_MINUTES = 5;

// State stored in memory (synced from storage on boot)
let token = null;
let config = null;

// Initialization
chrome.runtime.onInstalled.addListener(() => {
    console.log("CommentFlow Extension Installed");
    init();
});

chrome.runtime.onStartup.addListener(() => {
    init();
});

function init() {
    chrome.storage.local.get(["cf_access_token"], (result) => {
        if (result.cf_access_token) {
            token = result.cf_access_token;
            syncConfig();
            setupAlarms();
        }
    });
}

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "SYNC_CONFIG") {
        // Popup tells us we have a new token, grab it and sync
        chrome.storage.local.get(["cf_access_token"], (result) => {
            if (result.cf_access_token) {
                token = result.cf_access_token;
                syncConfig();
                setupAlarms();
            }
        });
        sendResponse({ status: "syncing" });
    } else if (request.action === "GET_CONFIG") {
        // Content script asking for rules
        sendResponse({ config });
    } else if (request.action === "LOG_EVENT") {
        // Content script reporting an event
        logEvent(request.payload);
        sendResponse({ status: "logged" });
    }
    return true; // Keep channel open for async
});

// Alarm for periodic polling
function setupAlarms() {
    chrome.alarms.create("pollConfig", { periodInMinutes: POLL_INTERVAL_MINUTES });
}

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "pollConfig" && token) {
        syncConfig();
    }
});

// API Calls
async function syncConfig() {
    if (!token) return;
    try {
        const res = await fetch(`${API_URL}/extension/config`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            config = data.data;
            // Persist to storage just in case service worker dies
            chrome.storage.local.set({ cf_config: config });
            console.log("Config synced:", config);
        }
    } catch (err) {
        console.error("Failed to sync config:", err);
    }
}

async function logEvent(payload) {
    if (!token) return;
    try {
        const res = await fetch(`${API_URL}/extension/event`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        console.log("Event logged to dashboard:", await res.json());
    } catch (err) {
        console.error("Failed to log event:", err);
    }
}
