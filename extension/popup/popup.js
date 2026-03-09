document.addEventListener('DOMContentLoaded', async () => {
    const setupView = document.getElementById('setup-view');
    const connectedView = document.getElementById('connected-view');
    const apiKeyInput = document.getElementById('api-key');
    const saveBtn = document.getElementById('save-btn');
    const disconnectBtn = document.getElementById('disconnect-btn');
    const statusMsg = document.getElementById('status-msg');

    // Load existing key
    chrome.storage.local.get(['cf_access_token'], (result) => {
        if (result.cf_access_token) {
            showConnected();
        }
    });

    saveBtn.addEventListener('click', () => {
        const token = apiKeyInput.value.trim();
        if (!token) {
            showError("Please enter your Access Token");
            return;
        }

        saveBtn.innerText = "Connecting...";

        // Verify token with API
        fetch("http://localhost:3000/api/auth/me", {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) throw new Error(data.error);

                // Save and show success
                chrome.storage.local.set({ cf_access_token: token }, () => {
                    showConnected();
                    saveBtn.innerText = "Connect Account";
                    apiKeyInput.value = "";
                });
            })
            .catch(err => {
                showError(err.message || "Invalid or expired token");
                saveBtn.innerText = "Connect Account";
            });
    });

    disconnectBtn.addEventListener('click', () => {
        chrome.storage.local.remove(['cf_access_token'], () => {
            setupView.style.display = 'block';
            connectedView.style.display = 'none';
            statusMsg.style.display = 'none';
        });
    });

    function showConnected() {
        setupView.style.display = 'none';
        connectedView.style.display = 'block';
        statusMsg.style.display = 'none';
        // Tell background script to pull config immediately
        chrome.runtime.sendMessage({ action: "SYNC_CONFIG" });
    }

    function showError(msg) {
        statusMsg.innerText = msg;
        statusMsg.className = "status error";
        statusMsg.style.display = 'block';
    }
});
