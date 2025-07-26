
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-lawyer-connect',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './lawyer-connect.component.html',
  
  styleUrls: ['./lawyer-connect.component.css']
})
export class LawyerConnectComponent implements OnInit {
  lawyers = [
    {
      name: 'Adv. Jhansi SriVidya Devi',
      location: 'Delhi',
      specialty: 'Criminal Law',
      rating: 4.5,
      available: true
    },
    {
      name: 'Adv. Stephen Sai Krishna',
      location: 'Hyderabad',
      specialty: 'Family Law',
      rating: 4.8,
      available: false
    },
    {
      name: 'Adv.Surya Naga Phani',
      location: 'Mumbai',
      specialty: 'Property Law',
      rating: 4.2,
      available: true
    }
  ];

  filteredLawyers = [...this.lawyers];
  searchQuery = '';

  constructor() {}

  ngOnInit(): void {}

  filterLawyers(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredLawyers = this.lawyers.filter(lawyer =>
      lawyer.name.toLowerCase().includes(query) ||
      lawyer.location.toLowerCase().includes(query) ||
      lawyer.specialty.toLowerCase().includes(query)
    );
  }

  connect(lawyerName: string): void {
    alert(`Connection request sent to ${lawyerName}`);
  }
}
