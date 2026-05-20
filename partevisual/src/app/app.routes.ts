import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { LoginComponent } from './login/login';
import { MainLayoutComponent } from './layout/main-layout/main-layout';
import { DashboardComponent } from './dashboard/dashboard';
import { ClientesComponent } from './clientes/clientes';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'clientes',
        component: ClientesComponent
      },
      {
        path: 'sucursales',
        component: DashboardComponent // Temporary mapping until Phase 7
      },
      {
        path: 'encomiendas',
        component: DashboardComponent // Temporary mapping until Phase 7
      },
      {
        path: 'envios',
        component: DashboardComponent // Temporary mapping until Phase 7
      },
      {
        path: 'finanzas',
        component: DashboardComponent // Temporary mapping until Phase 7
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
