import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.html',
})
export class ModalComponent {
  isOpen = input<boolean>(false);
  title = input<string>('');
  size = input<'sm' | 'md' | 'lg' | 'xl'>('md');

  closeModal = output<void>();

  sizeClass = computed(() => {
    const sizeMap: Record<string, string> = {
      sm: 'max-w-md',
      md: 'max-w-xl',
      lg: 'max-w-3xl',
      xl: 'max-w-5xl',
    };
    return sizeMap[this.size()] || 'max-w-xl';
  });

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal.emit();
    }
  }
}
