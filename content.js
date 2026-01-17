function extractArticleContent() {
  // Target common article containers
  const articleSelectors = ['article', '.post-content', '.article-body', 'main'];
  let mainContent = "";

  for (let selector of articleSelectors) {
    const el = document.querySelector(selector);
    if (el) {
      mainContent = el.innerText;
      break;
    }
  }

  // Fallback to body text if no article tag is found
  if (mainContent.length < 500) {
    mainContent = document.body.innerText;
  }

  return mainContent.substring(0, 3000); // Limit to 3000 chars for API speed
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrape") {
    sendResponse({ text: extractArticleContent() });
  }
});