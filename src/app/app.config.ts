import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app-routing.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { AuthModule } from '@auth0/auth0-angular';
import { environment } from 'src/environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideIonicAngular({}),
    importProvidersFrom(
      AuthModule.forRoot({
       domain: environment.auth0.domain, // ← do environment
        clientId: environment.auth0.clientId, // ← do environment
        authorizationParams: {
          redirect_uri: environment.auth0.authorizationParams.redirect_uri
        }
      })
    )
  ]
};