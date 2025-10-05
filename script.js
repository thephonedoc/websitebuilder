document.addEventListener('DOMContentLoaded', () => {
  // Check subscription status
  if (localStorage.getItem('paid') !== 'true') {
    window.location.href = 'subscribe.html';
    return;
  }

  const messagesDiv = document.getElementById('messages');
  const userInput   = document.getElementById('userInput');
  const sendBtn     = document.getElementById('sendBtn');

  // Helper to append a message to the chat
  function appendMessage(content, className) {
    const div = document.createElement('div');
    div.className = 'message ' + className;
    div.textContent = content;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  async function sendMessage() {
    const question = userInput.value.trim();
    if (!question) return;
    appendMessage(question, 'user');
    userInput.value = '';
    appendMessage('Thinking...', 'bot');

    // Replace with your own OpenAI API key below. Without a valid key the chat will not function.
    const API_KEY = 'YOUR_OPENAI_API_KEY';
    if (!API_KEY || API_KEY === 'YOUR_OPENAI_API_KEY') {
      messagesDiv.removeChild(messagesDiv.lastChild); // remove 'Thinking...'
      appendMessage('Error: The AI service is not configured. Please provide your OpenAI API key in script.js.', 'bot');
      return;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are a helpful assistant who helps users write code for websites.' },
            { role: 'user', content: question }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message = errorData?.error?.message || response.statusText;
        throw new Error(message);
      }

      const data = await response.json();
      const botResponse = data.choices[0].message.content;
      messagesDiv.removeChild(messagesDiv.lastChild);
      appendMessage(botResponse.trim(), 'bot');
    } catch (error) {
      console.error('Error:', error);
      messagesDiv.removeChild(messagesDiv.lastChild);
      appendMessage('Error: ' + error.message, 'bot');
    }
  }

  // Send message when clicking the Send button or pressing Enter
  sendBtn.addEventListener('click', sendMessage);
  userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') sendMessage();
  });
});
