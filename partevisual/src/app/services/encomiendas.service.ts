import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TipoPaquete {
  id?: number;
  nombre: string;
  descripcion: string;
}

export interface DetalleEncomienda {
  id?: number;
  tipoId: number;
  cantidad: number;
  observaciones: string;
  tipoPaquete?: TipoPaquete;
}

export interface Seguro {
  id?: number;
  monto: number;
  descripcion: string;
}

export interface Encomienda {
  id?: number;
  codigo: string;
  remitenteId: number;
  destinatarioId: number;
  descripcion: string;
  peso: number;
  volumen: number;
  valorDeclarado: number;
  fechaRegistro?: string;
  remitente?: any;
  destinatario?: any;
  detalles?: DetalleEncomienda[];
  seguro?: Seguro;
}

export interface CreateEncomiendaPayload {
  codigo: string;
  remitenteId: number;
  destinatarioId: number;
  descripcion?: string;
  peso?: number;
  volumen?: number;
  valorDeclarado?: number;
  detalles: { tipoId: number; cantidad: number; observaciones?: string }[];
  seguro?: { monto: number; descripcion: string };
}

@Injectable({
  providedIn: 'root'
})
export class EncomiendasService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/encomiendas';

  getAll(): Observable<Encomienda[]> {
    return this.http.get<Encomienda[]>(this.apiUrl);
  }

  getById(id: number): Observable<Encomienda> {
    return this.http.get<Encomienda>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateEncomiendaPayload): Observable<Encomienda> {
    return this.http.post<Encomienda>(this.apiUrl, payload);
  }

  update(id: number, data: Partial<Encomienda>): Observable<Encomienda> {
    return this.http.patch<Encomienda>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
