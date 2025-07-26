import { Injectable } from '@angular/core';
import { GoogleGenerativeAI, Content, ChatSession, GenerationConfig } from '@google/generative-ai';
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

  // Call this once to start a chat session
  async initChat(): Promise<void> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    this.chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.8
      } as GenerationConfig
    });
  }

  // Multi-turn chat
  async sendMessage(message: string): Promise<string> {
    if (!this.chat) {
      await this.initChat();
    }

    try {
      const result = await this.chat.sendMessage(message);
      const response = await result.response;
      const botResponse = await response.text();
      return botResponse;
    } catch (error) {
      console.error('Error in Gemini chat:', error);
      throw new Error('LegalBot is having trouble responding. Please try again.');
    }
  }

  clearChatHistory(): void {
    this.initChat(); // re-initialize new session
  }

  getChatHistory() {
    
    // return this.chat ? this.chat.history : [];
  }

  // Optional: single-turn
  async generateText(prompt: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}
