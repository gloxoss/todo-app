const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Helper function to clean and parse JSON
function cleanAndParseJSON(jsonString: string): any {
  // Remove any text before the first '[' and after the last ']'
  const jsonStartIndex = jsonString.indexOf('[');
  const jsonEndIndex = jsonString.lastIndexOf(']') + 1;
  
  if (jsonStartIndex === -1 || jsonEndIndex === 0) {
    console.error('No valid JSON array found');
    return [];
  }

  const cleanedJson = jsonString.slice(jsonStartIndex, jsonEndIndex).trim();

  try {
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error('JSON Parsing Error:', error);
    console.error('Problematic JSON string:', cleanedJson);
    return [];
  }
}

export async function extractTasksFromDocument(document: string) {
  if (!OPENROUTER_API_KEY) {
    console.error('OpenRouter API key is not set');
    return [];
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-distill-llama-70b:free',
        messages: [
          {
            role: 'system',
            content: `Extract tasks from the document. 
            Provide ONLY a JSON array with each task having a "title" and "description". 
            Do NOT include any additional text or explanation.
            Example:
            [
              {
                "title": "Task 1 Title",
                "description": "Task 1 Description"
              },
              {
                "title": "Task 2 Title", 
                "description": "Task 2 Description"
              }
            ]`
          },
          {
            role: 'user',
            content: `Extract tasks from this document: ${document}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('OpenRouter API Error:', response.status, errorBody);
      return [];
    }

    const data = await response.json();
    
    // Validate the response
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid API response structure', data);
      return [];
    }

    // Try to parse the content
    const content = data.choices[0].message.content;
    const tasks = cleanAndParseJSON(content);

    // Validate tasks array
    if (!Array.isArray(tasks)) {
      console.error('Parsed content is not an array', tasks);
      return [];
    }

    // Validate each task
    return tasks.filter(task => 
      task && 
      typeof task.title === 'string' && 
      typeof task.description === 'string'
    );
  } catch (error) {
    console.error('Error extracting tasks:', error);
    return [];
  }
}