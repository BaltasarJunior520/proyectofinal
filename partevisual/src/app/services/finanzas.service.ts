import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Factura {
  id?: number;
  pagoId?: number;
  numeroFactura: string;
  nit?: string;
  razonSocial?: string;
  fecha?: string;
}

export interface Pago {
  id?: number;
  envioId: number;
  monto: number;
  metodo: string;
  fecha?: string;
  factura?: Factura;
  envio?: any;
}

export interface CreatePagoPayload {
  envioId: number;
  monto: number;
  metodo: string;
  factura?: {
    numeroFactura: string;
    nit?: string;
    razonSocial?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class FinanzasService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/finanzas';

  createPago(payload: CreatePagoPayload): Observable<Pago> {
    return this.http.post<Pago>(`${this.apiUrl}/pagos`, payload);
  }

  getAllPagos(): Observable<Pago[]> {
    return this.http.get<Pago[]>(`${this.apiUrl}/pagos`);
  }

  getPagoById(id: number): Observable<Pago> {
    return this.http.get<Pago>(`${this.apiUrl}/pagos/${id}`);
  }

  getAllFacturas(): Observable<Factura[]> {
    return this.http.get<Factura[]>(`${this.apiUrl}/facturas`);
  }

  getFacturaById(id: number): Observable<Factura> {
    return this.http.get<Factura>(`${this.apiUrl}/facturas/${id}`);
  }
}
