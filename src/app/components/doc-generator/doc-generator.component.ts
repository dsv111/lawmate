import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GeminiService } from '../../services/gemini.service';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-doc-generator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule, MatButtonModule,MatTooltipModule],
  templateUrl: './doc-generator.component.html',
  styleUrls: ['./doc-generator.component.css'],
})
export class DocGeneratorComponent {
  documentTitle = '';
  documentPrompt = '';
  dynamicForm!: FormGroup;
  dynamicFields: any[] = [];

  generatedContent = '';
  generated = false;
  fieldsRequested = false;
  isLoading = false;
  errorMessage = '';

  constructor(private geminiService: GeminiService, private fb: FormBuilder) {
  }

  async generateFieldRequest() {
    this.errorMessage = '';
    if (!this.documentPrompt.trim()) {
      this.errorMessage = 'Please describe the document you want.';
      return;
    }

    this.isLoading = true;

    const fieldPrompt = `
You are a legal assistant. The user wants to generate a document based on the following request:

"${this.documentPrompt}"

Return a JSON array of required fields for the user to provide, like this:
[
  { "label": "Landlord Name", "key": "landlordName","helpText": 'Enter your legal full name as per official records.' },
  ...
]`.trim();

    try {
      const result = await this.geminiService.generateText(fieldPrompt);
      const fields = this.extractJsonArray(result);
      if (Array.isArray(fields) && fields.length > 0) {
        this.dynamicFields = fields;
        this.fieldsRequested = true;

        const formControls: any = {};
        for (const field of fields) {
          formControls[field.key] = ['', Validators.required];
        }
        this.dynamicForm = this.fb.group(formControls);
      } else {
        this.errorMessage = 'No valid fields returned. Try again with a more specific description.';
      }
    } catch (err) {
      this.errorMessage = 'Something went wrong while fetching required fields.';
      console.error(err);
    } finally {
      this.isLoading = false;
    }
  }

  async generateFinalDocument() {
    if (!this.dynamicForm.valid) {
      this.errorMessage = 'Please fill all the required fields.';
      return;
    }

    this.isLoading = true;

    const fieldData = this.dynamicForm.value;
    let detailsText = '';
    for (const field of this.dynamicFields) {
      detailsText += `${field.label}: ${fieldData[field.key]}\n`;
    }

    const finalPrompt = `
Generate a legal document titled "${this.documentTitle}" using the following details:

${detailsText}

Format it as a professional legal document.
    `.trim();

    try {
      const result = await this.geminiService.generateText(finalPrompt);
      this.generatedContent = this.formatMarkdown(result);
      this.generated = true;
      this.fieldsRequested = false;
    } catch (err) {
      this.errorMessage = 'Failed to generate final document.';
      console.error(err);
    } finally {
      this.isLoading = false;
    }
  }

formatMarkdown(text: string): string {
  // Detect NOTE or Disclaimer and wrap in small text
  const smallNoteRegex = /(NOTE:.*?$|Disclaimer:.*?$)/ims;

  let formatted = text.replace(smallNoteRegex, (match) => {
    return `<span style="font-size:8px; color:gray;">${match}</span>`;
  });

  // Apply basic markdown formatting
  return (
    '<p>' +
    formatted
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[(.*?)\]/g, '<span class="placeholder">[$1]</span>')
      .replace(/\n{2,}/g, '</p><p>')
      .replace(/\n/g, '<br/>') +
    '</p>'
  );
}


  extractJsonArray(text: string): any[] {
    const match = text.match(/\[.*\]/s);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return [];
      }
    }
    return [];
  }

  resetForm() {
    this.documentTitle = '';
    this.documentPrompt = '';
    this.generatedContent = '';
    this.generated = false;
    this.fieldsRequested = false;
    this.dynamicFields = [];
    this.dynamicForm?.reset();
    this.errorMessage = '';
  }
}
