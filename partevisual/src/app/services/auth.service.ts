import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface LoginResponse {
  access_token: string;
}

export interface UserPayload {
  username: string;
  rol: string;
  empleado_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private apiUrl = 'http://localhost:3000/auth';

  // Signals for reactive authentication state
  token = signal<string | null>(localStorage.getItem('token'));
  
  // Computed signals
  isLoggedIn = computed(() => !!this.token());
  
  userPayload = computed<UserPayload | null>(() => {
    const activeToken = this.token();
    if (!activeToken) return null;
    try {
      const payloadBase64 = activeToken.split('.')[1];
      const decodedJson = atob(payloadBase64);
      return JSON.parse(decodedJson) as UserPayload;
    } catch {
      console.error('Failed to decode token payload');
      return null;
    }
  });

  username = computed(() => this.userPayload()?.username || '');
  role = computed(() => this.userPayload()?.rol || '');
  empleadoId = computed(() => this.userPayload()?.empleado_id || null);

  login(username: string, contrasena: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { nombreUsuario: username, password: contrasena }).pipe(
      tap(response => {
        if (response && response.access_token) {
          localStorage.setItem('token', response.access_token);
          this.token.set(response.access_token);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.token.set(null);
    this.router.navigate(['/login']);
  }
}
