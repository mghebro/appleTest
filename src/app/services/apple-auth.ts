import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AppleSignInRequest, AppleSignInResponse, ApiResponse, LoginResponse } from '../models/apple-auth.models';

@Injectable({
  providedIn: 'root'
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
        usePopup: true
      });
    }
  }

  signInWithApple(): Observable<ApiResponse<LoginResponse>> {
    return from(this.triggerAppleSignIn()).pipe(
      switchMap((appleResponse) => this.sendToBackend(appleResponse)),
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
    return await window.AppleID.auth.signIn();
  }

  private sendToBackend(appleResponse: AppleSignInResponse): Observable<ApiResponse<LoginResponse>> {
    const request: AppleSignInRequest = {
      idToken: appleResponse.authorization.id_token,
      code: appleResponse.authorization.code,
      user: appleResponse.user ? {
        email: appleResponse.user.email,
        name: appleResponse.user.name ? {
          firstName: appleResponse.user.name.firstName || '',
          lastName: appleResponse.user.name.lastName || ''
        } : undefined
      } : undefined
    };

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<ApiResponse<LoginResponse>>(this.apiUrl, request, { headers });
  }
}