chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getBlockingState") {
        chrome.storage.local.get(["blockingEnabled"], (result) => {
            sendResponse({ blockingEnabled: result.blockingEnabled ?? true });
        });
        return true;
    }
});
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ blockingEnabled: true });
});
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(["blockingEnabled"], (result) => {
        if (result.blockingEnabled === undefined) {
            chrome.storage.local.set({ blockingEnabled: true });
        }
    });
});