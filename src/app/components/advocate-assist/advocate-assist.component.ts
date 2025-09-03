import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { GeminiService } from '../../services/gemini.service';

@Component({
  selector: 'app-advocate-assist',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    NgxSkeletonLoaderModule
  ],
  templateUrl: './advocate-assist.component.html',
  styleUrls: ['./advocate-assist.component.css']
})
export class AdvocateAssistComponent implements OnInit {
  @ViewChild('responseArea') responseArea!: ElementRef;

  userCaseDetails = '';
  isLoading = false;
  botResponse = '';
  errorMessage = '';

  constructor(private geminiService: GeminiService) {}

  async ngOnInit(): Promise<void> {
    await this.geminiService.initChat();
  }

  async askMentor() {
    const caseDetails = this.userCaseDetails.trim();
    if (!caseDetails) {
      this.errorMessage = 'Please enter or upload case details.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    let formattedResponse = '';

    try {
      const rawResponse = await this.geminiService.sendMessage(
        `Act as Senior Mentor.\nCase Details:\n${caseDetails}`
      );

      formattedResponse = rawResponse
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');

      this.botResponse = formattedResponse;
      this.scrollToResponse();
    } catch (error: any) {
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
}
