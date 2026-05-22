import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientesService, Cliente, ContactoCliente } from '../services/clientes.service';
import { DataTableComponent } from '../components/data-table/data-table';
import { ModalComponent } from '../components/modal/modal';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent, ModalComponent],
  templateUrl: './clientes.html'
})
export class ClientesComponent implements OnInit {
  private clientesService = inject(ClientesService);

  // ── State Signals ──────────────────────────────────────
  clientes = signal<Cliente[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editingCliente = signal<Cliente | null>(null);
  saving = signal(false);

  // ── Contactos View ─────────────────────────────────────
  showContactosModal = signal(false);
  selectedCliente = signal<Cliente | null>(null);

  // ── Toast / Feedback Signals ───────────────────────────
  successMessage = signal('');
  errorMessage = signal('');

  // ── Form Signals ───────────────────────────────────────
  formNombre = signal('');
  formApellido = signal('');
  formCi = signal('');
  formTelefono = signal('');
  formEmail = signal('');
  formDireccion = signal('');
  formContactos = signal<ContactoCliente[]>([]);

  // ── Computed ───────────────────────────────────────────
  tableColumns = computed(() => [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'apellido', label: 'Apellido' },
    { key: 'ci', label: 'CI' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'email', label: 'Email' }
  ]);

  modalTitle = computed(() =>
    this.editingCliente() ? 'Editar Cliente' : 'Nuevo Cliente'
  );

  // ── Lifecycle ──────────────────────────────────────────
  ngOnInit(): void {
    this.loadClientes();
  }

  // ── Data Loading ───────────────────────────────────────
  loadClientes(): void {
    this.loading.set(true);
    this.clientesService.getAll().subscribe({
      next: (data) => {
        this.clientes.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.showError('Error al cargar los clientes');
        this.loading.set(false);
        console.error('loadClientes error:', err);
      }
    });
  }

  // ── Modal Operations ───────────────────────────────────
  openCreateModal(): void {
    this.editingCliente.set(null);
    this.resetForm();
    this.showModal.set(true);
  }

  openEditModal(cliente: Cliente): void {
    this.editingCliente.set(cliente);
    this.formNombre.set(cliente.nombre || '');
    this.formApellido.set(cliente.apellido || '');
    this.formCi.set(cliente.ci || '');
    this.formTelefono.set(cliente.telefono || '');
    this.formEmail.set(cliente.email || '');
    this.formDireccion.set(cliente.direccion || '');
    this.formContactos.set(
      cliente.contactos
        ? cliente.contactos.map(c => ({ ...c }))
        : []
    );
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingCliente.set(null);
    this.resetForm();
  }

  // ── CRUD Operations ────────────────────────────────────
  saveCliente(): void {
    if (!this.formNombre() || !this.formApellido() || !this.formCi()) {
      this.showError('Nombre, Apellido y CI son obligatorios');
      return;
    }

    this.saving.set(true);

    const clienteData: Cliente = {
      nombre: this.formNombre().trim(),
      apellido: this.formApellido().trim(),
      ci: this.formCi().trim(),
      telefono: this.formTelefono().trim(),
      email: this.formEmail().trim(),
      direccion: this.formDireccion().trim(),
      contactos: this.formContactos()
    };

    const editing = this.editingCliente();

    if (editing && editing.id) {
      this.clientesService.update(editing.id, clienteData).subscribe({
        next: () => {
          this.showSuccess('Cliente actualizado correctamente');
          this.closeModal();
          this.loadClientes();
          this.saving.set(false);
        },
        error: (err) => {
          this.showError('Error al actualizar el cliente');
          this.saving.set(false);
          console.error('update error:', err);
        }
      });
    } else {
      this.clientesService.create(clienteData).subscribe({
        next: () => {
          this.showSuccess('Cliente creado correctamente');
          this.closeModal();
          this.loadClientes();
          this.saving.set(false);
        },
        error: (err) => {
          this.showError('Error al crear el cliente');
          this.saving.set(false);
          console.error('create error:', err);
        }
      });
    }
  }

  deleteCliente(cliente: Cliente): void {
    if (!confirm(`¿Estás seguro de eliminar a ${cliente.nombre} ${cliente.apellido}?`)) {
      return;
    }

    if (!cliente.id) return;

    this.clientesService.delete(cliente.id).subscribe({
      next: () => {
        this.showSuccess('Cliente eliminado correctamente');
        this.loadClientes();
      },
      error: (err) => {
        this.showError('Error al eliminar el cliente');
        console.error('delete error:', err);
      }
    });
  }

  // ── View Contacts ──────────────────────────────────────
  viewContactos(cliente: Cliente): void {
    this.selectedCliente.set(cliente);
    this.showContactosModal.set(true);
  }

  closeContactosModal(): void {
    this.showContactosModal.set(false);
    this.selectedCliente.set(null);
  }

  // ── Dynamic Contacts ───────────────────────────────────
  addContacto(): void {
    this.formContactos.update(contactos => [
      ...contactos,
      { nombre: '', tipo: 'Emergencia', telefono: '' }
    ]);
  }

  removeContacto(index: number): void {
    this.formContactos.update(contactos =>
      contactos.filter((_, i) => i !== index)
    );
  }

  updateContacto(index: number, field: keyof ContactoCliente, value: string): void {
    this.formContactos.update(contactos =>
      contactos.map((c, i) => i === index ? { ...c, [field]: value } : c)
    );
  }

  // ── Form Helpers ───────────────────────────────────────
  private resetForm(): void {
    this.formNombre.set('');
    this.formApellido.set('');
    this.formCi.set('');
    this.formTelefono.set('');
    this.formEmail.set('');
    this.formDireccion.set('');
    this.formContactos.set([]);
  }

  // ── Toast / Feedback ───────────────────────────────────
  private showSuccess(message: string): void {
    this.successMessage.set(message);
    setTimeout(() => this.successMessage.set(''), 4000);
  }

  private showError(message: string): void {
    this.errorMessage.set(message);
    setTimeout(() => this.errorMessage.set(''), 4000);
  }
}
