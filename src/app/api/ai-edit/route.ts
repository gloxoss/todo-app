import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { currentTodo, prompt } = await request.json();

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.SITE_URL || 'https://localhost:3000',
        'X-Title': 'Todo AI Assistant',
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-distill-llama-70b:free",
        messages: [
          {
            role: "system", 
            content: `You are an AI assistant helping to modify a todo task. 
            Provide a JSON response with updated task details based on the user's prompt.
            Always include a title. Description and due date are optional.
            
            JSON Format:
            {
              "title": "Updated task title",
              "description": "Optional updated description",
              "due_date": "Optional YYYY-MM-DD date or null"
            }`
          },
          {
            role: "user",
            content: `Current Todo Task:
Title: ${currentTodo.title}
Description: ${currentTodo.description || 'No description'}
Due Date: ${currentTodo.due_date || 'No due date'}

User Prompt: ${prompt}

Please provide an updated task based on the prompt. Respond ONLY with a valid JSON object.`
          }
        ],
        max_tokens: 300,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API Error:', errorText);
      return NextResponse.json(
        { error: 'Failed to process AI edit' }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    const responseContent = data.choices[0].message.content;
    
    if (!responseContent) {
      return NextResponse.json(
        { error: 'No response from AI' }, 
        { status: 500 }
      );
    }

    // Extract JSON from the response (in case it's wrapped in markdown or text)
    const jsonMatch = responseContent.match(/```json\n(.*)\n```/s) || 
                      responseContent.match(/({[^}]+})/s);
    
    const jsonString = jsonMatch ? jsonMatch[1] : responseContent;
    
    const updatedTodo = JSON.parse(jsonString);

    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error('AI Edit Error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI edit' }, 
      { status: 500 }
    );
  }
}

// Explicitly define GET method to resolve 405 error
export async function GET() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}