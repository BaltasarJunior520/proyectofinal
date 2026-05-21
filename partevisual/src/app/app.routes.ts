import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { LoginComponent } from './login/login';
import { MainLayoutComponent } from './layout/main-layout/main-layout';
import { DashboardComponent } from './dashboard/dashboard';
import { ClientesComponent } from './clientes/clientes';
import { EncomiendasComponent } from './encomiendas/encomiendas';
import { EnviosComponent } from './envios/envios';
import { FinanzasComponent } from './finanzas/finanzas';
import { SucursalesComponent } from './sucursales/sucursales';

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
        component: SucursalesComponent
      },
      {
        path: 'encomiendas',
        component: EncomiendasComponent
      },
      {
        path: 'envios',
        component: EnviosComponent
      },
      {
        path: 'finanzas',
        component: FinanzasComponent
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
