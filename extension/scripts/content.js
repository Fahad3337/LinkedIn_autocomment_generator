// State
let config = null;

// Initialize
chrome.runtime.sendMessage({ action: "GET_CONFIG" }, (response) => {
    if (response && response.config) {
        config = response.config;
        console.log("CommentFlow loaded config:", config);
        startObserver();
    }
});

function isTrackedPost() {
    if (!config || !config.campaigns) return null;
    const currentUrl = window.location.href.split('?')[0]; // strip query params

    // Find if current URL matches any active campaign
    return config.campaigns.find(c => {
        // LinkedIn URLs can be tricky, doing a loose includes match for the post ID
        const postIdMatch = c.post_url.match(/urn:li:activity:\d+/);
        if (postIdMatch && currentUrl.includes(postIdMatch[0])) return true;

        // Fallback to basic string includes
        return currentUrl.includes(c.post_url.split('?')[0]);
    });
}

function startObserver() {
    const campaign = isTrackedPost();
    if (!campaign) return;

    console.log("CommentFlow: Tracking active post:", campaign.post_title);

    // Poll for new comments every 3 seconds
    // (In a real production app, MutationObserver is better, but polling is safer against DOM changes)
    setInterval(() => {
        processNewComments(campaign);
    }, 3000);
}

async function processNewComments(campaign) {
    // Find all comment articles on the page
    const comments = document.querySelectorAll('article.comments-comment-item');

    for (const comment of comments) {
        // Check if we already processed this
        if (comment.dataset.cfProcessed === "true") continue;

        // Mark as processed immediately so we don't hit it again
        comment.dataset.cfProcessed = "true";

        const profileLink = comment.querySelector('a.app-aware-link');
        if (!profileLink) continue;

        const profileUrl = profileLink.href.split('?')[0];
        const nameEl = comment.querySelector('.comments-post-meta__name-text span[aria-hidden="true"]');
        const name = nameEl ? nameEl.innerText.trim() : "LinkedIn Member";

        // Check if we already contacted this person globally
        if (config.contacted_profiles.includes(profileUrl)) {
            console.log(`Already contacted ${name}, skipping.`);
            continue;
        }

        // It's a new comment! Execute automation sequence
        await automateInteraction(comment, name, profileUrl, campaign);
    }
}

async function automateInteraction(commentNode, name, profileUrl, campaign) {
    console.log(`Starting automation sequence for ${name}`);

    try {
        // 1. Like the comment
        const likeBtn = commentNode.querySelector('button[aria-label^="Like"]');
        if (likeBtn && likeBtn.getAttribute('aria-pressed') === 'false') {
            likeBtn.click();
            await sleep(1000); // realistic delay
        }

        // 2. Log event: Reply (We skip actual typing here to avoid UI breakage, but in a real extension we'd click Reply -> type -> submit)
        logEvent({
            campaign_id: campaign.id,
            event_type: "reply_posted",
            commenter_profile_url: profileUrl,
            commenter_name: name,
            status: "success",
            template_used: null
        });

        await sleep(2000);

        // 3. Send DM (In a real extension, we'd open the message modal or navigate to profile)
        // For this prototype, we will just format the template and log it as sent so you can see the flow

        const template = config.templates.find(t => t.id === campaign.template_id);
        if (!template) throw new Error("Template not found");

        const firstName = name.split(' ')[0];
        const message = template.message
            .replace('{{name}}', firstName)
            .replace('{{link}}', template.lead_magnet_url || "");

        console.log(`[SIMULATED SCROLL & CLICK] Sending DM to ${name}: \n${message}`);

        // Log success to dashboard
        logEvent({
            campaign_id: campaign.id,
            event_type: "dm_sent",
            commenter_profile_url: profileUrl,
            commenter_name: name,
            status: "success",
            template_used: template.name
        });

        // Add to local config so we don't message them again this session
        config.contacted_profiles.push(profileUrl);

    } catch (error) {
        console.error("Automation failed:", error);
        logEvent({
            campaign_id: campaign.id,
            event_type: "dm_sent",
            commenter_profile_url: profileUrl,
            commenter_name: name,
            status: "failed",
            error_message: error.message
        });
    }
}

function logEvent(payload) {
    chrome.runtime.sendMessage({ action: "LOG_EVENT", payload });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
