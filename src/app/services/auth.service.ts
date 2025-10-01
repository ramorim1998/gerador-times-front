import { Injectable, inject } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular'; // ← Nome diferente!
import { BehaviorSubject } from 'rxjs';

export interface User {
  sub: string;
  name: string;
  email: string;
  picture?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth0 = inject(Auth0Service); // ← Auth0Service com nome diferente!
  
  // Podemos manter os BehaviorSubjects ou usar diretamente do Auth0
  user$ = this.auth0.user$;
  isAuthenticated$ = this.auth0.isAuthenticated$;
  isLoading$ = this.auth0.isLoading$;

  login() {
    this.auth0.loginWithRedirect();
  }

  logout() {
    this.auth0.logout();
  }

  getToken(): string {
    let token = '';
    this.auth0.idTokenClaims$.subscribe(claims => {
      token = claims?.__raw || '';
    });
    return token;
  }

  getUserId(): string {
    let userId = '';
    this.auth0.user$.subscribe(user => {
      userId = user?.sub || 'anonymous';
    });
    return userId;
  }
}