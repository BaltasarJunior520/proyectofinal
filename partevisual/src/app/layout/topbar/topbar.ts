import { Component, inject, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.html'
})
export class TopbarComponent {
  authService = inject(AuthService);
  
  // Inputs & Outputs
  sidebarOpen = input<boolean>(true);
  toggleSidebar = output<void>();

  // Fullscreen state
  isFullscreen = false;

  triggerToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        this.isFullscreen = true;
      }).catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        this.isFullscreen = false;
      });
    }
  }

  onLogout(): void {
    this.authService.logout();
  }
}
