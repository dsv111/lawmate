import { Injectable } from '@angular/core';
import {
  GoogleGenerativeAI,
  Content,
  ChatSession,
  GenerationConfig
} from '@google/generative-ai';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private chat!: ChatSession;

  constructor() {
    this.genAI = new GoogleGenerativeAI(environment.geminiApiKey);
  }

//   private systemPrompt = `
// You are LegalBot, an AI assistant specialized in **Indian law**.
// You must follow these rules when replying:
// - Be **legally accurate** and explain in **plain, simple language**.
// - Quote relevant **acts, sections, or case laws** when possible.
// - Mention **IPC, CrPC, Civil Procedure, Consumer Protection, Contract Law**, etc., when applicable.
// - Do not guess. If unsure, say "I don't have enough legal clarity to answer."
// - For criminal matters, refer to IPC/CrPC. For property/civil, refer to Civil Law/Acts.
// - Be respectful, helpful, and professional in tone.
// - Do not give medical, financial, or any non-legal advice.
// `;
private systemPrompt = `
You are LegalBot, an AI assistant specialized in **Indian law**. You must base your responses on the **Indian Constitution** and follow these guidelines:
- Be **legally accurate** and explain in **plain, simple language**.
- Always refer to the **Indian Constitution** as the primary source of law, along with other relevant acts such as:
  - **Indian Penal Code (IPC)** for criminal matters
  - **Criminal Procedure Code (CrPC)** for criminal procedures
  - **Civil Procedure Code** for civil matters
  - **Consumer Protection Act**, **Contract Law**, and other applicable legal frameworks
- Quote the relevant **articles**, **sections**, or **case laws** when possible.
- If unsure about a legal concept, say "I don't have enough legal clarity to answer."
- For criminal matters, refer to **IPC/CrPC**. For property/civil matters, refer to **Civil Law** and **Acts**.
- Be respectful, helpful, and professional in tone.
- Do not give medical, financial, or any non-legal advice.
- Ensure that all responses are consistent with the **Indian Constitution** and Indian law.
`;


  async initChat(): Promise<void> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    this.chat = model.startChat({
      history: [], // You can add custom initial context if needed
      generationConfig: {
        maxOutputTokens: 1200,
        temperature: 0.6, // Lower temp = more consistent answers
        topK: 40,
        topP: 0.9
      } as GenerationConfig
    });
  }

  async sendMessage(userQuestion: string): Promise<string> {
    const fullPrompt = `${this.systemPrompt.trim()}\n\nUser: ${userQuestion}`;

    if (!this.chat) {
      await this.initChat();
    }

    try {
      const result = await this.chat.sendMessage(fullPrompt);
      const response = await result.response;
      const botResponse = await response.text();
      return botResponse;
    } catch (error) {
      console.error('Error in Gemini chat:', error);
      throw new Error('LegalBot is having trouble responding. Please try again.');
    }
  }

  clearChatHistory(): void {
    this.initChat(); // Recreate chat session from scratch
  }

  //generate document
  async generateText(prompt: string): Promise<string> {
  const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

}
