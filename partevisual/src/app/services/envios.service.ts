import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EstadoEnvio {
  id: number;
  nombre: string;
}

export interface Entrega {
  id?: number;
  envioId: number;
  fechaEntrega: string;
  nombreRecibe: string;
  ciRecibe: string;
  firma: string;
}

export interface Envio {
  id?: number;
  encomiendaId: number;
  sucursalOrigenId: number;
  sucursalDestinoId: number;
  fechaEnvio: string;
  fechaEstimada: string;
  costo: number;
  estadoId: number;
  encomienda?: any;
  sucursalOrigen?: any;
  sucursalDestino?: any;
  estado?: EstadoEnvio;
  seguimientos?: any[];
  entrega?: Entrega;
}

export interface CreateEnvioPayload {
  encomiendaId: number;
  sucursalOrigenId?: number;
  sucursalDestinoId?: number;
  fechaEnvio?: string;
  fechaEstimada?: string;
  costo: number;
  estadoId?: number;
}

export interface CreateEntregaPayload {
  envioId: number;
  fechaEntrega?: string;
  nombreRecibe: string;
  ciRecibe: string;
  firma: string;
}

@Injectable({
  providedIn: 'root'
})
export class EnviosService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/envios';

  getAll(): Observable<Envio[]> {
    return this.http.get<Envio[]>(this.apiUrl);
  }

  getById(id: number): Observable<Envio> {
    return this.http.get<Envio>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateEnvioPayload): Observable<Envio> {
    return this.http.post<Envio>(this.apiUrl, payload);
  }

  update(id: number, data: Partial<Envio>): Observable<Envio> {
    return this.http.patch<Envio>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  registerEntrega(payload: CreateEntregaPayload): Observable<Entrega> {
    return this.http.post<Entrega>(`${this.apiUrl}/entrega`, payload);
  }
}
