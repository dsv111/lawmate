import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GeminiService } from '../../services/gemini.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-doc-generator',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './doc-generator.component.html',
  styleUrls: ['./doc-generator.component.css'],
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
      const prompt = `
                You are a legal document generator AI.Generate a professional, structured document titled: "${this.documentTitle}". Use the following details as context:
${this.documentPrompt}`.trim();

      const result = await this.geminiService.generateText(prompt);
      this.generatedContent = this.formatMarkdown(result);
      this.generated = true;
    } catch (error: any) {
      this.errorMessage = 'Failed to generate document. Please try again.';
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  formatMarkdown(text: string): string {
    return (
      '<p>' +
      text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\[(.*?)\]/g, '<span class="placeholder">[$1]</span>')
        .replace(/\n{2,}/g, '</p><p>')
        .replace(/\n/g, '<br/>') +
      '</p>'
    );
  }

  resetForm() {
    this.documentTitle = '';
    this.documentPrompt = '';
    this.generatedContent = '';
    this.generated = false;
    this.errorMessage = '';
  }
}
