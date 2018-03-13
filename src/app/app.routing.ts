import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StartComponent } from './components/start.component';
import { LoginComponent } from './components/login/login.component';
import { EmpresasComponent } from './components/empresas.component';
import { PageNotFoundComponent } from './components/404.component';

const appRoutes: Routes = [
  {path: '', component: StartComponent},
  {path: 'login2', component: LoginComponent},
  {path: 'login', component: StartComponent},
  {path: 'empresas', component: EmpresasComponent},
  {path: 'empresas/:modulo/:idOrigenasociado/:id', component: EmpresasComponent},
  {path: '404', component: PageNotFoundComponent},
  {path: '**', redirectTo: '404'}
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
