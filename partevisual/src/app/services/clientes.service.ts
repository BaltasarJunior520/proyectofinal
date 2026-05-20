import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContactoCliente {
  id?: number;
  nombre: string;
  tipo: string;
  telefono: string;
}

export interface Cliente {
  id?: number;
  nombre: string;
  apellido: string;
  ci: string;
  telefono: string;
  email: string;
  direccion: string;
  fechaRegistro?: Date;
  contactos?: ContactoCliente[];
  sucursales?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/clientes';

  getAll(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl);
  }

  getById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  create(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente);
  }

  update(id: number, cliente: Partial<Cliente>): Observable<Cliente> {
    return this.http.patch<Cliente>(`${this.apiUrl}/${id}`, cliente);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  asociarSucursal(id: number, sucursalId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/sucursales/${sucursalId}`, {});
  }

  desasociarSucursal(id: number, sucursalId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}/sucursales/${sucursalId}`);
  }
}
