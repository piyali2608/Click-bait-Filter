const GEMINI_API_KEY = 'YOUR_API_KEY';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "call_ai") {
    const prompt = `
      You are a Click-bait Filter. Review this article text and return ONLY a JSON object with:
      "verdict": (One word: WORTHY, CAUTION, or WASTE),
      "score": (A number 1-10),
      "summary": (Max 2 sentences explaining the core value).
      
      Text: ${request.text}`;

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    })
    .then(res => res.json())
    .then(data => {
      // Cleaning the markdown response if Gemini wraps it in ```json
      let rawText = data.candidates[0].content.parts[0].text;
      const cleanJson = rawText.replace(/```json|```/g, "");
      sendResponse(JSON.parse(cleanJson));
    })
    .catch(err => sendResponse({ error: err.message }));

    return true; 
  }
});