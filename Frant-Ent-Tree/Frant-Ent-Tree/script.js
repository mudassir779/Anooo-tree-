const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const submitButton = chatForm.querySelector('button');

let conversationHistory = [];

function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;

    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    messageTime.textContent = formatTime(new Date());

    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(messageTime);

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Update history
    conversationHistory.push({
        role: isUser ? 'user' : 'assistant',
        content: content
    });
}

function showTypingIndicator() {
    const indicatorDiv = document.createElement('div');
    indicatorDiv.className = 'message bot-message typing-indicator-container';
    indicatorDiv.innerHTML = `
        <div class="typing-indicator">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
    `;
    chatMessages.appendChild(indicatorDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return indicatorDiv;
}

async function sendMessage(message) {
    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                conversationHistory
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('Error:', error);
        return "I apologize, but I'm having trouble connecting to the server. Please try again later or call us directly at 812-457-3433.";
    }
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const message = messageInput.value.trim();
    if (!message) return;

    // Disable input while sending
    messageInput.value = '';
    messageInput.disabled = true;
    submitButton.disabled = true;

    // Add user message
    addMessage(message, true);

    // Show typing indicator
    const typingIndicator = showTypingIndicator();

    // Get bot response
    const botResponse = await sendMessage(message);

    // Remove typing indicator
    typingIndicator.remove();

    // Add bot response
    addMessage(botResponse);

    // Re-enable input
    messageInput.disabled = false;
    submitButton.disabled = false;
    messageInput.focus();
});
