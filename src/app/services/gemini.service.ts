import { Injectable } from '@angular/core';
import {
  GoogleGenerativeAI,
  Content,
  ChatSession,
  GenerationConfig
} from '@google/generative-ai';
import { environment } from '../../environments/environment';

// Import external parsers
import * as mammoth from 'mammoth';        // For DOCX
import * as pdfjsLib from 'pdfjs-dist';    // For PDF

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private chat!: ChatSession;

  constructor() {
    this.genAI = new GoogleGenerativeAI(environment.geminiApiKey);
  }

  // 🔹 LegalBot System Prompt (for general user queries)
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
- Be respectful, helpful, and professional in tone.
- Do not give medical, financial, or any non-legal advice.
- Ensure that all responses are consistent with the **Indian Constitution** and Indian law.
`;

  // 🔹 Mentor System Prompt (for junior lawyer guidance)
  private mentorPrompt = `
You are LegalBot, acting as a **Senior Advocate of the Supreme Court of India with 25+ years of experience**.  
Your role is to **mentor junior lawyers** by reviewing their cases and guiding them like a senior lawyer would.  

Follow these rules:

1. **Tone & Style**  
- Always respond in a respectful, mentoring tone.  
- Explain step-by-step, not just the final advice.  
- Highlight reasoning so the junior learns how to think like a senior.  

2. **Case Review Approach**  
When a junior shares a case (typed or uploaded document):  
- Identify **missing details, documents, or facts**.  
- Suggest what **evidence, witnesses, or filings** are required.  
- Recommend relevant **Indian Acts, Sections, or Case Laws**.  
- Give at least **two possible strategies** (e.g., mediation vs litigation, civil vs criminal remedies).  
- Point out possible **counter-arguments** the opposite counsel may raise.  
- Provide a **courtroom preparation checklist**.  

3. **Knowledge Boundaries**  
- Stick strictly to **Indian legal frameworks** (IPC, CrPC, CPC, Consumer Protection, Contract Law, Family Law, Property Law, etc.).  
- Do not give financial, medical, or non-legal advice.  
- If the case lacks enough details, ask clarifying questions instead of guessing.  

4. **Response Format**  
Always structure your answer like this:  

**Senior Mentor Analysis:**  
- [Step-by-step reasoning]  

**Relevant Laws/Sections:**  
- [List with Acts & Sections]  

**Suggested Strategy:**  
- [Options with pros/cons]  

**Court Preparation Checklist:**  
- [Practical steps junior should do before court]  

**Mentor Tip:**  
- [1–2 senior-level insights, practical wisdom, or caution]  
`;

  async initChat(): Promise<void> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    this.chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 1200,
        temperature: 0.6,
        topK: 40,
        topP: 0.9
      } as GenerationConfig
    });
  }

  // 🔹 General LegalBot chat
  async sendMessage(userQuestion: string): Promise<string> {
    const fullPrompt = `${this.systemPrompt.trim()}\n\nUser: ${userQuestion}`;

    if (!this.chat) {
      await this.initChat();
    }

    try {
      const result = await this.chat.sendMessage(fullPrompt);
      const response = await result.response;
      return await response.text();
    } catch (error) {
      console.error('Error in Gemini chat:', error);
      throw new Error('LegalBot is having trouble responding. Please try again.');
    }
  }

  // 🔹 Mentor mode chat
  async sendMentorMessage(caseDetails: string): Promise<string> {
    const fullPrompt = `${this.mentorPrompt.trim()}\n\nJunior Lawyer Case:\n${caseDetails}`;

    if (!this.chat) {
      await this.initChat();
    }

    try {
      const result = await this.chat.sendMessage(fullPrompt);
      const response = await result.response;
      return await response.text();
    } catch (error) {
      console.error('Error in Mentor mode:', error);
      throw new Error('MentorBot is having trouble responding. Please try again.');
    }
  }

  clearChatHistory(): void {
    this.initChat();
  }

  // 🔹 Generate document (if needed)
  async generateText(prompt: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  // 🔹 Extract text from uploaded files
  async extractTextFromFile(file: File): Promise<string> {
    const fileType = file.type;

    if (fileType === 'text/plain') {
      return await file.text();
    }

    if (fileType === 'application/pdf') {
      return this.readPdf(file);
    }

    if (
      fileType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return this.readDocx(file);
    }

    return await file.text();
  }

  private async readPdf(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => item.str);
      text += strings.join(' ') + '\n';
    }
    return text;
  }

  private async readDocx(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }
}
