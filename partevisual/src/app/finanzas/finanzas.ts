import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanzasService, Pago, Factura, CreatePagoPayload } from '../services/finanzas.service';
import { EnviosService, Envio } from '../services/envios.service';
import { DataTableComponent } from '../components/data-table/data-table';
import { ModalComponent } from '../components/modal/modal';

@Component({
  selector: 'app-finanzas',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent, ModalComponent],
  templateUrl: './finanzas.html'
})
export class FinanzasComponent implements OnInit {

  // ── Services ──────────────────────────────────────────────
  private finanzasService = inject(FinanzasService);
  private enviosService = inject(EnviosService);

  // ── Core Data Signals ─────────────────────────────────────
  pagos = signal<Pago[]>([]);
  facturas = signal<Factura[]>([]);
  envios = signal<Envio[]>([]);
  loading = signal(false);

  // ── UI State Signals ──────────────────────────────────────
  activeTab = signal<'pagos' | 'facturas'>('pagos');
  showPagoModal = signal(false);
  showPagoDetailModal = signal(false);
  showFacturaDetailModal = signal(false);
  selectedPago = signal<Pago | null>(null);
  selectedFactura = signal<Factura | null>(null);

  // ── Feedback Signals ──────────────────────────────────────
  errorMessage = signal('');
  successMessage = signal('');

  // ── Pago Form Signals ─────────────────────────────────────
  formEnvioId = signal<number | null>(null);
  formMonto = signal<number | null>(null);
  formMetodo = signal<'Efectivo' | 'QR' | 'Tarjeta'>('Efectivo');
  formIncluirFactura = signal(false);
  formNumeroFactura = signal('');
  formNit = signal('');
  formRazonSocial = signal('');

  // ── Table Column Definitions ──────────────────────────────
  pagoColumns = [
    { key: 'id', label: 'ID' },
    { key: 'monto', label: 'Monto (Bs.)' },
    { key: 'metodo', label: 'Método' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'envioId', label: 'Envío ID' }
  ];

  facturaColumns = [
    { key: 'id', label: 'ID' },
    { key: 'numeroFactura', label: 'N° Factura' },
    { key: 'nit', label: 'NIT' },
    { key: 'razonSocial', label: 'Razón Social' },
    { key: 'fecha', label: 'Fecha' }
  ];

  metodoOptions: ('Efectivo' | 'QR' | 'Tarjeta')[] = ['Efectivo', 'QR', 'Tarjeta'];

  // ── Computed Signals ──────────────────────────────────────
  totalRecaudado = computed(() =>
    this.pagos().reduce((sum, p) => sum + (Number(p.monto) || 0), 0)
  );

  numeroPagos = computed(() => this.pagos().length);

  // ── Lifecycle ─────────────────────────────────────────────
  ngOnInit(): void {
    this.loadPagos();
    this.loadFacturas();
    this.loadEnvios();
  }

  // ── Data Loading ──────────────────────────────────────────
  loadPagos(): void {
    this.loading.set(true);
    this.finanzasService.getAllPagos().subscribe({
      next: (data) => {
        this.pagos.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.showError('Error al cargar los pagos');
        this.loading.set(false);
      }
    });
  }

  loadFacturas(): void {
    this.finanzasService.getAllFacturas().subscribe({
      next: (data) => this.facturas.set(data),
      error: () => this.showError('Error al cargar las facturas')
    });
  }

  loadEnvios(): void {
    this.enviosService.getAll().subscribe({
      next: (data) => this.envios.set(data),
      error: () => this.showError('Error al cargar los envíos')
    });
  }

  // ── Tab Navigation ────────────────────────────────────────
  switchTab(tab: 'pagos' | 'facturas'): void {
    this.activeTab.set(tab);
  }

  // ── Pago CRUD ─────────────────────────────────────────────
  openCreatePago(): void {
    this.resetForm();
    this.showPagoModal.set(true);
  }

  savePago(): void {
    if (!this.formEnvioId() || !this.formMonto()) {
      this.showError('Envío y Monto son obligatorios');
      return;
    }

    const payload: CreatePagoPayload = {
      envioId: this.formEnvioId()!,
      monto: this.formMonto()!,
      metodo: this.formMetodo()
    };

    if (this.formIncluirFactura()) {
      payload.factura = {
        numeroFactura: this.formNumeroFactura(),
        nit: this.formNit(),
        razonSocial: this.formRazonSocial()
      };
    }

    this.loading.set(true);
    this.finanzasService.createPago(payload).subscribe({
      next: () => {
        this.showPagoModal.set(false);
        this.showSuccess('Pago registrado exitosamente');
        this.loadPagos();
        this.loadFacturas();
        this.resetForm();
      },
      error: () => {
        this.showError('Error al registrar el pago');
        this.loading.set(false);
      }
    });
  }

  // ── Detail Views ──────────────────────────────────────────
  viewPagoDetail(pago: Pago): void {
    this.loading.set(true);
    this.finanzasService.getPagoById(pago.id!).subscribe({
      next: (fullPago) => {
        this.selectedPago.set(fullPago);
        // If the pago has an associated factura, resolve it
        if (fullPago.facturaId) {
          this.finanzasService.getFacturaById(fullPago.facturaId).subscribe({
            next: (factura) => {
              this.selectedFactura.set(factura);
              this.loading.set(false);
              this.showPagoDetailModal.set(true);
            },
            error: () => {
              this.selectedFactura.set(null);
              this.loading.set(false);
              this.showPagoDetailModal.set(true);
            }
          });
        } else if (fullPago.factura) {
          this.selectedFactura.set(fullPago.factura);
          this.loading.set(false);
          this.showPagoDetailModal.set(true);
        } else {
          this.selectedFactura.set(null);
          this.loading.set(false);
          this.showPagoDetailModal.set(true);
        }
      },
      error: () => {
        this.showError('Error al cargar el detalle del pago');
        this.loading.set(false);
      }
    });
  }

  viewFacturaDetail(factura: Factura): void {
    this.loading.set(true);
    this.finanzasService.getFacturaById(factura.id!).subscribe({
      next: (fullFactura) => {
        this.selectedFactura.set(fullFactura);
        // Resolve associated pago if available
        if (fullFactura.pago) {
          this.selectedPago.set(fullFactura.pago);
        } else if (fullFactura.pagoId) {
          this.finanzasService.getPagoById(fullFactura.pagoId).subscribe({
            next: (pago) => this.selectedPago.set(pago),
            error: () => this.selectedPago.set(null)
          });
        } else {
          this.selectedPago.set(null);
        }
        this.loading.set(false);
        this.showFacturaDetailModal.set(true);
      },
      error: () => {
        this.showError('Error al cargar el detalle de la factura');
        this.loading.set(false);
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────────
  getMetodoBadgeClasses(metodo: string): string {
    switch (metodo) {
      case 'Efectivo':
        return 'bg-green-500/15 text-green-400 border-green-500/20';
      case 'QR':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/20';
      case 'Tarjeta':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/20';
      default:
        return 'bg-dark-700/50 text-dark-300 border-dark-600/30';
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-BO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  formatDate(date: string | Date): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  closePagoModal(): void {
    this.showPagoModal.set(false);
    this.resetForm();
  }

  closePagoDetailModal(): void {
    this.showPagoDetailModal.set(false);
    this.selectedPago.set(null);
    this.selectedFactura.set(null);
  }

  closeFacturaDetailModal(): void {
    this.showFacturaDetailModal.set(false);
    this.selectedFactura.set(null);
    this.selectedPago.set(null);
  }

  private resetForm(): void {
    this.formEnvioId.set(null);
    this.formMonto.set(null);
    this.formMetodo.set('Efectivo');
    this.formIncluirFactura.set(false);
    this.formNumeroFactura.set('');
    this.formNit.set('');
    this.formRazonSocial.set('');
  }

  private showError(msg: string): void {
    this.errorMessage.set(msg);
    setTimeout(() => this.errorMessage.set(''), 4000);
  }

  private showSuccess(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(''), 4000);
  }
}
