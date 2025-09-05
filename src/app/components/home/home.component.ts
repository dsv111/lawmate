import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatCardModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  isLoggedIn: any;
  constructor(private authService: AuthService, private router: Router) {
    this.isLoggedIn = this.authService.isLoggedIn;
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

    const path = routeMap[route];

    if (path) {
      this.router.navigateByUrl(path);
    } else {
      console.warn('Unknown route:', route);
    }
  }
}
