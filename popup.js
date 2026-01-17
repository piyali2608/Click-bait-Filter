document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('analyze-btn');
  const useBtn = document.getElementById('use-limit-btn');
  const loader = document.getElementById('loader');
  const results = document.getElementById('results');

  // Load existing limit from storage
  chrome.storage.local.get(['reads'], (data) => {
    updateUI(data.reads || 0);
  });

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    loader.style.display = 'block';
    results.style.display = 'none';

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // 1. Scrape
    chrome.tabs.sendMessage(tab.id, { action: "scrape" }, (response) => {
      if (!response || !response.text) {
        alert("Could not read article content.");
        resetBtn();
        return;
      }

      // 2. Process with AI
      chrome.runtime.sendMessage({ action: "call_ai", text: response.text }, (aiRes) => {
        loader.style.display = 'none';
        if (aiRes.error) {
          alert("AI Error: " + aiRes.error);
        } else {
          showResults(aiRes);
        }
        btn.disabled = false;
      });
    });
  });

  useBtn.addEventListener('click', () => {
    chrome.storage.local.get(['reads'], (data) => {
      const newCount = (data.reads || 0) + 1;
      chrome.storage.local.set({ reads: newCount }, () => {
        updateUI(newCount);
        useBtn.disabled = true;
        useBtn.innerText = "Enjoy your read!";
      });
    });
  });

  function showResults(data) {
    results.style.display = 'block';
    document.getElementById('verdict-badge').innerText = data.verdict;
    document.getElementById('verdict-badge').className = `badge ${data.verdict}`;
    document.getElementById('summary').innerText = data.summary;
    document.getElementById('score-text').innerText = `Quality: ${data.score}/10`;
  }

  function updateUI(count) {
    const limit = 5;
    document.getElementById('usage-label').innerText = `${count} / ${limit} Reads`;
    document.getElementById('progress-bar').style.width = `${(count / limit) * 100}%`;
  }

  function resetBtn() {
    btn.disabled = false;
    loader.style.display = 'none';
  }
});