const GEMINI_API_KEY = 'AIzaSyCxaqdmShxLGUOJiLDfPv2sH9L42TwW8GE';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "call_ai") {
    
    const requestBody = {
      contents: [{ 
        parts: [{ text: `Analyze this article and return ONLY a JSON object with "verdict" (WORTHY, CAUTION, WASTE), "score" (1-10), and "summary" (2 sentences). Text: ${request.text}` }] 
      }],
      // THIS IS THE KEY: Set all safety categories to "BLOCK_NONE"
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
      ],
      generationConfig: {
        responseMimeType: "application/json" // Forces Gemini to return pure JSON
      }
    };

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    })
    .then(res => res.json())
    .then(data => {
      // If safety blocks it anyway, data.candidates might be empty
      if (data.candidates && data.candidates[0].content) {
        const rawText = data.candidates[0].content.parts[0].text;
        sendResponse(JSON.parse(rawText));
      } else {
        sendResponse({ 
          verdict: "ERROR", 
          score: 0, 
          summary: "AI refused to summarize due to safety filters or empty content." 
        });
      }
    })
    .catch(err => sendResponse({ error: err.message }));

    return true; 
  }
});