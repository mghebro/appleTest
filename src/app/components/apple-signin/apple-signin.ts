import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  constructor(private appleAuthService: AppleAuthService) {}

  ngOnInit(): void {
    this.appleAuthService.initAppleSignIn();
  }

  signInWithApple(): void {
    this.isLoading = true;
    this.error = null;

    this.appleAuthService.signInWithApple().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status === 200 && response.data) {
          this.user = response.data;
          localStorage.setItem('user', JSON.stringify(response.data));
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
  }
}