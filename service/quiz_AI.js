import dotenv from "dotenv";
import { OpenAI } from 'openai';
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'yourdomain.com',
      'X-Title': 'QuizBot',
    },
  });


  export const quiz_function = async ( topic, number_questions)=>{
    console.log(number_questions, topic)
    const prompt = `Generate ${number_questions} multiple-choice quiz questions about "${topic}". 
    Respond with only valid JSON in this format:
    [
      {
        "question": "Your question?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswerOption": 2
      }
    ]
    Only return the JSON array. Do not include any explanation, title, or intro.`;
    
        const response = await openai.chat.completions.create({
          model: "mistralai/mistral-7b-instruct",
          messages: [{ role: 'user', content: prompt }],
          temperature: 0,
        });
    
        const content = response.choices[0].message.content;
    
        // Extract only the JSON array using RegExp
        const match = content.match(/\[\s*{[\s\S]*}\s*\]/);
        if (!match) {
          throw new Error("No valid JSON array found in AI response.");
        }
    
        const parsedQuestions = JSON.parse(match[0]);

        return parsedQuestions;
  }