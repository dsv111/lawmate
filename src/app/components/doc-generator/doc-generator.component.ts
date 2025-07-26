// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-doc-generator',
//   imports: [],
//   templateUrl: './doc-generator.component.html',
//   styleUrl: './doc-generator.component.css'
// })
// export class DocGeneratorComponent {

// }
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-doc-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doc-generator.component.html',
  styleUrls: ['./doc-generator.component.css']
})
export class DocGeneratorComponent {
  documentTitle = '';
  documentContent = '';
  generated = false;

  generateDocument() {
    if (this.documentTitle.trim() && this.documentContent.trim()) {
      this.generated = true;
    }
  }

  resetForm() {
    this.documentTitle = '';
    this.documentContent = '';
    this.generated = false;
  }
}

