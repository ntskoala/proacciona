import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';
import { MaterialModule } from '@angular/material';
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from 'ng2-translate';
import { DatePickerModule } from 'ng2-datepicker';
import { Http } from '@angular/http';

import { AppComponent } from './components/app.component';
import { NavComponent } from './components/nav.component';
import { LoginComponent } from './components/login.component';
import { EmpresaComponent } from './components/empresa.component';
import { EmpresasComponent } from './components/empresas.component';
import { OpcionesPremium } from './components/empresasopcionespremium.component';
import { SeleccionarEmpresaComponent } from './components/seleccionar-empresa.component';
import { ListadoEmpresasComponent } from './components/listado-empresas.component';
import { NuevaEmpresaComponent } from './components/nueva-empresa.component';
import { GestionTablasComponent } from './components/gestion-tablas.component';
import { GestionInformesComponent } from './components/gestion-informes.component';
import { UsuariosComponent } from './components/usuarios.component';
import { ControlesComponent } from './components/controles.component';
import { ChecklistsComponent } from './components/checklists.component';
import { ListadoChecklistsComponent } from './components/listado-checklists.component';
import { PermisosComponent } from './components/permisos.component';
import { InformeControlesComponent } from './components/informe-controles.component';
import { InformeChecklistsComponent } from './components/informe-checklists.component';
import { InformePeriodicidadComponent } from './components/informe-periodicidad.component';
import { ModalComponent } from './components/modal.component';
import { PageNotFoundComponent } from './components/404.component';

import { routing } from './app.routing';
import { Servidor } from './services/servidor.service';
import { EmpresasService } from './services/empresas.service';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    JsonpModule,
    MaterialModule.forRoot(),
    DatePickerModule,
    TranslateModule.forRoot({
      provide: TranslateLoader,
      //useFactory: (http: Http) => new TranslateStaticLoader(http, '/app/assets/i18n', '.json'),
       useFactory: (http: Http) => new TranslateStaticLoader(http, '/assets/i18n', '.json'),
      deps: [Http]
    }),
    routing
  ],
  declarations: [
    AppComponent,
    NavComponent,
    LoginComponent,
    EmpresaComponent,
    EmpresasComponent,
    OpcionesPremium,
    SeleccionarEmpresaComponent,
    ListadoEmpresasComponent,
    NuevaEmpresaComponent,
    GestionTablasComponent,
    GestionInformesComponent,
    UsuariosComponent,
    ControlesComponent,
    ChecklistsComponent,
    ListadoChecklistsComponent,
    PermisosComponent,
    InformeControlesComponent,
    InformeChecklistsComponent,
    InformePeriodicidadComponent,
    ModalComponent,
    PageNotFoundComponent
  ],
  providers: [
    Servidor,
    EmpresasService
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
