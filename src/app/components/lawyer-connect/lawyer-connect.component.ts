import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GoogleMapsModule } from '@angular/google-maps';
import emailjs, { EmailJSResponseStatus } from 'emailjs-com';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

// Lawyer interface
interface Lawyer {
  id: number;
  name: string;
  email: string;
  location: string;
  specialization: string;
  lat: number;
  lng: number;
  rating: number;
  available: boolean;
  distanceKm?: number;
  etaMinutes?: number;
}

@Component({
  selector: 'app-lawyer-connect',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    GoogleMapsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './lawyer-connect.component.html',
  styleUrls: ['./lawyer-connect.component.css'],
})
export class LawyerConnectComponent implements OnInit {
  lawyers: Lawyer[] = [];
  filteredLawyers: Lawyer[] = [];
  nearest?: Lawyer;
  searchQuery = '';
  showNearby = false;
  loggedUserDetails: any;
  loading = false;
  // Google Maps props
  center: google.maps.LatLngLiteral = { lat: 20.5937, lng: 78.9629 }; // Default India
  zoom = 5;

  constructor(private ngZone: NgZone, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    const userDetails = sessionStorage.getItem('loggedUserObject');
    this.loggedUserDetails = userDetails ? JSON.parse(userDetails) : {};
    console.log(this.loggedUserDetails);

    this.loadLawyers();
    this.filteredLawyers = [...this.lawyers];

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.ngZone.run(() => {
            this.center = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            };
            this.zoom = 12;
            this.calculateDistances(this.center.lat, this.center.lng);
          });
        },
        () => {
          // fallback to Delhi
          this.calculateDistances(28.7041, 77.1025);
        }
      );
    }
  }

  toggleView() {
    this.showNearby = !this.showNearby;
  }

  loadLawyers() {
    this.lawyers = [
      {
        id: 1,
        name: 'Adv. Jhansi SriVidya Devi',
        email: 'dsv111@yahoo.com',
        location: 'Delhi',
        specialization: 'Criminal Law',
        rating: 4.8,
        available: true,
        lat: 28.7041,
        lng: 77.1025,
      },
      {
        id: 2,
        name: 'Adv. Stephen Sai Krishna',
        email: 'srinivas.dasari2019@gmail.com',
        location: 'Hyderabad',
        specialization: 'Family Law',
        rating: 4.7,
        available: false,
        lat: 17.385,
        lng: 78.4867,
      },
      {
        id: 3,
        name: 'Adv. Saikh Su Na Phani',
        email: 'suryag898@gmail.com',
        location: 'Assam',
        specialization: 'Civil Law / Litigation',
        rating: 4.6,
        available: true,
        lat: 26.2006,
        lng: 92.9376,
      },
      {
        id: 4,
        name: 'Adv. William Vamsi',
        email: 'cnugaaru1234@gmail.com',
        location: 'Mumbai',
        specialization: 'Property Law',
        rating: 4.5,
        available: false,
        lat: 19.076,
        lng: 72.8777,
      },
      {
        id: 5,
        name: 'Adv. George Ganesh',
        email: 'dsv111@yahoo.com',
        location: 'Goa',
        specialization: 'Immigration Law',
        rating: 4.4,
        available: true,
        lat: 15.2993,
        lng: 74.124,
      },
      {
        id: 6,
        name: 'Adv. Nelson Nani',
        email: 'sdasari729@gmail.com',
        location: 'Rajahmundry',
        specialization: 'Employment and Labor Law',
        rating: 4.3,
        available: true,
        lat: 17.0005,
        lng: 81.804,
      },
    ];
  }

  calculateDistances(userLat: number, userLng: number) {
    const R = 6371; // earth radius km
    const toRad = (x: number) => (x * Math.PI) / 180;

    this.lawyers.forEach((l) => {
      const dLat = toRad(l.lat - userLat);
      const dLng = toRad(l.lng - userLng);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(userLat)) *
          Math.cos(toRad(l.lat)) *
          Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      l.distanceKm = +distance.toFixed(2);
      l.etaMinutes = Math.round((distance / 40) * 60); // assume avg speed 40 km/h
    });

    this.lawyers.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    this.nearest = this.lawyers[0];
  }

  filterLawyers(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredLawyers = this.lawyers.filter(
      (lawyer) =>
        lawyer.name.toLowerCase().includes(query) ||
        lawyer.location.toLowerCase().includes(query) ||
        lawyer.specialization.toLowerCase().includes(query)
    );
  }

  connect(lawyer: any): void {
    this.loading = true; // show loader
    const templateParams = {
      to_name: lawyer.name,
      to_email: lawyer.email,
      title: 'New Client Request from LawMate',
      name: this.loggedUserDetails.username,
      email: this.loggedUserDetails.email,
      mobileno: this.loggedUserDetails.mobileno,
    };

    emailjs
      .send(
        'service_0e1u4tc', // your service id
        'template_faixalh', // your template id
        templateParams,
        '29dikg2JqFTNdR8ZV' // your public key
      )
      .then(() => {
        this.loading = false; // hide loader
        this.snackBar.open('Request sent successfully!', 'Close', { duration: 3000 });
      })
      .catch((error) => {
        this.loading = false; // hide loader
        console.error(error);
        alert('Failed to send email');
      });
  }
}
