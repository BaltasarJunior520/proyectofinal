import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Seguimiento {
  id?: number;
  envioId: number;
  estadoId: number;
  ubicacion: string;
  observaciones?: string;
  fecha?: string;
  estado?: { id: number; nombre: string };
}

export interface CreateSeguimientoPayload {
  envioId: number;
  estadoId: number;
  ubicacion: string;
  observaciones?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeguimientosService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/seguimientos';

  create(payload: CreateSeguimientoPayload): Observable<Seguimiento> {
    return this.http.post<Seguimiento>(this.apiUrl, payload);
  }

  getByEnvioId(envioId: number): Observable<Seguimiento[]> {
    return this.http.get<Seguimiento[]>(`${this.apiUrl}/envio/${envioId}`);
  }
}
