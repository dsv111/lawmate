import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule   // ✅ Only this, remove MatSnackBar
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  isLoggedIn: any;
  userType: any;
  loggedUserDetails: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar   // ✅ Correct place
  ) {
    this.isLoggedIn = this.authService.isLoggedIn;
    const userDetails = sessionStorage.getItem('loggedUserObject');
    this.loggedUserDetails = userDetails ? JSON.parse(userDetails) : {};
    console.log(this.loggedUserDetails);
  }

  routeRespectingPage(route: string): void {
    if (!this.authService.isLoggedIn()) {
      console.warn('User not logged in');
      return;
    }

    const routeMap: { [key: string]: string } = {
      'legal-bot': '/legalbot',
      'doc-gen': '/doc-generator',
      'book-lawer': '/lawyer-connect',
      'advocate-mentor': '/advo-mentor',
    };

    this.userType = this.loggedUserDetails.userType;
debugger;
    if (route === 'advocate-mentor' && this.userType != 'advocate') {
      this.snackBar.open(
        '❌ Access denied: only advocates can access this feature.',
        'Close',
        {
          duration: 3000,
          panelClass: ['warning-toast'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        }
      );
      return;
    }

    const path = routeMap[route];
    if (path) {
      this.router.navigateByUrl(path);
    } else {
      console.warn('Unknown route:', route);
    }
  }
}
