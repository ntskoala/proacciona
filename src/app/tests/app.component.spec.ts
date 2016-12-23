/* tslint:disable:no-unused-variable */
import { Component } from '@angular/core';
import { TestBed, async, inject} from '@angular/core/testing';
import {APP_BASE_HREF} from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';


import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';
import { MaterialModule } from '@angular/material';
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from 'ng2-translate';
import { DatePickerModule } from 'ng2-datepicker';
import { Http } from '@angular/http';

import { AppComponent } from '../components/app.component';
import { NavComponent } from '../components/nav.component';
import { LoginComponent } from '../components/login.component';
import { EmpresaComponent } from '../components/empresa.component';
import { EmpresasComponent } from '../components/empresas.component';
import { SeleccionarEmpresaComponent } from '../components/seleccionar-empresa.component';
import { ListadoEmpresasComponent } from '../components/listado-empresas.component';
import { NuevaEmpresaComponent } from '../components/nueva-empresa.component';
import { GestionTablasComponent } from '../components/gestion-tablas.component';
import { GestionInformesComponent } from '../components/gestion-informes.component';
import { UsuariosComponent } from '../components/usuarios.component';
import { ControlesComponent } from '../components/controles.component';
import { ChecklistsComponent } from '../components/checklists.component';
import { ListadoChecklistsComponent } from '../components/listado-checklists.component';
import { PermisosComponent } from '../components/permisos.component';
import { InformeControlesComponent } from '../components/informe-controles.component';
import { InformeChecklistsComponent } from '../components/informe-checklists.component';
import { InformePeriodicidadComponent } from '../components/informe-periodicidad.component';
import { ModalComponent } from '../components/modal.component';
import { PageNotFoundComponent } from '../components/404.component';

import { routing } from '../app.routing';
import { Servidor } from '../services/servidor.service';
import { EmpresasService } from '../services/empresas.service';

import '../assets/i18n/cat.json';
import '../assets/i18n/es.json';
export function createTranslateLoader(http: Http) {
    return new TranslateStaticLoader(http, './app/assets/i18n', '.json');
}

describe('App: Proacciona general Tests', () => {
  let location, router;
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
    AppComponent,
    NavComponent,
    LoginComponent,
    EmpresaComponent,
    EmpresasComponent,
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
      imports: [
      RouterTestingModule.withRoutes([
      { path: 'home', component: EmpresasComponent }
    ]),
        BrowserModule,
    FormsModule,
    HttpModule,
    JsonpModule,
    MaterialModule.forRoot(),
    DatePickerModule,
    // TranslateModule.forRoot({
    //   provide: TranslateLoader,
    //   //useFactory: (http: Http) => new TranslateStaticLoader(http, '/app/assets/i18n', '.json'),
    //   useFactory: (http: Http) => new TranslateStaticLoader(http, '/assets/i18n', '.json'),
    //   deps: [Http]
    // }),
            TranslateModule.forRoot({
            provide: TranslateLoader,
            useFactory: (createTranslateLoader),
            deps: [Http]
        }),
    routing
  ],
  providers: [{provide: APP_BASE_HREF, useValue : '/' },
      Servidor,
    EmpresasService
    ]

    });
  });
  // beforeEach(inject([Router, Location], (_router: Router, _location: Location) => {
  //   location = _location;
  //   router = _router;
  // }));


it('true is true', () => expect(true).toBe(true));
  it('should create the Component', () => {
    console.log('app is truthy')
    expect(AppComponent).toBeTruthy();
  });
  // it('should go to Login Page', async(() => {
  //   let fixture = TestBed.createComponent(AppComponent);
  //   fixture.detectChanges();
  //   console.log(location.path());
  //   //router.navigate(['/login']).then(() => {
  //   //  expect(location.path()).toBe('/login');
  //     console.log('after expect');
  //   //});
  // }));

  it('should create the app', async(() => {
    let fixture = TestBed.createComponent(AppComponent);
    let app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  // it(`should have as title 'app works!'`, async(() => {
  //   let fixture = TestBed.createComponent(AppComponent);
  //   let app = fixture.debugElement.componentInstance;
  //   expect(app.title).toEqual('app works!');
  // }));

  // it('should render title in a h1 tag', async(() => {
  //   let fixture = TestBed.createComponent(AppComponent);
  //   fixture.detectChanges();
  //   let compiled = fixture.debugElement.nativeElement;
  //   expect(compiled.querySelector('h1').textContent).toContain('app works!');
  // }));
});
