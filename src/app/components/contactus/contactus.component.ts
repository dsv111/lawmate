import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import emailjs from 'emailjs-com';

@Component({
  selector: 'app-contactus',
  standalone: true,
  imports: [
    FormsModule,
    MatSnackBarModule
    ],
  templateUrl: './contactus.component.html',
  styleUrls: ['./contactus.component.css']
})
export class ContactusComponent {
  loading = false;

  contactFormData = {
    name: '',
    email: '',
    mobileno: '',
    message: ''
  };

  constructor(private snackBar: MatSnackBar) {}

  sendContactForm(): void {
    if (!this.contactFormData.name || !this.contactFormData.email || !this.contactFormData.message) {
      this.snackBar.open('⚠️ Please fill in all fields', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;

    const templateParams = {
      to_email: 'dsv111@yahoo.com', // Your email
      name: this.contactFormData.name,
      email: this.contactFormData.email,
      mobileno: this.contactFormData.mobileno,
      message: this.contactFormData.message
    };

    emailjs
      .send(
        'service_0e1u4tc',   // Replace with EmailJS service ID
        'template_faixalh',  // Replace with EmailJS template ID
        templateParams,
        '29dikg2JqFTNdR8ZV'    // Replace with EmailJS public key
      )
      .then(() => {
        this.loading = false;
        this.snackBar.open('✅ Message sent successfully!', 'Close', { duration: 3000 });
        this.contactFormData = { name: '', email: '',mobileno:'', message: '' }; // Reset form
      })
      .catch((error) => {
        this.loading = false;
        console.error('EmailJS error:', error);
        this.snackBar.open('❌ Failed to send message', 'Close', { duration: 3000 });
      });
  }
}
