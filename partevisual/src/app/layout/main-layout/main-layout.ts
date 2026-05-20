import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar';
import { TopbarComponent } from '../topbar/topbar';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent],
  templateUrl: './main-layout.html'
})
export class MainLayoutComponent {
  // Signal to control sidebar visibility dynamically
  sidebarOpen = signal<boolean>(true);

  toggleSidebar(): void {
    this.sidebarOpen.update(open => !open);
  }
}
