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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    MatSnackBarModule,
    MatSelectModule,
    MatTooltipModule
  ],
  templateUrl: './advocate-assist.component.html',
  styleUrls: ['./advocate-assist.component.css'],
})
export class AdvocateAssistComponent implements OnInit {
  @ViewChild('loadingArea') loadingArea!: ElementRef;
  @ViewChild('responseArea') responseArea!: ElementRef;
  @ViewChild('extroInfoArea') extroInfoArea!: ElementRef;

  userCaseDetails = '';
  selectedFile: File | null = null;
  isLoading = false;
  isExtraInfoLoading = false;

  // Originals (English)
  originalResponse = '';
  originalExtraInfo = '';

  // Displayed (could be translated)
  botResponse = '';
  extraInfo = '';

  errorMessage = '';
  selectedLanguage: string = 'en'; // Default to English
  showExtraInfo = false;

  // UI loading message
  loadingMessage = '';
followUpQuery = '';

  constructor(
    private geminiService: GeminiService,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit(): Promise<void> {
    await this.geminiService.initChat();
  }

  // Handle file selection
  async onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (!['docx', 'txt'].includes(fileExtension || '')) {
        this.snackBar.open(
          '❌ Invalid file type. Please upload a .docx or .txt file.',
          'Close',
          {
            duration: 5000,
          }
        );
        input.value = '';
        this.selectedFile = null;
        return;
      }

      this.selectedFile = file;
      try {
        this.userCaseDetails = await this.geminiService.extractTextFromFile(
          this.selectedFile
        );
      } catch (err) {
        this.snackBar.open(
          '❌ Failed to read the uploaded file. Please try again.',
          'Close',
          { duration: 5000 }
        );
        input.value = '';
        this.selectedFile = null;
      }
    }
  }

  // Ask mentor and set originals + display (translate if needed)
  async askMentor() {
    const caseDetails = this.userCaseDetails.trim();
    if (!caseDetails) {
      this.errorMessage = 'Please enter or upload case details.';
      return;
    }

    this.isLoading = true;
    this.loadingMessage = 'Analyzing case with senior advocate perspective...';
    this.errorMessage = '';

    setTimeout(() => {
      if (this.loadingArea)
        this.loadingArea.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    try {
      const rawResponse = await this.geminiService.sendMentorMessage(
        caseDetails
      );

      // Format the response into English HTML (original)
      let formattedResponse = rawResponse;
      formattedResponse = formattedResponse.replace(
        /(Senior Mentor Analysis):?/gi,
        `<h3 class="text-center text-2xl font-bold text-gray-800 border-b pb-2 mb-3">📋 $1</h3>`
      );
      formattedResponse = formattedResponse.replace(
        /(Relevant Laws\/?Sections?):?/gi,
        `<h4 class="text-xl font-semibold text-gray-800 border-b pb-2 mt-6 mb-3">⚖️ $1</h4>`
      );
      formattedResponse = formattedResponse.replace(
        /(Suggested Strategy):?/gi,
        `<h4 class="text-xl font-semibold text-gray-800 border-b pb-2 mt-6 mb-3">💡 $1</h4>`
      );
      formattedResponse = formattedResponse.replace(
        /(Court Preparation Checklist):?/gi,
        `<h4 class="text-xl font-semibold text-gray-800 border-b pb-2 mt-6 mb-3">📝 $1</h4>`
      );
      formattedResponse = formattedResponse.replace(
        /(Mentor Tip):?/gi,
        `<h4 class="mt-6 text-lg font-semibold text-blue-700">💡 $1</h4>`
      );
      formattedResponse = formattedResponse.replace(
        /(Option\s*\d+:)/gi,
        `<strong class="text-gray-900">$1</strong>`
      );
      formattedResponse = formattedResponse.replace(
        /\*\*(.*?)\*\*/g,
        `<strong>$1</strong>`
      );
      formattedResponse = formattedResponse.replace(
        /\*(.*?)\*/g,
        `<em>$1</em>`
      );
      formattedResponse = formattedResponse.replace(
        /^(\d+)\.\s+(.*)$/gm,
        `<li class="font-semibold text-gray-900">$2</li>`
      );
      formattedResponse = formattedResponse.replace(
        /^[\-\*•]\s+(.*)$/gm,
        `<ul class="list-disc list-inside space-y-1 ml-6"><li class="text-gray-700">$1</li></ul>`
      );
      formattedResponse = formattedResponse.replace(
        /\bPros?:/gi,
        `<strong class="text-green-700">✅ Pros:</strong>`
      );
      formattedResponse = formattedResponse.replace(
        /\bCons?:/gi,
        `<strong class="text-red-700">❌ Cons:</strong>`
      );
      formattedResponse = formattedResponse.replace(/\n\s*\n/g, '</p><p>');
      formattedResponse = `<div class="text-gray-700 leading-relaxed space-y-3">${formattedResponse}</div>`;

      // Store the English original
      this.originalResponse = formattedResponse;

      // Display: if user wants non-English, translate; else show original
      if (this.selectedLanguage === 'en') {
        this.botResponse = this.originalResponse;
      } else {
        this.loadingMessage = `🌐 Translating mentor advice into ${this.getLanguageName(
          this.selectedLanguage
        )}...`;
        // translate from English original
        this.botResponse = await this.geminiService.translateText(
          this.originalResponse,
          this.selectedLanguage
        );
      }

      this.scrollToResponse();
    } catch (error: any) {
      this.errorMessage =
        error.message || 'Failed to get a response. Please try again.';
      this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
    } finally {
      this.isLoading = false;
      this.loadingMessage = '';
    }
  }

  // Handle language change — translate both main response and extra info (from originals)
  async onLanguageChange() {
    if (!this.originalResponse && !this.originalExtraInfo) {
      console.log('No response/extra info to translate');
      return;
    }

    this.isLoading = true;
    this.loadingMessage = `🌐 Translating mentor advice into ${this.getLanguageName(
      this.selectedLanguage
    )}...`;

    // Temporarily hide Additional Info while translating
    const wasExtraInfoVisible = this.showExtraInfo;
    this.showExtraInfo = false;

    const maybeTranslate = async (original: string) => {
      if (!original) return '';
      return this.selectedLanguage === 'en'
        ? original
        : await this.geminiService.translateText(
            original,
            this.selectedLanguage
          );
    };

    try {
      const [translatedResponse, translatedExtra] = await Promise.all([
        maybeTranslate(this.originalResponse),
        maybeTranslate(this.originalExtraInfo),
      ]);

      this.botResponse = translatedResponse || '';
      this.extraInfo = translatedExtra || '';
      // Restore extra info only after translation
      if (wasExtraInfoVisible && this.extraInfo) {
        this.showExtraInfo = true;
      }
    } catch (error: any) {
      this.errorMessage =
        error.message || 'Failed to translate content. Please try again.';
      this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
    } finally {
      this.isLoading = false;
      this.loadingMessage = '';
      this.scrollToResponse();
      if (this.showExtraInfo) this.scrollToExtrInfoResponse();
    }
  }

  // Toggle extra information as a new, unstructured extension
  async toggleExtraInfo() {
    if (this.showExtraInfo) {
      this.showExtraInfo = false;
      return;
    }

    this.isExtraInfoLoading = true;
    this.errorMessage = '';

    try {
      const additionalPrompt = `
Based on the following case details: ${this.userCaseDetails}, provide additional information that was not mentioned in the previous mentor advice. Include new insights, such as lesser-known legal considerations, potential risks, or practical tips, without repeating the original content or using the same structure. Present the information in plain paragraphs.
`;
      let extraDetails = await this.geminiService.sendMentorMessage(
        additionalPrompt
      );

      // Keep the English original
      extraDetails = extraDetails.replace(/\n\s*\n/g, '<p></p>');
      this.originalExtraInfo = extraDetails;

      // Display translated (or English) based on selection
      if (this.selectedLanguage === 'en') {
        this.extraInfo = this.originalExtraInfo;
      } else {
        this.extraInfo = await this.geminiService.translateText(
          this.originalExtraInfo,
          this.selectedLanguage
        );
      }

      this.showExtraInfo = true;
    } catch (error: any) {
      this.errorMessage =
        error.message ||
        'Failed to load additional information. Please try again.';
      this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
    } finally {
      this.isExtraInfoLoading = false;
      this.scrollToExtrInfoResponse();
    }
  }

  scrollToResponse(): void {
    setTimeout(() => {
      if (this.responseArea)
        this.responseArea.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  scrollToExtrInfoResponse(): void {
    setTimeout(() => {
      if (this.extroInfoArea)
        this.extroInfoArea.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  private getLanguageName(code: string): string {
    const map: Record<string, string> = {
      en: 'English',
      hi: 'Hindi',
      te: 'Telugu',
      ta: 'Tamil',
      kn: 'Kannada',
      ml: 'Malayalam',
    };
    return map[code] || 'English';
  }

  followUpChats: { user: string; mentor: string }[] = [];
isFollowUpLoading = false;

async askFollowUp() {
  const query = this.followUpQuery.trim();
  if (!query) return;

  this.isFollowUpLoading = true;
  try {
    // Build prompt with context of previous mentor response
    const prompt = `
      The junior lawyer already received the following mentor advice:
      ${this.originalResponse}

      Now the junior has this follow-up query:
      ${query}

      Please respond briefly and contextually, without repeating the entire advice.
    `;

    const reply = await this.geminiService.sendMentorMessage(prompt);

    this.followUpChats.push({
      user: query,
      mentor: reply
    });

    this.followUpQuery = '';
  } catch (err) {
    this.snackBar.open('❌ Failed to get mentor reply. Please try again.', 'Close', { duration: 5000 });
  } finally {
    this.isFollowUpLoading = false;
  }
}

startNewChat(): void {
  // Reset all user inputs
  this.userCaseDetails = '';
  this.selectedFile = null;
  this.followUpQuery = '';

  // Reset response data
  this.originalResponse = '';
  this.originalExtraInfo = '';
  this.botResponse = '';
  this.extraInfo = '';
  this.errorMessage = '';
  this.loadingMessage = '';

  // Reset UI flags
  this.isLoading = false;
  this.isExtraInfoLoading = false;
  this.showExtraInfo = false;
  this.followUpChats = [];
  this.selectedLanguage = 'en'; // back to default

  // Clear file input if any
  const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }

  // Optional: reset AI chat context
  this.geminiService.clearChatHistory?.();

  this.snackBar.open('Started a new chat.', 'Close', { duration: 3000 });
}


}
