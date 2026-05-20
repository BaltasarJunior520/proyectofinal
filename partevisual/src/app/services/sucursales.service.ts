import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Sucursal {
  id?: number;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
}

@Injectable({
  providedIn: 'root'
})
export class SucursalesService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/sucursales';

  getAll(): Observable<Sucursal[]> {
    return this.http.get<Sucursal[]>(this.apiUrl);
  }

  getById(id: number): Observable<Sucursal> {
    return this.http.get<Sucursal>(`${this.apiUrl}/${id}`);
  }

  create(sucursal: Sucursal): Observable<Sucursal> {
    return this.http.post<Sucursal>(this.apiUrl, sucursal);
  }

  update(id: number, sucursal: Partial<Sucursal>): Observable<Sucursal> {
    return this.http.patch<Sucursal>(`${this.apiUrl}/${id}`, sucursal);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
