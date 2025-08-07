import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { GeminiService } from '../../services/gemini.service';

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
  @ViewChild('responseArea') responseArea!: ElementRef;

  userQuestion = '';
  isLoading = false;
  errorMessage = '';
  botResponse = '';
loggedUserDetails:any;
  chatHistory: { question: string; response: string; timestamp: string; showMenu: boolean,userId: string }[] = [];
  chatMessages: { role: string; text: string }[] = [];

  constructor(private geminiService: GeminiService) {}

  async ngOnInit(): Promise<void> {
    const savedHistory = localStorage.getItem('chatHistory');
    this.chatHistory = savedHistory ? JSON.parse(savedHistory) : [];
        
    // Added: Load user details from sessionStorage
    const userDetails = localStorage.getItem('loggedUserObject');
    this.loggedUserDetails = userDetails ? JSON.parse(userDetails) :[]

    this.chatHistory = this.chatHistory.filter(item => item.userId === this.loggedUserDetails?.email);

    this.chatMessages.push({ role: 'model', text: 'Hello! How can I assist you with legal questions today?' });
    await this.geminiService.initChat();
  }

  async askLegalBot() {
    const question = this.userQuestion.trim();

        // Added: Check if user is logged in
    if (!question) {
      this.errorMessage = 'Please enter a legal question.';
      return;
    }

    const lastHistory = this.chatHistory[this.chatHistory.length - 1];
    if (lastHistory?.question === question) {
      this.errorMessage = 'You already asked this question.';
      return;
    }

    this.chatMessages.push({ role: 'user', text: question });
    this.isLoading = true;
    this.errorMessage = '';
    let formattedResponse = '';

    try {
      const rawResponse = await this.geminiService.sendMessage(question);
      formattedResponse = rawResponse
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');

      this.botResponse = formattedResponse;
      this.scrollToResponse();

      this.chatMessages = this.chatMessages.filter(m => m.role !== 'loading');
      this.chatMessages.push({ role: 'model', text: formattedResponse });

      this.chatHistory.push({
        question,
        response: formattedResponse,
        timestamp: new Date().toISOString(),
        showMenu: false,
        userId: this.loggedUserDetails.email
      });
      localStorage.setItem('chatHistory', JSON.stringify(this.chatHistory));

    } catch (error: any) {
      console.error('Error asking LegalBot:', error);
      this.errorMessage = error.message || 'Failed to get a response. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  scrollToResponse(): void {
    setTimeout(() => {
      this.responseArea.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  historyPushToChat(item: { question: string; response: string; timestamp: string; showMenu: boolean }): void {
    this.userQuestion = item.question;
    this.botResponse = item.response;
    this.chatMessages = [
      { role: 'user', text: item.question },
      { role: 'bot', text: item.response }
    ];
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.askLegalBot();
    }
  }

  autoResize(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  toggleMenu(item: any): void {
    this.chatHistory.forEach(i => i.showMenu = i === item ? !i.showMenu : false);
  }

  removeHistory(item: any): void {
    this.chatHistory = this.chatHistory.filter(i => i !== item);
    localStorage.setItem('chatHistory', JSON.stringify(this.chatHistory));
  }

  editHistory(item: any): void {
    console.log('Edit', item);
    item.showMenu = false;
  }

  shareHistory(item: any): void {
    console.log('Share', item);
    item.showMenu = false;
  }

  clearChat(): void {
    this.geminiService.clearChatHistory();
    this.chatMessages = [
      { role: 'model', text: 'Hello! How can I assist you with legal questions today?' }
    ];
    this.botResponse = '';
    this.userQuestion = '';
  }
}
