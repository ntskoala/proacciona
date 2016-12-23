import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './components/login.component';
import { EmpresaComponent } from './components/empresa.component';
import { EmpresasComponent } from './components/empresas.component';
import { PageNotFoundComponent } from './components/404.component';

const appRoutes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'empresas', component: EmpresasComponent},
  {path: 'empresa/:idEmpresa', component: EmpresaComponent},
  {path: '404', component: PageNotFoundComponent},
  {path: '**', redirectTo: '404'}
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
