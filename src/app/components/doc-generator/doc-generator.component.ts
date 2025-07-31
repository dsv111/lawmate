// doc-generator.component.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GeminiService } from '../../services/gemini.service'; // ✅ your existing Gemini API service

@Component({
  selector: 'app-doc-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doc-generator.component.html',
  styleUrls: ['./doc-generator.component.css']
})
export class DocGeneratorComponent {
  documentTitle = '';
  documentPrompt = '';
  generatedContent = '';
  generated = false;
  isLoading = false;
  errorMessage = '';

  constructor(private geminiService: GeminiService) {}

  async generateDocument() {
    this.errorMessage = '';
    if (!this.documentTitle.trim() || !this.documentPrompt.trim()) {
      this.errorMessage = 'Both title and prompt are required.';
      return;
    }

    this.isLoading = true;

    try {
      const fullPrompt = `
        You are a legal document generator AI.
        Create a well-formatted legal document titled: "${this.documentTitle}".
        Based on the user's input, generate a rental/legal agreement.

        User Input:
        ${this.documentPrompt}`;
      const result = await this.geminiService.generateText(fullPrompt);
this.generatedContent = this.formatMarkdown(result);
      this.generated = true;
    } catch (error: any) {
      this.errorMessage = 'Failed to generate document. Please try again.';
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  formatMarkdown(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Convert **text** to bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>')             // Convert *text* to italic
    .replace(/\n{2,}/g, '</p><p>')                    // Double newlines = paragraph
    .replace(/\n/g, '<br />')                         // Single newline = line break
    .replace(/\[(.*?)\]/g, '<span class="placeholder">[$1]</span>') // Highlight placeholders
    .replace(/^/, '<p>')                              // Start first paragraph
    .concat('</p>');                                  // Close last paragraph
}

convertToAgreementStyle(text: string): string {
  // Wrap each section as a paragraph or line, preserving the list structure
  const lines = text
    .replace(/\n{2,}/g, '\n\n') // Normalize paragraph breaks
    .split('\n')
    .map((line) => {
      if (line.trim().match(/^\d+\./)) {
        return `<div class="doc-line doc-bullet">${line.trim()}</div>`;
      } else if (line.trim() === '') {
        return `<div class="doc-space"></div>`;
      } else {
        return `<div class="doc-line">${line.trim()}</div>`;
      }
    });

  return lines.join('');
}

  resetForm() {
    this.documentTitle = '';
    this.documentPrompt = '';
    this.generatedContent = '';
    this.generated = false;
    this.errorMessage = '';
  }
}
