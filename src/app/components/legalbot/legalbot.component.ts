import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { GeminiService } from '../../services/gemini.service';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
@Component({
  selector: 'app-legalbot',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    NgxSkeletonLoaderModule
  ],
  templateUrl: './legalbot.component.html',
  styleUrls: ['./legalbot.component.css']
})
export class LegalBotComponent implements OnInit {
  userQuestion: string = '';
  chatMessages: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  botResponse: any;
  chatHistory: { question: string; response: string; timestamp: any }[] = [];

  constructor(private geminiService: GeminiService) { }

  async ngOnInit(): Promise<void> {
    this.chatMessages.push({ role: 'model', text: 'Hello! How can I assist you with legal questions today?' });
    await this.geminiService.initChat(); // 🧠 Init Gemini chat session once
  }
  async askLegalBot() {
    if (!this.userQuestion.trim()) {
      this.errorMessage = 'Please enter a legal question.';
      return;
    }

    const question = this.userQuestion.trim();
    this.chatMessages.push({ role: 'user', text: question });
    this.isLoading = true;
    this.errorMessage = '';
    // this.userQuestion = '';

    let formattedResponse = ''; // ✅ Declare outside try block

    try {
      const rawResponse = await this.geminiService.sendMessage(question);
      formattedResponse = rawResponse
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');

      this.botResponse = formattedResponse;

      this.chatMessages = this.chatMessages.filter(m => m.role !== 'loading');
      this.chatMessages.push({ role: 'model', text: this.botResponse });

    } catch (error: any) {
      console.error('Error asking LegalBot:', error);
      this.errorMessage = error.message || 'Failed to get a response. Please try again.';
      return;
    } finally {
      this.isLoading = false;

      // ✅ Only push to chat history if we have both question and response
      if (formattedResponse) {
        this.chatHistory.push({
          question,
          response: formattedResponse,
          timestamp: new Date().toISOString()
        });
        console.log("chat history::::", this.chatHistory);

      }
    }
  }

  historyPushToChat(item: { question: string; response: string; timestamp: any }) {
    this.userQuestion = item.question;
    this.botResponse = item.response;
    this.chatMessages = [
      { role: 'user', text: item.question },
      { role: 'bot', text: item.response }
    ];
  }


  // async askLegalBot() {
  //   if (!this.userQuestion.trim()) {
  //     this.errorMessage = 'Please enter a legal question.';
  //     return;
  //   }
  //   this.chatHistory.push(this.userQuestion.trim());
  //   const question = this.userQuestion.trim();
  //   this.errorMessage = '';
  //   this.chatMessages.push({ role: 'user', text: question });
  //   this.isLoading = true;

  //   try {

  //     const rawResponse = await this.geminiService.sendMessage(question);
  //     // Convert markdown-like syntax to HTML
  //     const formattedResponse = rawResponse
  //       .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // **bold**
  //       .replace(/\*(.*?)\*/g, '<em>$1</em>');              // *italic*

  //     this.botResponse = formattedResponse;


  //     // Remove typing placeholder
  //     this.chatMessages = this.chatMessages.filter(m => m.role !== 'loading');

  //     // Show actual response
  //     this.chatMessages.push({ role: 'model', text: this.botResponse });
  //   } catch (error: any) {
  //     console.error('Error asking LegalBot:', error);
  //     this.errorMessage = error.message || 'Failed to get a response. Please try again.';
  //   } finally {
  //     this.isLoading = false;
  //   }
  // }

  clearChat(): void {
    this.geminiService.clearChatHistory();
    this.chatMessages = [
      { role: 'model', text: 'Hello! How can I assist you with legal questions today?' }
    ];
  }
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.askLegalBot();
    }
  }

  autoResize(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }


}
