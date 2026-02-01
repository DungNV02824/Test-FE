
const tabImages = new Map();

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id === undefined) return;


  await chrome.sidePanel.open({ tabId: tab.id });
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SCAN_IMAGES") {
    const tabId = sender.tab?.id;
    if (tabId) {

      tabImages.set(tabId, message.data);
      console.log(
        `[Background] Stored ${message.data.length} images for tab ${tabId}`,
      );


      if (message.data.length > 0) {
        chrome.sidePanel.open({ tabId: tabId }).catch((err) => {
          console.log("[Background] Could not open side panel:", err);
        });
      }


      chrome.runtime
        .sendMessage({
          type: "UPDATE_IMAGES",
          data: message.data,
          tabId: tabId,
        })
        .catch(() => {
         
        });
    }
    sendResponse({ ok: true });
  } else if (message.type === "GET_IMAGES") {
    const tabId = message.tabId;
    const images = tabImages.get(tabId) || [];
    console.log(`[Background] Sending ${images.length} images to side panel`);
    sendResponse({ images });
  }
});


chrome.tabs.onRemoved.addListener((tabId) => {
  tabImages.delete(tabId);
});
