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
    NgxSkeletonLoaderModule,
  ],
  templateUrl: './advocate-assist.component.html',
  styleUrls: ['./advocate-assist.component.css'],
})
export class AdvocateAssistComponent implements OnInit {
  @ViewChild('responseArea') responseArea!: ElementRef;

  userCaseDetails = '';
  selectedFile: File | null = null;
  isLoading = false;
  botResponse = '';
  errorMessage = '';

  constructor(private geminiService: GeminiService) {}

  async ngOnInit(): Promise<void> {
    await this.geminiService.initChat();
  }

  // Handle file selection
  async onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      try {
        this.userCaseDetails = await this.geminiService.extractTextFromFile(
          this.selectedFile
        );
      } catch (err) {
        this.errorMessage =
          'Failed to read the uploaded file. Please try again.';
      }
    }
  }

  // Send case details (typed or extracted from file)
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
      // ✅ Use mentor-specific service method
      const rawResponse = await this.geminiService.sendMentorMessage(
        caseDetails
      );

// === Format Response ===
let formattedResponse = rawResponse;

// ------------------ Headings ------------------
formattedResponse = formattedResponse.replace(
  /(Senior Mentor Analysis):?/gi,
  `<h2 class="text-2xl font-bold text-gray-800 flex items-center border-b pb-2 mb-3">📋 $1</h2>`
);

formattedResponse = formattedResponse.replace(
  /(Relevant Laws\/?Sections?):?/gi,
  `<h3 class="text-xl font-semibold text-gray-800 flex items-center border-b pb-2 mt-6 mb-3">⚖️ $1</h3>`
);

formattedResponse = formattedResponse.replace(
  /(Suggested Strategy):?/gi,
  `<h3 class="text-xl font-semibold text-gray-800 flex items-center border-b pb-2 mt-6 mb-3">💡 $1</h3>`
);

formattedResponse = formattedResponse.replace(
  /(Court Preparation Checklist):?/gi,
  `<h3 class="text-xl font-semibold text-gray-800 flex items-center border-b pb-2 mt-6 mb-3">📝 $1</h3>`
);

// ------------------ Special Formatting ------------------

// Bold "Option 1 / Option 2"
formattedResponse = formattedResponse.replace(
  /(Option\s*\d+:)/gi,
  `<strong class="text-gray-900">$1</strong>`
);

// Bold + italic formatting
formattedResponse = formattedResponse.replace(/\*\*(.*?)\*\*/g, `<strong>$1</strong>`);
formattedResponse = formattedResponse.replace(/\*(.*?)\*/g, `<em>$1</em>`);

// ------------------ List Handling ------------------

// Main numbered list items (1., 2., 3.)
formattedResponse = formattedResponse.replace(
  /^(\d+)\.\s*(.*)$/gm,
  `<li class="font-semibold text-gray-900">$1. $2</li>`
);

// Sub-points (-, *, •) → bullets
formattedResponse = formattedResponse.replace(
  /^[\-\*•]\s*(.*)$/gm,
  `<li class="ml-6 text-gray-700">• $1</li>`
);

// Wrap main numbers in <ol>
formattedResponse = formattedResponse.replace(
  /(<li class="font-semibold.*<\/li>)/gs,
  `<ol class="list-decimal list-inside space-y-2">$1</ol>`
);

// Wrap subpoints in <ul>
formattedResponse = formattedResponse.replace(
  /(<li class="ml-6.*<\/li>)/gs,
  `<ul class="list-disc list-inside space-y-1">$1</ul>`
);

// ------------------ Mentor Tip ------------------
formattedResponse = formattedResponse.replace(
  /^Mentor Tip:/gi,
  `<h3 class="mt-6 text-lg font-semibold text-blue-700">💡 Mentor Tip</h3>`
);

// ------------------ Paragraph Handling ------------------
formattedResponse = formattedResponse.replace(/\n\s*\n/g, '</p><p>');
formattedResponse = `<div class="text-gray-700 leading-relaxed space-y-3">${formattedResponse}</div>`;

// ------------------ Final Assignment ------------------
this.botResponse = formattedResponse;



      this.scrollToResponse();
    } catch (error: any) {
      this.errorMessage =
        error.message || 'Failed to get a response. Please try again.';
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
