// Page Action?
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (tab.url.indexOf('.pdf') != -1) {
        // page action show
        chrome.pageAction.show(tabId);
    }
});

// Clicked?
chrome.pageAction.onClicked.addListener(function() {
    chrome.tabs.executeScript(null, {
        "code": "console.log(\"wanna extract huh?\")"
    })
});