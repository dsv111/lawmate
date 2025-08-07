import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedUserObject = signal<any>(this.getStoredUser());

  isLoggedIn = computed(() => !!this.loggedUserObject());
  userType = computed(() => this.loggedUserObject()?.userType ?? null);

  private getStoredUser() {
    const userStr = sessionStorage.getItem('loggedUserObject');
    return userStr ? JSON.parse(userStr) : null;
  }

  setUser(user: any) {
    sessionStorage.setItem('loggedUserObject', JSON.stringify(user));
    this.loggedUserObject.set(user);
  }

  clearUser() {
    sessionStorage.removeItem('loggedUserObject');
    this.loggedUserObject.set(null);
  }
}
