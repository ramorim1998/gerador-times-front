import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-button',
  templateUrl: './login-button.component.html',

  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class LoginButtonComponent {
  private authService = inject(AuthService);
  isAuthenticated$ = this.authService.isAuthenticated$;

  login() {
    this.authService.login();
  }

  logout() {
    this.authService.logout();
  }
}