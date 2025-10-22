import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppleAuthService } from '../../services/apple-auth';
import { LoginResponse } from '../../models/apple-auth.models';

@Component({
  selector: 'app-apple-signin',
  standalone: false,
  templateUrl: './apple-signin.html',
  styleUrls: ['./apple-signin.scss'],
})
export class AppleSigninComponent implements OnInit {
  isLoading = false;
  error: string | null = null;
  user: LoginResponse | null = null;

  constructor(
    private appleAuthService: AppleAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.appleAuthService.initAppleSignIn();
    
    // Check if user is already logged in
    this.checkExistingAuth();
  }

  private checkExistingAuth(): void {
    const accessToken = this.appleAuthService.getCookie('accessToken');
    if (accessToken) {
      // User has valid token, load user data from localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        this.user = JSON.parse(userData);
      }
    }
  }

  signInWithApple(): void {
    this.isLoading = true;
    this.error = null;

    this.appleAuthService.signInWithApple().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status === 200 && response.data) {
          this.user = response.data;
          
          // Store user data in localStorage (without tokens)
          const userDataToStore = {
            id: response.data.id,
            email: response.data.email,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            isVerified: response.data.isVerified
          };
          localStorage.setItem('user', JSON.stringify(userDataToStore));
          
          // Redirect to dashboard or home page
          // this.router.navigate(['/dashboard']);
          
          console.log('Login successful! Tokens stored in cookies.');
        } else {
          this.error = response.message || 'Login failed';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.message || 'An error occurred during sign in';
      }
    });
  }

  logout(): void {
    this.user = null;
    localStorage.removeItem('user');
    
    // Clear authentication cookies
    this.appleAuthService.clearAuthCookies();
    
    // Redirect to login page
    // this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    return this.appleAuthService.getCookie('accessToken');
  }

  getRefreshToken(): string | null {
    return this.appleAuthService.getCookie('refreshToken');
  }
}