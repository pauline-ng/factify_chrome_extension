// Page Action?
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (tab.url.indexOf('.pdf') != -1) {
        // page action show
        chrome.pageAction.show(tabId);
    }
});

// Clicked?
chrome.pageAction.onClicked.addListener(function() {
	
	chrome.contextMenus.create({id:"lookup",title:"Lookup %s",contexts:["selection"]});
	
	// when right clicked
	chrome.contextMenus.onClicked.addListener(function(sel){
		console.log(sel.selectionText);
	});
});

