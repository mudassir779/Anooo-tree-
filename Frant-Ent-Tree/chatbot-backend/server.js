import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI (optional - will use fallback if no API key)
let openai = null;
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
}

// Company information for the chatbot
const COMPANY_INFO = {
    name: "American Tree Experts",
    phone: "812-457-3433",
    email: "Thetreexperts@gmail.com",
    location: "Evansville, IN",
    services: [
        "Tree Trimming & Pruning",
        "Structural Pruning",
        "Tree Removal",
        "Land Clearing",
        "Storm Clean Up",
        "Commercial Tree Services",
        "24/7 Emergency Tree Service"
    ],
    serviceAreas: ["Evansville IN", "Newburgh, IN", "Boonville, IN", "Henderson, KY", "Warrick County"],
    features: [
        "Licensed and Insured",
        "24/7 Emergency Service",
        "Superior Service",
        "Highly Trained Professionals"
    ]
};

// System prompt for the AI
const SYSTEM_PROMPT = `You are Abdias, a friendly and professional customer service representative for American Tree Experts, a tree service company based in Evansville, Indiana.

Company Information:
- Phone: ${COMPANY_INFO.phone}
- Email: ${COMPANY_INFO.email}
- Location: ${COMPANY_INFO.location}
- Services: ${COMPANY_INFO.services.join(', ')}
- Service Areas: ${COMPANY_INFO.serviceAreas.join(', ')}
- Established: 1997 (Making the cut since 1997)

Key Features:
- Fully Licensed and Insured with certified arborists
- 24/7 Emergency Tree Service
- Superior customer service
- Highly trained professionals with proper safety equipment

SERVICES WE OFFER:
1. Tree Trimming/Pruning - Professional shaping and health maintenance
2. Structural Pruning - Corrective pruning for tree stability
3. Tree Removal - Safe removal of hazardous or unwanted trees
4. Stump Grinding/Removal - Complete stump elimination
5. Land Clearing - Property clearing for construction or landscaping
6. Storm Clean Up - Emergency debris and fallen tree removal
7. Emergency Tree Service - 24/7 urgent tree hazard response
8. Tree Planting - Professional tree selection and planting

COMMON CUSTOMER SCENARIOS & HOW TO RESPOND:

When customers call about trees near power lines:
- Express concern for their safety
- Ask about tree species, height (estimate), and how close to power lines
- Explain we have experience working safely around power lines
- Mention we use proper safety equipment and procedures
- Offer to schedule a free on-site assessment
- Typical cost range: Varies based on complexity, size, and proximity to obstacles

When asked about pricing:
- Explain that accurate estimates require an on-site assessment
- Mention we provide FREE quotes with no obligation
- General pricing factors: tree size (small: up to 30ft, medium: 30-60ft, large: 60ft+), location, obstacles, tree condition
- Encourage them to call ${COMPANY_INFO.phone} to schedule a free estimate

When asked about insurance and certifications:
- Confirm we are FULLY INSURED
- We have certified arborists on staff
- Our insurance covers any property damage during work
- All crews are trained in safety procedures

When asked about safety measures:
- All crews trained in safety procedures
- Proper safety equipment: helmets, safety glasses, gloves, harnesses
- Property protection: drop cloths, careful debris management
- No damage to fences, landscaping, or structures
- Insurance coverage for any unforeseen incidents

INFORMATION NEEDED FOR ACCURATE QUOTES:
When customers request quotes, gather this information:
1. Type of service needed (trimming, removal, stump grinding, emergency, etc.)
2. Number of trees requiring service
3. Tree details: species, size/height, condition (healthy/diseased/damaged)
4. Location on property: near structures, power lines, fences, or obstacles?
5. Specific concerns: dead branches, interference with roof/power lines, aesthetics, construction project?
6. Timeline: emergency or scheduled service?
7. Property address for on-site assessment

YOUR COMMUNICATION STYLE:
1. Be warm, professional, and reassuring
2. Show genuine concern for customer safety and property
3. Ask relevant follow-up questions to understand their needs
4. Provide helpful information without overwhelming them
5. Keep responses conversational and concise (2-4 sentences typically)
6. Always offer to schedule a free on-site assessment for accurate quotes
7. For emergencies, emphasize our 24/7 availability at ${COMPANY_INFO.phone}
8. Build trust by mentioning our experience since 1997, insurance, and certified arborists

EXAMPLE RESPONSES:

Customer: "I have a tree leaning over my power lines"
You: "I understand your concern - that's definitely a safety priority. We have extensive experience working safely around power lines. Could you tell me what type of tree it is and approximately how tall? I'd recommend scheduling a free on-site assessment so we can determine the safest approach. You can call us at ${COMPANY_INFO.phone}."

Customer: "How much does tree removal cost?"
You: "Tree removal costs vary based on the tree's size, location, and complexity. For example, a small tree (under 30 feet) in an open area costs less than a large tree near structures. We offer free, no-obligation quotes. Would you like to schedule an assessment? Call us at ${COMPANY_INFO.phone}."

Customer: "Do you have insurance?"
You: "Yes, absolutely! We are fully insured and have certified arborists on staff. Our insurance policy covers any damage to your property during the work, and we take extensive safety precautions to protect your home and landscaping."

Customer: "Can you come give me a quote?"
You: "Of course! We'd be happy to provide a free on-site assessment and written quote. Could you share your address and a preferred time? You can call us at ${COMPANY_INFO.phone} to schedule, or I can take your information now."

Always be helpful, build trust, and guide customers toward scheduling a free assessment or calling for immediate assistance.`;

// Fallback responses for when OpenAI is not available
const FALLBACK_RESPONSES = {
    greeting: [
        "Hello! I'm Abdias from American Tree Experts. How can I help you with your tree service needs today?",
        "Hi there! Thanks for contacting American Tree Experts. What can I assist you with?"
    ],
    services: [
        `We offer a wide range of tree services including: ${COMPANY_INFO.services.slice(0, 4).join(', ')}, and more! What service are you interested in?`,
        "We provide professional tree trimming, removal, land clearing, storm cleanup, and emergency services. Which service would you like to know more about?"
    ],
    pricing: [
        `Tree service costs vary based on size, location, and complexity. We offer FREE quotes! Please call us at ${COMPANY_INFO.phone} for an accurate estimate tailored to your specific needs.`,
        `For accurate pricing, I'd recommend calling us at ${COMPANY_INFO.phone} for a free on-site assessment. Our prices depend on tree size, location, and the specific work required.`
    ],
    emergency: [
        `We offer 24/7 emergency tree services! Please call us immediately at ${COMPANY_INFO.phone} for urgent tree emergencies.`,
        `For emergency tree service, call us right away at ${COMPANY_INFO.phone}. We're available 24/7!`
    ],
    contact: [
        `You can reach us at ${COMPANY_INFO.phone} or email ${COMPANY_INFO.email}. We're located in ${COMPANY_INFO.location}.`,
        `Call us at ${COMPANY_INFO.phone} or email ${COMPANY_INFO.email}. We'd love to help with your tree service needs!`
    ],
    insurance: [
        `Yes! We are fully insured and have certified arborists on staff. Our insurance covers any property damage during work, and we take extensive safety precautions.`,
        `Absolutely! We're fully licensed and insured with certified arborists. Your property is protected throughout the entire process.`
    ],
    safety: [
        `Safety is our top priority! All our crews are trained in safety procedures and use proper equipment including helmets, safety glasses, and gloves. We also protect your property with drop cloths and careful debris management.`,
        `We take safety very seriously. Our teams use professional safety equipment and follow strict protocols to protect both our crew and your property.`
    ],
    quote: [
        `We'd be happy to provide a free, no-obligation quote! Please call us at ${COMPANY_INFO.phone} to schedule an on-site assessment. We'll need to see the tree(s) to give you an accurate estimate.`,
        `I can help you get a quote! Call ${COMPANY_INFO.phone} and we'll schedule a free assessment. We'll discuss your needs and provide a detailed written estimate.`
    ],
    powerlines: [
        `Trees near power lines require special care and safety measures. We have extensive experience working safely around power lines. Please call ${COMPANY_INFO.phone} to schedule a free assessment - this is definitely a priority situation.`,
        `That's a safety concern we take very seriously. Our certified arborists are trained to work safely around power lines. Call us at ${COMPANY_INFO.phone} for a free on-site evaluation.`
    ],
    default: [
        `That's a great question! For detailed information, please call us at ${COMPANY_INFO.phone} and our team will be happy to assist you.`,
        `I'd be happy to help! For specific details, please reach out to us at ${COMPANY_INFO.phone}. Is there anything else I can help you with?`
    ]
};

// Function to get fallback response
function getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.match(/\b(hi|hello|hey|greetings)\b/)) {
        return FALLBACK_RESPONSES.greeting[Math.floor(Math.random() * FALLBACK_RESPONSES.greeting.length)];
    }

    if (lowerMessage.match(/\b(service|services|what do you|what can you|offer)\b/)) {
        return FALLBACK_RESPONSES.services[Math.floor(Math.random() * FALLBACK_RESPONSES.services.length)];
    }

    if (lowerMessage.match(/\b(price|pricing|cost|how much|estimate)\b/)) {
        return FALLBACK_RESPONSES.pricing[Math.floor(Math.random() * FALLBACK_RESPONSES.pricing.length)];
    }

    if (lowerMessage.match(/\b(emergency|urgent|asap|immediate|storm)\b/)) {
        return FALLBACK_RESPONSES.emergency[Math.floor(Math.random() * FALLBACK_RESPONSES.emergency.length)];
    }

    if (lowerMessage.match(/\b(insurance|insured|licensed|certified|arborist)\b/)) {
        return FALLBACK_RESPONSES.insurance[Math.floor(Math.random() * FALLBACK_RESPONSES.insurance.length)];
    }

    if (lowerMessage.match(/\b(safety|safe|protect|damage|equipment)\b/)) {
        return FALLBACK_RESPONSES.safety[Math.floor(Math.random() * FALLBACK_RESPONSES.safety.length)];
    }

    if (lowerMessage.match(/\b(quote|estimate|assessment|come out|visit)\b/)) {
        return FALLBACK_RESPONSES.quote[Math.floor(Math.random() * FALLBACK_RESPONSES.quote.length)];
    }

    if (lowerMessage.match(/\b(power line|powerline|electric|utility|wire)\b/)) {
        return FALLBACK_RESPONSES.powerlines[Math.floor(Math.random() * FALLBACK_RESPONSES.powerlines.length)];
    }

    if (lowerMessage.match(/\b(contact|phone|email|call|reach)\b/)) {
        return FALLBACK_RESPONSES.contact[Math.floor(Math.random() * FALLBACK_RESPONSES.contact.length)];
    }

    return FALLBACK_RESPONSES.default[Math.floor(Math.random() * FALLBACK_RESPONSES.default.length)];
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        let response;

        // Try to use OpenAI if available
        if (openai) {
            try {
                const messages = [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...conversationHistory.slice(-10), // Keep last 10 messages for context
                    { role: 'user', content: message }
                ];

                const completion = await openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: messages,
                    max_tokens: 200,
                    temperature: 0.7,
                });

                response = completion.choices[0].message.content;
            } catch (openaiError) {
                console.error('OpenAI Error:', openaiError.message);
                // Fall back to rule-based responses if OpenAI fails
                response = getFallbackResponse(message);
            }
        } else {
            // Use fallback responses if no OpenAI key
            response = getFallbackResponse(message);
        }

        res.json({
            response,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({
            error: 'Internal server error',
            response: `I apologize for the inconvenience. Please call us directly at ${COMPANY_INFO.phone} for immediate assistance.`
        });
    }
});

// Testimonials endpoint
app.get('/api/testimonials/get-testimonials', (req, res) => {
    res.json({
        testimonials: [
            {
                id: 1,
                name: "John Smith",
                rating: 5,
                comment: "Excellent service! The team was professional and efficient.",
                date: "2024-11-15"
            },
            {
                id: 2,
                name: "Sarah Johnson",
                rating: 5,
                comment: "Very satisfied with the tree removal service. Highly recommend!",
                date: "2024-11-10"
            },
            {
                id: 3,
                name: "Mike Williams",
                rating: 5,
                comment: "Great work on trimming our trees. They look fantastic!",
                date: "2024-11-05"
            }
        ]
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        openaiEnabled: !!openai
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'American Tree Experts Chatbot API',
        version: '1.0.0',
        endpoints: {
            chat: 'POST /api/chat',
            health: 'GET /api/health'
        }
    });
});

app.listen(PORT, () => {
    console.log(`🌳 American Tree Experts Chatbot API running on port ${PORT}`);
    console.log(`🤖 OpenAI Integration: ${openai ? 'Enabled' : 'Disabled (using fallback responses)'}`);
    console.log(`📍 http://localhost:${PORT}`);
});
