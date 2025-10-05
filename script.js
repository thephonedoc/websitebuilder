document.addEventListener('DOMContentLoaded', () => {
    // Check subscription status
    if (localStorage.getItem('paid') !== 'true') {
        window.location.href = 'subscribe.html';
        return;
    }

    const messagesDiv = document.getElementById('messages');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');

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
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_OPENAI_API_KEY'
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        { role: 'system', content: 'You are a helpful coding assistant that writes and explains HTML, CSS, and JavaScript for websites.' },
                        { role: 'user', content: question }
                    ],
                    max_tokens: 500,
                    temperature: 0.3
                })
            });
            if (!response.ok) {
                throw new Error('API error: ' + response.statusText);
            }
            const data = await response.json();
            const answer = data.choices[0].message.content.trim();
            // remove the temporary thinking message
            const lastBot = messagesDiv.querySelector('.message.bot:last-child');
            if (lastBot && lastBot.textContent === 'Thinking...') {
                messagesDiv.removeChild(lastBot);
            }
            appendMessage(answer, 'bot');
        } catch (error) {
            appendMessage('Error: ' + error.message, 'bot');
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});
