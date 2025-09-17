import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🚀 AI-Chat function called at:', new Date().toISOString())
  console.log('📍 Request method:', req.method)
  console.log('🌐 Request URL:', req.url)
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight handled')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request
    const requestBody = await req.text()
    console.log('📥 Raw request body:', requestBody)
    
    const { message, userProfile, isFirstMessage, conversationHistory, attachments } = JSON.parse(requestBody)
    console.log('📩 Received message:', message)
    console.log('👤 User profile present:', !!userProfile)
    console.log('🔄 Is first message:', isFirstMessage)
    console.log('📎 Attachments:', attachments?.length || 0)
    console.log('💬 Conversation history length:', conversationHistory?.length || 0)
    
    if (!message && (!attachments || attachments.length === 0)) {
      console.log('❌ No message or attachments provided')
      throw new Error('Message or attachments are required')
    }

    // Get API key
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      console.error('❌ No GEMINI_API_KEY found in environment')
      throw new Error('API key not configured')
    }
    console.log('✅ API key found, length:', apiKey.length)
    console.log('🔑 API key prefix:', apiKey.substring(0, 10) + '...')

    // Create system prompt with conversation awareness
    const contextInfo = conversationHistory && conversationHistory.length > 0 
      ? `\n\nConversation Context: This is a continuing conversation. Previous messages: ${JSON.stringify(conversationHistory.slice(-2))}`
      : '';
      
    const greetingInstruction = isFirstMessage 
      ? 'This is the first message - you may greet the user warmly by name if available in profile.'
      : 'This is a follow-up message - DO NOT greet by name again, just respond directly to their concern.';

    const attachmentContext = attachments && attachments.length > 0 
      ? `\n\nATTACHED DOCUMENTS: The user has shared ${attachments.length} medical document(s). Please analyze the images for text content including prescriptions, medical reports, lab results, or any medical information. Extract relevant details and provide insights based on what you can read from the documents.`
      : '';

    const systemContext = `You are a helpful AI Health Assistant providing medical information and guidance. You are NOT a replacement for professional medical care.

CONVERSATION GUIDELINES:
- ${greetingInstruction}
- Keep responses natural and conversational without excessive formatting
- Use simple bullet points (-) instead of asterisks (*) when listing items
- Avoid using asterisks (*) for emphasis - use natural language instead
- Be direct, helpful, and empathetic
- For serious symptoms, recommend seeking medical attention
- When analyzing medical documents, extract key information like medication names, dosages, instructions, and recommendations

RESPONSE FORMAT:
- Write in a natural, conversational tone
- Use simple formatting with dashes (-) for lists
- Avoid repetitive greetings or name mentions
- Focus on addressing the specific health concern
- If documents are attached, analyze them thoroughly and provide insights

User Profile: ${userProfile ? JSON.stringify(userProfile) : 'None provided'}${contextInfo}${attachmentContext}
User Question: ${message || 'Please analyze the attached medical documents.'}

Provide a helpful, direct response about their health concern. Be empathetic but avoid over-formatting with asterisks.`

    console.log('🧠 Making Gemini API call...')
    console.log('📝 System context length:', systemContext.length)

    // Prepare content parts for the API call
    const contentParts: any[] = [
      {
        text: systemContext
      }
    ];

    // Add image attachments if present
    if (attachments && attachments.length > 0) {
      console.log('🖼️ Processing attachments...')
      for (const attachment of attachments) {
        if (attachment.base64Data && attachment.mimeType?.startsWith('image/')) {
          console.log(`📎 Adding image attachment: ${attachment.mimeType}`)
          contentParts.push({
            inline_data: {
              mime_type: attachment.mimeType,
              data: attachment.base64Data
            }
          });
        }
      }
    }

    const requestPayload = {
      contents: [
        {
          parts: contentParts
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
    }

    console.log('📡 Payload prepared, making request to Gemini...')
    
    // Call Gemini API with correct format
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`
    console.log('🌐 Gemini URL (without key):', geminiUrl.replace(/key=.*/, 'key=***'))
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload)
    })

    console.log('📡 Gemini response status:', response.status)
    console.log('📡 Gemini response headers:', Object.fromEntries(response.headers))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Gemini API error response:', errorText)
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('📄 Gemini response structure:', Object.keys(data))
    console.log('📄 Full Gemini response:', JSON.stringify(data, null, 2))

    // Extract response
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
      const aiResponse = data.candidates[0].content.parts[0].text
      console.log('✅ Successfully extracted AI response, length:', aiResponse.length)
      console.log('💬 AI Response preview:', aiResponse.substring(0, 100) + '...')
      
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
      console.error('❌ Invalid response structure from Gemini')
      console.error('📄 Response data:', JSON.stringify(data, null, 2))
      throw new Error('Invalid response from Gemini')
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('💥 Function error:', errorMessage)
    console.error('🔍 Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    // Return error response
    return new Response(
      JSON.stringify({
        error: errorMessage,
        response: "I'm experiencing technical difficulties right now. For immediate medical concerns, please contact your healthcare provider or emergency services."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
