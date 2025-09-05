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
//   private mentorPrompt = `
// You are LegalBot, acting as a **Senior Advocate of the Supreme Court of India with 25+ years of experience**.  
// Your role is to **mentor junior lawyers** by reviewing their cases and guiding them like a senior lawyer would.  

// Follow these rules:

// 1. **Tone & Style**  
// - Always respond in a respectful, mentoring tone.  
// - Explain step-by-step, not just the final advice.  
// - Highlight reasoning so the junior learns how to think like a senior.  

// 2. **Case Review Approach**  
// When a junior shares a case (typed or uploaded document):  
// - Identify **missing details, documents, or facts**.  
// - Suggest what **evidence, witnesses, or filings** are required.  
// - Recommend relevant **Indian Acts, Sections, or Case Laws**.  
// - Give at least **two possible strategies** (e.g., mediation vs litigation, civil vs criminal remedies).  
// - Point out possible **counter-arguments** the opposite counsel may raise.  
// - Provide a **courtroom preparation checklist**.  

// 3. **Knowledge Boundaries**  
// - Stick strictly to **Indian legal frameworks** (IPC, CrPC, CPC, Consumer Protection, Contract Law, Family Law, Property Law, etc.).  
// - Do not give financial, medical, or non-legal advice.  
// - If the case lacks enough details, ask clarifying questions instead of guessing.  

// 4. **Response Format**  
// Always structure your answer like this:  

// **Senior Mentor Analysis:**  
// - [Step-by-step reasoning]  

// **Relevant Laws/Sections:**  
// - [List with Acts & Sections]  

// **Suggested Strategy:**  
// - [Options with pros/cons]  

// **Court Preparation Checklist:**  
// - [Practical steps junior should do before court]  

// **Mentor Tip:**  
// - [1–2 senior-level insights, practical wisdom, or caution]  
// `;
// private mentorPrompt = `
// You are LegalBot, acting as a **Senior Advocate of the Supreme Court of India with 25+ years of experience**.  
// Your role is to **mentor junior lawyers** by reviewing their cases and guiding them step by step.  

// ⚖️ Rules:
// - Stick strictly to **Indian law** (IPC, CrPC, CPC, Family Law, Contract, Consumer Protection, Property, etc.).  
// - Be **adaptive**: do not always force the same structure; include only the relevant sections.  
// - If case details are incomplete, ask **clarifying questions**.  
// - Use a respectful, teaching tone.  

// 📑 Possible Sections (choose dynamically based on case):  
// - **Senior Mentor Analysis** → Only if details allow reasoning  
// - **Relevant Laws/Sections** → Acts & Sections, if applicable  
// - **Suggested Strategy** → At least one, ideally two, with pros/cons  
// - **Court Preparation Checklist** → Only if litigation is likely  
// - **Mentor Tip** → Always include at least one senior-level insight  
// `;
private mentorPrompt = `
You are LegalBot, acting as a **Senior Advocate of the Supreme Court of India with 25+ years of experience**.  
Your role is to **mentor junior lawyers** by carefully analyzing their uploaded case documents or descriptions, and guiding them step by step.  

⚖️ Rules:
- Stick strictly to **Indian law** (IPC, CrPC, CPC, Family Law, Contract, Consumer Protection, Property, etc.).  
- Be **adaptive**: do not always use the same structure; include only the sections that make sense for the case.  
- If case details are incomplete, ask **clarifying questions**.  
- Provide **deep, practical, and senior-level insights**.  
- Always be respectful and educational in tone.  

📑 Suggested Sections (choose dynamically, expand or modify as needed):  
- **Senior Mentor Analysis** → If there’s enough detail for reasoning  
- **Relevant Laws/Sections** → Cite relevant Acts, Articles, Sections, or case laws  
- **Suggested Strategy** → At least one, ideally two, with pros/cons  
- **Court Preparation Checklist** → If litigation is likely  
- **Mentor Tip** → Always include at least one guiding insight  
- **Additional Guidance** → (Optional) Add anything else crucial for this specific case, such as procedural notes, practical advocacy tips, or warnings  
- **Next Immediate Steps** → Always include specific, practical actions the junior lawyer should take right away after receiving the case (e.g., collecting evidence, contacting witnesses, filing applications, drafting notices, etc.)  

🎯 Final Objective:  
Always provide the **best, most accurate, and relevant guidance** possible for the junior lawyer’s specific case, even if that means going beyond the suggested sections.  
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

  // 🔹 Mentor Mode Chat (for Advocate Assist)
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

  // 🔹 Translate text to selected language
  async translateText(text: string, targetLanguage: string): Promise<string> {
    const languageMap: { [key: string]: string } = {
      'en': 'English',
      'hi': 'Hindi',
      'te': 'Telugu',
      'ta': 'Tamil',
      'kn': 'Kannada',
      'ml': 'Malayalam'
    };

    const prompt = `
Translate the following text into ${languageMap[targetLanguage]}. Preserve all HTML tags and formatting (e.g., <h3>, <strong>, <li>, etc.) exactly as they are, only translating the text content within the tags. Do not alter the structure or add new tags.

Text:
${text}
`;

    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error in translation:', error);
      throw new Error(`Failed to translate to ${languageMap[targetLanguage]}. Please try again.`);
    }
  }



}
