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
  private auth0 = inject(Auth0Service);
  private token = '';

  user$ = this.auth0.user$;
  isAuthenticated$ = this.auth0.isAuthenticated$;
  isLoading$ = this.auth0.isLoading$;

  constructor() {
    
    this.auth0.idTokenClaims$.subscribe(claims => {
      this.token = claims?.__raw || '';
    });

    this.auth0.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        console.log('🔐 Usuário autenticado, buscando token...');
      }
    });
  }

  login() {
    this.auth0.loginWithRedirect();
  }

  logout() {
    this.auth0.logout();
  }

  getToken(): string {
    return this.token;
  }

  getUserId(): string {
    let userId = '';
    this.auth0.user$.subscribe(user => {
      userId = user?.sub || 'anonymous';
    });
    return userId;
  }
}