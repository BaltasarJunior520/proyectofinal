import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EncomiendasService, Encomienda, CreateEncomiendaPayload, TipoPaquete, DetalleEncomienda, Seguro } from '../services/encomiendas.service';
import { ClientesService, Cliente } from '../services/clientes.service';
import { DataTableComponent } from '../components/data-table/data-table';
import { ModalComponent } from '../components/modal/modal';

@Component({
  selector: 'app-encomiendas',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent, ModalComponent],
  templateUrl: './encomiendas.html'
})
export class EncomiendasComponent implements OnInit {
  private encomiendasService = inject(EncomiendasService);
  private clientesService = inject(ClientesService);

  // Data signals
  encomiendas = signal<Encomienda[]>([]);
  clientes = signal<Cliente[]>([]);
  loading = signal(false);
  showModal = signal(false);
  editingEncomienda = signal<Encomienda | null>(null);
  errorMessage = signal('');
  successMessage = signal('');

  // Form signals
  formCodigo = signal('');
  formRemitenteId = signal<number>(0);
  formDestinatarioId = signal<number>(0);
  formDescripcion = signal('');
  formPeso = signal<number>(0);
  formVolumen = signal<number>(0);
  formValorDeclarado = signal<number>(0);

  // Detalles array
  formDetalles = signal<{ tipoId: number; cantidad: number; observaciones: string }[]>([]);

  // Seguro signals
  formSeguroMonto = signal<number>(0);
  formSeguroDescripcion = signal('');
  formIncluirSeguro = signal(false);

  // Hardcoded tipos de paquete
  tiposPaquete: TipoPaquete[] = [
    { id: 1, nombre: 'Caja', descripcion: 'Caja' },
    { id: 2, nombre: 'Sobre', descripcion: 'Sobre' },
    { id: 3, nombre: 'Paquete', descripcion: 'Paquete' }
  ];

  // Table columns
  tableColumns = [
    { key: 'id', label: 'ID' },
    { key: 'codigo', label: 'Código' },
    { key: 'remitenteNombre', label: 'Remitente' },
    { key: 'destinatarioNombre', label: 'Destinatario' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'peso', label: 'Peso (kg)' },
    { key: 'valorDeclarado', label: 'Valor Declarado' }
  ];

  // Flatten rows for data table (computed)
  tableRows = computed(() => {
    return this.encomiendas().map(enc => ({
      ...enc,
      remitenteNombre: enc.remitente
        ? `${enc.remitente.nombre} ${enc.remitente.apellido}`
        : '—',
      destinatarioNombre: enc.destinatario
        ? `${enc.destinatario.nombre} ${enc.destinatario.apellido}`
        : '—'
    }));
  });

  // Modal title computed
  modalTitle = computed(() =>
    this.editingEncomienda() ? 'Editar Encomienda' : 'Nueva Encomienda'
  );

  ngOnInit() {
    this.loadEncomiendas();
    this.loadClientes();
  }

  loadEncomiendas() {
    this.loading.set(true);
    this.encomiendasService.getAll().subscribe({
      next: (data) => {
        this.encomiendas.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Error al cargar encomiendas');
        this.loading.set(false);
        this.autoClearMessage('error');
      }
    });
  }

  loadClientes() {
    this.clientesService.getAll().subscribe({
      next: (data) => this.clientes.set(data),
      error: () => {}
    });
  }

  openCreate() {
    this.editingEncomienda.set(null);
    this.resetForm();
    this.showModal.set(true);
  }

  openEdit(enc: any) {
    this.editingEncomienda.set(enc);
    this.formCodigo.set(enc.codigo || '');
    this.formRemitenteId.set(enc.remitenteId || 0);
    this.formDestinatarioId.set(enc.destinatarioId || 0);
    this.formDescripcion.set(enc.descripcion || '');
    this.formPeso.set(enc.peso || 0);
    this.formVolumen.set(enc.volumen || 0);
    this.formValorDeclarado.set(enc.valorDeclarado || 0);

    // Populate detalles
    if (enc.detalles && enc.detalles.length > 0) {
      this.formDetalles.set(enc.detalles.map((d: any) => ({
        tipoId: d.tipoId || d.tipoPaquete?.id || 1,
        cantidad: d.cantidad || 1,
        observaciones: d.observaciones || ''
      })));
    } else {
      this.formDetalles.set([]);
    }

    // Populate seguro
    if (enc.seguro) {
      this.formIncluirSeguro.set(true);
      this.formSeguroMonto.set(enc.seguro.monto || 0);
      this.formSeguroDescripcion.set(enc.seguro.descripcion || '');
    } else {
      this.formIncluirSeguro.set(false);
      this.formSeguroMonto.set(0);
      this.formSeguroDescripcion.set('');
    }

    this.showModal.set(true);
  }

  save() {
    const payload: CreateEncomiendaPayload = {
      codigo: this.formCodigo(),
      remitenteId: this.formRemitenteId(),
      destinatarioId: this.formDestinatarioId(),
      descripcion: this.formDescripcion(),
      peso: this.formPeso(),
      volumen: this.formVolumen(),
      valorDeclarado: this.formValorDeclarado(),
      detalles: this.formDetalles()
    };

    if (this.formIncluirSeguro()) {
      payload.seguro = {
        monto: this.formSeguroMonto(),
        descripcion: this.formSeguroDescripcion()
      };
    }

    const editing = this.editingEncomienda();

    if (editing && editing.id) {
      this.encomiendasService.update(editing.id, payload as any).subscribe({
        next: () => {
          this.successMessage.set('Encomienda actualizada exitosamente');
          this.showModal.set(false);
          this.loadEncomiendas();
          this.autoClearMessage('success');
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Error al actualizar encomienda');
          this.autoClearMessage('error');
        }
      });
    } else {
      this.encomiendasService.create(payload).subscribe({
        next: () => {
          this.successMessage.set('Encomienda creada exitosamente');
          this.showModal.set(false);
          this.loadEncomiendas();
          this.autoClearMessage('success');
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Error al crear encomienda');
          this.autoClearMessage('error');
        }
      });
    }
  }

  deleteEnc(enc: any) {
    if (!enc.id) return;
    this.encomiendasService.delete(enc.id).subscribe({
      next: () => {
        this.successMessage.set('Encomienda eliminada exitosamente');
        this.loadEncomiendas();
        this.autoClearMessage('success');
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Error al eliminar encomienda');
        this.autoClearMessage('error');
      }
    });
  }

  addDetalle() {
    this.formDetalles.update(d => [...d, { tipoId: 1, cantidad: 1, observaciones: '' }]);
  }

  removeDetalle(index: number) {
    this.formDetalles.update(d => d.filter((_, i) => i !== index));
  }

  closeModal() {
    this.showModal.set(false);
  }

  private resetForm() {
    this.formCodigo.set('');
    this.formRemitenteId.set(0);
    this.formDestinatarioId.set(0);
    this.formDescripcion.set('');
    this.formPeso.set(0);
    this.formVolumen.set(0);
    this.formValorDeclarado.set(0);
    this.formDetalles.set([]);
    this.formIncluirSeguro.set(false);
    this.formSeguroMonto.set(0);
    this.formSeguroDescripcion.set('');
  }

  private autoClearMessage(type: 'success' | 'error') {
    setTimeout(() => {
      if (type === 'success') this.successMessage.set('');
      else this.errorMessage.set('');
    }, 4000);
  }
}
