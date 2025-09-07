import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule, MatIcon],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  showDropdown = false;
  isMenuOpen = false;

  loggedUserType: string | null = null;
  private authService = inject(AuthService);

  isLoggedIn = this.authService.isLoggedIn;
  userType = this.authService.userType;

  constructor(private router: Router) {}

  ngOnInit() {
    const loggedUserObject = sessionStorage.getItem('loggedUserObject');
    if (loggedUserObject) {
      const user = JSON.parse(loggedUserObject);
      this.loggedUserType = user?.userType || null;
    }
  }
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
  onHover() {
    this.showDropdown = true;
  }

  onLeave() {
    this.showDropdown = false;
  }

  logOut() {
    this.authService.clearUser();
    sessionStorage.removeItem('SignupDetails');
    this.router.navigate(['/signin']);
  }
}
