import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone:true,
  imports: [RouterModule,CommonModule,MatIcon],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  showDropdown = false;
  isLoggedIn = false;
ngOnInit() {
    // this.checkSession();
  }

  onHover() {
  this.checkSession();
  this.showDropdown = true;
  console.log('Hovered: showDropdown =', this.showDropdown);
}

onLeave() {
  this.showDropdown = false;
  console.log('Left: showDropdown =', this.showDropdown);
}


  checkSession() {
    // Replace 'userLoggedIn' with your actual session key
    this.isLoggedIn = sessionStorage.getItem('userLoggedIn') === 'true';
  }
}
