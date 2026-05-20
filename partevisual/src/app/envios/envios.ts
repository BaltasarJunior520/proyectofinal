import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EnviosService, Envio, CreateEnvioPayload, CreateEntregaPayload, EstadoEnvio } from '../services/envios.service';
import { SeguimientosService, Seguimiento, CreateSeguimientoPayload } from '../services/seguimientos.service';
import { SucursalesService, Sucursal } from '../services/sucursales.service';
import { EncomiendasService, Encomienda } from '../services/encomiendas.service';
import { DataTableComponent } from '../components/data-table/data-table';
import { ModalComponent } from '../components/modal/modal';

@Component({
  selector: 'app-envios',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent, ModalComponent],
  templateUrl: './envios.html'
})
export class EnviosComponent implements OnInit {
  private enviosService = inject(EnviosService);
  private seguimientosService = inject(SeguimientosService);
  private sucursalesService = inject(SucursalesService);
  private encomiendasService = inject(EncomiendasService);

  // Data signals
  envios = signal<Envio[]>([]);
  loading = signal(false);
  sucursales = signal<Sucursal[]>([]);
  encomiendas = signal<Encomienda[]>([]);
  seguimientos = signal<Seguimiento[]>([]);
  selectedEnvio = signal<Envio | null>(null);
  errorMessage = signal('');
  successMessage = signal('');

  // Modal visibility
  showCreateModal = signal(false);
  showDetailModal = signal(false);
  showSeguimientoModal = signal(false);
  showEntregaModal = signal(false);

  // Create form signals
  formEncomiendaId = signal<number>(0);
  formSucursalOrigenId = signal<number>(0);
  formSucursalDestinoId = signal<number>(0);
  formFechaEnvio = signal('');
  formFechaEstimada = signal('');
  formCosto = signal<number>(0);

  // Seguimiento form signals
  formUbicacion = signal('');
  formEstadoId = signal<number>(1);
  formObservaciones = signal('');

  // Entrega form signals
  formNombreRecibe = signal('');
  formCiRecibe = signal('');
  formFirma = signal('');

  // Hardcoded estados
  estados: EstadoEnvio[] = [
    { id: 1, nombre: 'Registrado' },
    { id: 2, nombre: 'En tránsito' },
    { id: 3, nombre: 'Entregado' }
  ];

  // Table columns
  tableColumns = [
    { key: 'id', label: 'ID' },
    { key: 'encomiendaCodigo', label: 'Encomienda' },
    { key: 'origenNombre', label: 'Origen' },
    { key: 'destinoNombre', label: 'Destino' },
    { key: 'costo', label: 'Costo' },
    { key: 'estadoNombre', label: 'Estado' }
  ];

  // Flatten rows for data table
  tableRows = computed(() => {
    return this.envios().map(envio => ({
      ...envio,
      encomiendaCodigo: envio.encomienda?.codigo || '—',
      origenNombre: envio.sucursalOrigen?.nombre || '—',
      destinoNombre: envio.sucursalDestino?.nombre || '—',
      estadoNombre: envio.estado?.nombre || this.getEstadoNombre(envio.estadoId)
    }));
  });

  // Computed: is selected envio delivered?
  isDelivered = computed(() => {
    const envio = this.selectedEnvio();
    if (!envio) return false;
    return envio.estadoId === 3 || envio.estado?.nombre === 'Entregado';
  });

  ngOnInit() {
    this.loadEnvios();
    this.loadSucursales();
    this.loadEncomiendas();
  }

  loadEnvios() {
    this.loading.set(true);
    this.enviosService.getAll().subscribe({
      next: (data) => {
        this.envios.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Error al cargar envíos');
        this.loading.set(false);
        this.autoClearMessage('error');
      }
    });
  }

  loadSucursales() {
    this.sucursalesService.getAll().subscribe({
      next: (data) => this.sucursales.set(data),
      error: () => {}
    });
  }

  loadEncomiendas() {
    this.encomiendasService.getAll().subscribe({
      next: (data) => this.encomiendas.set(data),
      error: () => {}
    });
  }

  openCreate() {
    this.resetCreateForm();
    this.showCreateModal.set(true);
  }

  openDetail(envio: any) {
    // Load full envio details
    if (envio.id) {
      this.enviosService.getById(envio.id).subscribe({
        next: (full) => {
          this.selectedEnvio.set(full);
          this.loadSeguimientos(full.id!);
          this.showDetailModal.set(true);
        },
        error: () => {
          // Fallback to the row data
          this.selectedEnvio.set(envio);
          this.loadSeguimientos(envio.id);
          this.showDetailModal.set(true);
        }
      });
    }
  }

  loadSeguimientos(envioId: number) {
    this.seguimientosService.getByEnvioId(envioId).subscribe({
      next: (data) => this.seguimientos.set(data),
      error: () => this.seguimientos.set([])
    });
  }

  save() {
    const payload: CreateEnvioPayload = {
      encomiendaId: this.formEncomiendaId(),
      sucursalOrigenId: this.formSucursalOrigenId(),
      sucursalDestinoId: this.formSucursalDestinoId(),
      fechaEnvio: this.formFechaEnvio(),
      fechaEstimada: this.formFechaEstimada(),
      costo: this.formCosto()
    };

    this.enviosService.create(payload).subscribe({
      next: () => {
        this.successMessage.set('Envío creado exitosamente');
        this.showCreateModal.set(false);
        this.loadEnvios();
        this.autoClearMessage('success');
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Error al crear envío');
        this.autoClearMessage('error');
      }
    });
  }

  deleteEnvio(envio: any) {
    if (!envio.id) return;
    this.enviosService.delete(envio.id).subscribe({
      next: () => {
        this.successMessage.set('Envío eliminado exitosamente');
        this.loadEnvios();
        this.autoClearMessage('success');
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Error al eliminar envío');
        this.autoClearMessage('error');
      }
    });
  }

  // Seguimiento modal
  openSeguimientoModal() {
    this.formUbicacion.set('');
    this.formEstadoId.set(2); // default to 'En tránsito'
    this.formObservaciones.set('');
    this.showSeguimientoModal.set(true);
  }

  saveSeguimiento() {
    const envio = this.selectedEnvio();
    if (!envio || !envio.id) return;

    const payload: CreateSeguimientoPayload = {
      envioId: envio.id,
      estadoId: this.formEstadoId(),
      ubicacion: this.formUbicacion(),
      observaciones: this.formObservaciones()
    };

    this.seguimientosService.create(payload).subscribe({
      next: () => {
        this.successMessage.set('Seguimiento registrado exitosamente');
        this.showSeguimientoModal.set(false);
        this.loadSeguimientos(envio.id!);
        this.loadEnvios(); // refresh estado in table
        this.autoClearMessage('success');
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Error al registrar seguimiento');
        this.autoClearMessage('error');
      }
    });
  }

  // Entrega modal
  openEntregaModal() {
    this.formNombreRecibe.set('');
    this.formCiRecibe.set('');
    this.formFirma.set('');
    this.showEntregaModal.set(true);
  }

  saveEntrega() {
    const envio = this.selectedEnvio();
    if (!envio || !envio.id) return;

    const payload: CreateEntregaPayload = {
      envioId: envio.id,
      nombreRecibe: this.formNombreRecibe(),
      ciRecibe: this.formCiRecibe(),
      firma: this.formFirma()
    };

    this.enviosService.registerEntrega(payload).subscribe({
      next: () => {
        this.successMessage.set('Entrega registrada exitosamente');
        this.showEntregaModal.set(false);
        // Update the selected envio's estado
        this.selectedEnvio.update(e => e ? { ...e, estadoId: 3, estado: { id: 3, nombre: 'Entregado' } } : null);
        this.loadSeguimientos(envio.id!);
        this.loadEnvios();
        this.autoClearMessage('success');
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Error al registrar entrega');
        this.autoClearMessage('error');
      }
    });
  }

  // Helpers
  getEstadoNombre(estadoId: number): string {
    return this.estados.find(e => e.id === estadoId)?.nombre || 'Desconocido';
  }

  getEstadoBadgeClass(estadoNombre: string): string {
    switch (estadoNombre) {
      case 'Registrado': return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'En tránsito': return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Entregado': return 'bg-green-500/15 text-green-300 border-green-500/30';
      default: return 'bg-dark-700 text-dark-300 border-white/10';
    }
  }

  getEstadoDotClass(estadoNombre: string): string {
    switch (estadoNombre) {
      case 'Registrado': return 'bg-blue-400';
      case 'En tránsito': return 'bg-amber-400';
      case 'Entregado': return 'bg-green-400';
      default: return 'bg-dark-500';
    }
  }

  getEstadoLineClass(estadoNombre: string): string {
    switch (estadoNombre) {
      case 'Registrado': return 'bg-blue-500/30';
      case 'En tránsito': return 'bg-amber-500/30';
      case 'Entregado': return 'bg-green-500/30';
      default: return 'bg-dark-700';
    }
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  closeDetailModal() {
    this.showDetailModal.set(false);
    this.selectedEnvio.set(null);
    this.seguimientos.set([]);
  }

  closeSeguimientoModal() {
    this.showSeguimientoModal.set(false);
  }

  closeEntregaModal() {
    this.showEntregaModal.set(false);
  }

  private resetCreateForm() {
    this.formEncomiendaId.set(0);
    this.formSucursalOrigenId.set(0);
    this.formSucursalDestinoId.set(0);
    this.formFechaEnvio.set('');
    this.formFechaEstimada.set('');
    this.formCosto.set(0);
  }

  private autoClearMessage(type: 'success' | 'error') {
    setTimeout(() => {
      if (type === 'success') this.successMessage.set('');
      else this.errorMessage.set('');
    }, 4000);
  }
}
