import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeng/themes';
import Lara from '@primeng/themes/lara';
import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { authExpired } from './core/auth/auth-expired.interceptor';
import { xsrf } from './core/auth/xsrf.interceptor';

const AirbnbPreset = definePreset(Lara, {
  semantic: {
    primary: {
      50: '{rose.50}',
      100: '{rose.100}',
      200: '{rose.200}',
      300: '{rose.300}',
      400: '{rose.400}',
      500: '{rose.500}',
      600: '{rose.600}',
      700: '{rose.700}',
      800: '{rose.800}',
      900: '{rose.900}',
      950: '{rose.950}'
    },
    colorScheme: {
      light: {
        primary: {
          color: '#F24B5B',
          contrastColor: '#ffffff',
          hoverColor: '#E03E4E',
          activeColor: '#CC3545'
        }
      }
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([authExpired, xsrf]),
      withXsrfConfiguration({ cookieName: "XSRF-TOKEN", headerName: "X-XSRF-TOKEN" }),
    ),
    providePrimeNG({
      theme: {
        preset: AirbnbPreset,
        options: {
          darkModeSelector: false,
          cssLayer: {
            name: 'primeng',
            order: 'primeng, reset'
          }
        }
      }
    }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes)
  ]
};
