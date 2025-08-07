import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'app-profile',
  imports: [MatCardModule,CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  userDetails:any = [];
  constructor(){
      
        
  }
  ngOnInit() {
  const parsedUserDetails= sessionStorage.getItem('loggedUserObject') || '';
        this.userDetails = JSON.parse(parsedUserDetails);
        console.log('userDetails',this.userDetails);
        
  }
}
