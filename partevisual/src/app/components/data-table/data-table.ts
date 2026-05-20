import { Component, input, output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  key: string;
  label: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-table.html',
})
export class DataTableComponent {
  columns = input.required<TableColumn[]>();
  rows = input.required<any[]>();
  loading = input<boolean>(false);
  searchable = input<boolean>(true);
  emptyMessage = input<string>('No se encontraron registros');

  rowClick = output<any>();
  editClick = output<any>();
  deleteClick = output<any>();

  searchTerm = signal('');

  filteredRows = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const allRows = this.rows();
    if (!term) return allRows;

    const cols = this.columns();
    return allRows.filter(row =>
      cols.some(col => {
        const value = row[col.key];
        return value != null && String(value).toLowerCase().includes(term);
      })
    );
  });

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }

  onEditClick(event: Event, row: any): void {
    event.stopPropagation();
    this.editClick.emit(row);
  }

  onDeleteClick(event: Event, row: any): void {
    event.stopPropagation();
    this.deleteClick.emit(row);
  }
}
