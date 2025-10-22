import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  AppleSignInRequest,
  AppleSignInResponse,
  ApiResponse,
  LoginResponse,
} from '../models/apple-auth.models';

@Injectable({
  providedIn: 'root',
})
export class AppleAuthService {
  private readonly apiUrl = `${environment.apiUrl}/api/auth/apple-signin`;

  constructor(private http: HttpClient) {}

  initAppleSignIn(): void {
    if (typeof window !== 'undefined' && window.AppleID) {
      window.AppleID.auth.init({
        clientId: environment.appleClientId,
        scope: 'name email',
        redirectURI: environment.appleRedirectUri,
        usePopup: true,
      });
    }
  }

  signInWithApple(): Observable<ApiResponse<LoginResponse>> {
    return from(this.triggerAppleSignIn()).pipe(
      switchMap((appleResponse) => this.sendToBackend(appleResponse)),
      tap((response) => {
        // Store tokens in cookies when sign in is successful
        if (response.status === 200 && response.data) {
          this.storeTokensInCookies(response.data);
        }
      }),
      catchError((error) => {
        console.error('Apple Sign In Error:', error);
        return throwError(() => error);
      })
    );
  }

  private async triggerAppleSignIn(): Promise<AppleSignInResponse> {
    if (!window.AppleID) {
      throw new Error('Apple Sign In SDK not loaded');
    }
    const response = await window.AppleID.auth.signIn();
    console.log('Apple authorization response:', response);
    return response;
  }

  private sendToBackend(
    appleResponse: AppleSignInResponse
  ): Observable<ApiResponse<LoginResponse>> {
    const request: AppleSignInRequest = {
      idToken: appleResponse.authorization.id_token,
      code: appleResponse.authorization.code,
      user: appleResponse.user
        ? {
            email: appleResponse.user.email,
            name: appleResponse.user.name
              ? {
                  firstName: appleResponse.user.name.firstName || '',
                  lastName: appleResponse.user.name.lastName || '',
                }
              : undefined,
          }
        : undefined,
    };

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<ApiResponse<LoginResponse>>(this.apiUrl, request, {
      headers,
      withCredentials: true,
    });
  }

  private storeTokensInCookies(loginData: LoginResponse): void {
    if (loginData.accessToken) {
      this.setCookie('accessToken', loginData.accessToken, 2 / 24); // 2 hours
    }
    if (loginData.refreshToken) {
      this.setCookie('refreshToken', loginData.refreshToken, 7); // 7 days
    }
  }

  private setCookie(name: string, value: string, days: number): void {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    const secure = '; Secure'; // Always use Secure with HTTPS
    // Use SameSite=None for cross-origin requests in production
    const sameSite = '; SameSite=None';
    // Optional: set domain for subdomain sharing
    // const domain = environment.production ? '; domain=.yourdomain.com' : '';
    document.cookie = `${name}=${value}; ${expires}; path=/${secure}${sameSite}`;
  }

  getCookie(name: string): string | null {
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length);
      }
    }
    return null;
  }

  deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  clearAuthCookies(): void {
    this.deleteCookie('accessToken');
    this.deleteCookie('refreshToken');
  }
}