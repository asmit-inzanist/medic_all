import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🚀 AI-Chat function called')
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request
    const { message, userProfile, isFirstMessage, conversationHistory } = await req.json()
    console.log('📩 Received message:', message)
    console.log('🔄 Is first message:', isFirstMessage)
    
    if (!message) {
      throw new Error('Message is required')
    }

    // Get API key
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      console.error('❌ No API key found')
      throw new Error('API key not configured')
    }
    console.log('✅ API key found, length:', apiKey.length)

    // Create system prompt with conversation awareness
    const contextInfo = conversationHistory && conversationHistory.length > 0 
      ? `\n\nConversation Context: This is a continuing conversation. Previous messages: ${JSON.stringify(conversationHistory.slice(-2))}`
      : '';
      
    const greetingInstruction = isFirstMessage 
      ? 'This is the first message - you may greet the user warmly by name if available in profile.'
      : 'This is a follow-up message - DO NOT greet by name again, just respond directly to their concern.';

    const systemContext = `You are a helpful AI Health Assistant providing medical information and guidance. You are NOT a replacement for professional medical care.

CONVERSATION GUIDELINES:
- ${greetingInstruction}
- Keep responses natural and conversational without excessive formatting
- Use simple bullet points (-) instead of asterisks (*) when listing items
- Avoid using asterisks (*) for emphasis - use natural language instead
- Be direct, helpful, and empathetic
- For serious symptoms, recommend seeking medical attention

RESPONSE FORMAT:
- Write in a natural, conversational tone
- Use simple formatting with dashes (-) for lists
- Avoid repetitive greetings or name mentions
- Focus on addressing the specific health concern

User Profile: ${userProfile ? JSON.stringify(userProfile) : 'None provided'}${contextInfo}
User Question: ${message}

Provide a helpful, direct response about their health concern. Be empathetic but avoid over-formatting with asterisks.`

    console.log('🧠 Making Gemini API call...')

    // Call Gemini API with correct format
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: systemContext
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    })

    console.log('📡 Gemini response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Gemini API error:', errorText)
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('📄 Gemini response received')

    // Extract response
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
      const aiResponse = data.candidates[0].content.parts[0].text
      console.log('✅ Successfully extracted AI response')
      
      return new Response(
        JSON.stringify({
          response: aiResponse,
          suggestions: [
            "Find nearby doctors",
            "Emergency contacts",
            "More health tips",
            "Medication reminders"
          ]
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    } else {
      console.error('❌ Invalid response structure:', data)
      throw new Error('Invalid response from Gemini')
    }

  } catch (error) {
    console.error('💥 Function error:', error.message)
    
    // Return error response
    return new Response(
      JSON.stringify({
        error: error.message,
        response: "I'm experiencing technical difficulties right now. For immediate medical concerns, please contact your healthcare provider or emergency services."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
