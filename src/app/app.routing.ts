import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StartComponent } from './components/start.component';
import { LoginComponent } from './components/login/login.component';
import { ZohoComponent } from './components/zoho/zoho.component';
import { EmpresasComponent } from './components/empresas.component';
import { PageNotFoundComponent } from './components/404.component';

const appRoutes: Routes = [
  {path: '', component: StartComponent},
  {path: 'login2', component: LoginComponent},
  {path: 'login', component: StartComponent},
  {path: 'login/:token', component: StartComponent},
  {path: 'empresas', component: EmpresasComponent},
  {path: 'empresas/:modulo/:idOrigenasociado/:id', component: EmpresasComponent},
  {path: 'empresas/:empresa/:modulo/:idOrigenasociado/:id', component: EmpresasComponent},
  {path: 'zoho/:code', component: ZohoComponent},
  {path: 'zoho', component: ZohoComponent},
  {path: '404', component: PageNotFoundComponent},
  {path: '**', redirectTo: '404'}
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes,{ enableTracing: false,useHash: true });
