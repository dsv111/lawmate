import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone:true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
loginForm!:FormGroup;
constructor(private fb: FormBuilder){
  this.loginForm = this.fb.group({
     username: ['', Validators.required],
      password: ['', Validators.required],
  });
}

onSubmit() {
  if(this.loginForm.valid){
    const {username,password} = this.loginForm.value;
      console.log('Login Attempt:', username, password);

  }else {
          this.loginForm.markAllAsTouched(); // show errors
  }
}
}
