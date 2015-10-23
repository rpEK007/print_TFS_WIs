function checkForTFSOnActivation(activeInfo) {
	chrome.tabs.get(activeInfo.tabId, checkForTFS);
   
};
function checkForTFSOnUpdate(tabId, changeInfo, tab) {
	checkForTFS(tab);
};

function checkForTFS(tab) {
	var a = document.createElement ('a');

    a.href = tab.url;
    if (/tfs/i.test(location.hostname)) {
        chrome.pageAction.show(tab.id);
    }
};

chrome.tabs.onActivated.addListener(checkForTFSOnActivation);
chrome.tabs.onUpdated.addListener(checkForTFSOnUpdate);