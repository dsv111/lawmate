import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface User {
  email: string;
  password: string;
  username: string;
  userType: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatSnackBarModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  signupForm: FormGroup;
  isLoginMode = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      mobileno: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      userType: ['', Validators.required], // 'user' or 'advocate'
    });
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  switchToSignUp() {
    this.isLoginMode = false;
  }

  onLoginSubmit() {
    if (this.loginForm.invalid) {
      this.snackBar.open('Please fill out the form correctly', 'Close', {
        duration: 3000,
      });
      return;
    }

    const loginData = this.loginForm.value;
    const storedSignup = localStorage.getItem('SignupDetails');
 
    if (!storedSignup) {
      this.snackBar.open('Please sign up before logging in', 'Close', {
        duration: 3000,
        panelClass: ['warn-snackbar'],
      });
      return;
    }

    let users: User[] = [];

    try {
      users = JSON.parse(storedSignup);
      if (!Array.isArray(users)) throw new Error('Corrupted');
    } catch {
      this.snackBar.open('Signup data is corrupted.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    const user = users.find(
      (u) =>
        u.email.toLowerCase() === loginData.email.toLowerCase() &&
        u.password === loginData.password
    );

    if (!user) {
      this.snackBar.open('Invalid email or password', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    // ✅ Save and update reactive signal
    this.authService.setUser(user);
    this.snackBar.open('Login successful!', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });

    this.router.navigate(['/legalbot']);
  }

  onSignupSubmit() {
    if (this.signupForm.invalid) return;
    const signupData = this.signupForm.value;
  
    const newEmail = signupData.email.toLowerCase();
    let users: User[] = [];

    const storedData = localStorage.getItem('SignupDetails');
    try {
      users = storedData ? JSON.parse(storedData) : [];
      if (!Array.isArray(users)) throw new Error('Invalid');
    } catch {
      users = [];
    }

    const emailExists = users.some(
      (user) => user.email.toLowerCase() === newEmail
    );

    if (emailExists) {
      this.snackBar.open(
        'Email already registered! Please use a different email.',
        'Close',
        {
          duration: 3000,
          panelClass: ['warning-toast'],
          horizontalPosition: 'center',
          verticalPosition: 'top',
        }
      );
      return;
    }

    users.push(signupData);
    localStorage.setItem('SignupDetails', JSON.stringify(users));

    this.snackBar.open('Signup successful!', 'Close', {
      duration: 3000,
      panelClass: ['success-toast'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });

    // Optionally auto-switch to login view
    this.isLoginMode = true;
  }
}
