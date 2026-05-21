import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SucursalesService, Sucursal } from '../services/sucursales.service';
import { DataTableComponent } from '../components/data-table/data-table';
import { ModalComponent } from '../components/modal/modal';

@Component({
  selector: 'app-sucursales',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent, ModalComponent],
  templateUrl: './sucursales.html'
})
export class SucursalesComponent implements OnInit {
  private sucursalesService = inject(SucursalesService);

  sucursales = signal<Sucursal[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editingSucursal = signal<Sucursal | null>(null);
  saving = signal(false);

  successMessage = signal('');
  errorMessage = signal('');

  formNombre = signal('');
  formDireccion = signal('');
  formCiudad = signal('');
  formTelefono = signal('');

  tableColumns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'direccion', label: 'Dirección' },
    { key: 'ciudad', label: 'Ciudad' },
    { key: 'telefono', label: 'Teléfono' }
  ];

  get modalTitle(): string {
    return this.editingSucursal() ? 'Editar Sucursal' : 'Nueva Sucursal';
  }

  ngOnInit(): void {
    this.loadSucursales();
  }

  loadSucursales(): void {
    this.loading.set(true);
    this.sucursalesService.getAll().subscribe({
      next: (data) => {
        this.sucursales.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.showError('Error al cargar las sucursales');
        this.loading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this.editingSucursal.set(null);
    this.resetForm();
    this.showModal.set(true);
  }

  openEditModal(sucursal: Sucursal): void {
    this.editingSucursal.set(sucursal);
    this.formNombre.set(sucursal.nombre || '');
    this.formDireccion.set(sucursal.direccion || '');
    this.formCiudad.set(sucursal.ciudad || '');
    this.formTelefono.set(sucursal.telefono || '');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingSucursal.set(null);
    this.resetForm();
  }

  saveSucursal(): void {
    if (!this.formNombre() || !this.formDireccion()) {
      this.showError('Nombre y Dirección son obligatorios');
      return;
    }

    this.saving.set(true);

    const data: Sucursal = {
      nombre: this.formNombre().trim(),
      direccion: this.formDireccion().trim(),
      ciudad: this.formCiudad().trim(),
      telefono: this.formTelefono().trim()
    };

    const editing = this.editingSucursal();

    if (editing && editing.id) {
      this.sucursalesService.update(editing.id, data).subscribe({
        next: () => {
          this.showSuccess('Sucursal actualizada correctamente');
          this.closeModal();
          this.loadSucursales();
          this.saving.set(false);
        },
        error: () => {
          this.showError('Error al actualizar la sucursal');
          this.saving.set(false);
        }
      });
    } else {
      this.sucursalesService.create(data).subscribe({
        next: () => {
          this.showSuccess('Sucursal creada correctamente');
          this.closeModal();
          this.loadSucursales();
          this.saving.set(false);
        },
        error: () => {
          this.showError('Error al crear la sucursal');
          this.saving.set(false);
        }
      });
    }
  }

  deleteSucursal(sucursal: Sucursal): void {
    if (!confirm(`¿Estás seguro de eliminar ${sucursal.nombre}?`)) return;
    if (!sucursal.id) return;

    this.sucursalesService.delete(sucursal.id).subscribe({
      next: () => {
        this.showSuccess('Sucursal eliminada correctamente');
        this.loadSucursales();
      },
      error: () => {
        this.showError('Error al eliminar la sucursal');
      }
    });
  }

  private resetForm(): void {
    this.formNombre.set('');
    this.formDireccion.set('');
    this.formCiudad.set('');
    this.formTelefono.set('');
  }

  private showSuccess(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(''), 4000);
  }

  private showError(msg: string): void {
    this.errorMessage.set(msg);
    setTimeout(() => this.errorMessage.set(''), 4000);
  }
}
