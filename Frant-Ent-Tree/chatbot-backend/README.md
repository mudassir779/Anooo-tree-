# American Tree Experts Chatbot Backend

A Node.js/Express backend API for the American Tree Experts chatbot with OpenAI integration and intelligent fallback responses.

## Features

- 🤖 **AI-Powered Responses**: Uses OpenAI GPT-3.5 for intelligent conversations
- 🔄 **Smart Fallbacks**: Rule-based responses when OpenAI is unavailable
- 🌳 **Tree Service Knowledge**: Pre-configured with company information
- 🚀 **Easy Setup**: Simple installation and configuration
- 📱 **CORS Enabled**: Works with your frontend application

## Quick Start

### 1. Install Dependencies

```bash
cd chatbot-backend
npm install
```

### 2. Configure Environment

Edit the `.env` file:

```env
PORT=3000
OPENAI_API_KEY=your-openai-api-key-here  # Optional
```

**Note**: The chatbot works WITHOUT an OpenAI API key using intelligent fallback responses. To enable AI-powered responses, get a key from [OpenAI Platform](https://platform.openai.com/api-keys).

### 3. Start the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### POST `/api/chat`

Send a message to the chatbot.

**Request Body**:
```json
{
  "message": "What services do you offer?",
  "conversationHistory": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi! How can I help?" }
  ]
}
```

**Response**:
```json
{
  "response": "We offer tree trimming, removal, land clearing, and more!",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET `/api/health`

Check server status.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "openaiEnabled": true
}
```

## Company Information

The chatbot is pre-configured with:

- **Company**: American Tree Experts
- **Phone**: 812-457-3433
- **Email**: Thetreexperts@gmail.com
- **Location**: Evansville, IN
- **Services**: Tree Trimming, Pruning, Removal, Land Clearing, Storm Cleanup, Emergency Services
- **Service Areas**: Evansville, Newburgh, Boonville, Henderson KY, Warrick County

## Fallback Response System

When OpenAI is not available, the chatbot uses intelligent pattern matching to respond to:

- Greetings (hi, hello, hey)
- Service inquiries
- Pricing questions
- Emergency requests
- Contact information
- General questions

## Deployment

### Deploy to Coolify

1. Push code to your repository
2. In Coolify, create a new application
3. Set environment variables:
   - `PORT=3000`
   - `OPENAI_API_KEY=your-key` (optional)
4. Deploy!

### Update Frontend

Update the Redux store in your frontend to point to your deployed backend:

```javascript
// src/Features/prodRoute.js
link: "https://your-backend-url.coolify.app"
```

## Testing

Test the API with curl:

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test chat endpoint
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What services do you offer?"}'
```

## Troubleshooting

**Port already in use?**
```bash
# Change PORT in .env file
PORT=3001
```

**OpenAI errors?**
- The chatbot will automatically fall back to rule-based responses
- Check your API key is valid
- Ensure you have credits in your OpenAI account

## License

ISC
