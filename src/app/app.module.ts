import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';
import { Http } from '@angular/http';
import { HttpClientModule,HttpClient } from '@angular/common/http';

//import { MaterialModule } from '@angular/material';
//import {MatSelectModule} from '@angular/material';
// import { TranslateModule, TranslateService, TranslateLoader, TranslateStaticLoader } from 'ng2-translate';
import {TranslateModule, TranslateLoader } from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
//**********DATEPICKER    ALERT!!!!! SUBSTITUIR POR CALENDARMODULE PRIMENG EN INFORMES */
    //import { DatePickerModule } from 'ng2-datepicker';
//**********REQUIRED FOR CALENDAR */
//import {CalendarComponent} from "angular2-fullcalendar/src/calendar/calendar";
import {MomentModule} from 'angular2-moment';

import { PdfViewerModule } from 'ng2-pdf-viewer';

//**********PRIME NG MODULES */
import {CalendarModule} from 'primeng/primeng';
import {ScheduleModule} from 'primeng/primeng';
import {DialogModule} from 'primeng/primeng';
import {LightboxModule} from 'primeng/primeng';
import {TreeModule,TreeNode} from 'primeng/primeng';
import {MultiSelectModule} from 'primeng/primeng';
import {DataTableModule,SharedModule} from 'primeng/primeng';
import {TableModule} from 'primeng/table';
import {DropdownModule} from 'primeng/primeng';
import {FieldsetModule} from 'primeng/primeng';
import {PanelModule} from 'primeng/primeng';
import {InputTextareaModule} from 'primeng/primeng';
import {DragDropModule} from 'primeng/primeng';
import {AccordionModule} from 'primeng/primeng';
import {SpinnerModule} from 'primeng/primeng';
import {GrowlModule} from 'primeng/primeng';
import {MessageService} from 'primeng/components/common/messageservice';
import {MessagesModule} from 'primeng/messages';
import {ChartModule} from 'primeng/chart';
import {MenuModule} from 'primeng/menu';
import {ContextMenuModule} from 'primeng/contextmenu';
import {PickListModule} from 'primeng/picklist';
import {MenuItem} from 'primeng/api';
import {TriStateCheckboxModule} from 'primeng/tristatecheckbox';
//import {ChartModule} from 'primeng/primeng';

//**********MY COMPONENTS */
import { AppComponent } from './components/app.component';
import { NavComponent } from './components/nav.component';
import { MenuComponent} from './components/menu.component';
import { RouterCanvasComponent} from './components/routerCanvas.component';
import { StartComponent } from './components/start.component';
import { EmpresasComponent } from './components/empresas/empresas.component';
import { OpcionesPremium } from './components/configuracion/empresasopcionespremium.component';
import { Opciones } from './components/configuracion/opciones';
import { SeleccionarEmpresaComponent } from './components/empresas/seleccionar-empresa.component';
import { ListadoEmpresasComponent } from './components/empresas/listado-empresas.component';
import { NuevaEmpresaComponent } from './components/empresas/nueva-empresa.component';
import { GestionTablasComponent } from './components/configuracion/gestion-tablas.component';
import { GestionInformesComponent } from './components/gestion-informes.component';
import { UsuariosComponent } from './components/configuracion/usuarios.component';
import { ControlesComponent } from './components/configuracion/controles.component';
import { ChecklistsComponent } from './components/configuracion/checklists.component';
import { ListadoChecklistsComponent } from './components/listado-checklists.component';
import { PermisosComponent } from './components/configuracion/permisos.component';
import { InformeControlesComponent } from './components/informe-controles.component';
import { InformeChecklistsComponent } from './components/informe-checklists.component';
import { InformePeriodicidadComponent } from './components/informe-periodicidad.component';

import { ModalComponent } from './components/modal.component';
import {PeriodicidadComponent} from './components/programadorfechas/periodicidad.component';
import {PeriodicidadNewComponent} from './components/programadorfechas/periodicidadNew.component';
import { PageNotFoundComponent } from './components/404.component';
/********    GENERAL COMPONENTS */
import { FilterDatesComponent } from './components/filterdates/filter-dates.component';
import { AlertasComponent} from './components/alertas/alertas.component';
import { BocadilloComponent} from './bocadillo/bocadillo.component';


/********    MAQUINARIA COMPONENTS */
import { MaquinariaComponent } from './components/maquinaria/maquinaria.component';
import { FichaMaquinaComponent } from './components/maquinaria/ficha-maquina.component';
import { ListadoMaquinasComponent } from './components/maquinaria/listado-maquinas.component';
import { CalendariosComponent } from './components/maquinaria/calendarios.component';
import { LubricantesComponent } from './components/maquinaria/lubricantes.component';
import { MantenimientosComponent } from './components/maquinaria/mantenimientos.component';
import { CalibracionesComponent } from './components/maquinaria/calibraciones.component';
import { MantenimientosRealizadosComponent } from './components/maquinaria/mantenimientos-realizados.component';
import { MantenimientosCorrectivosComponent } from './components/maquinaria/mantenimientos-correctivos.component';
import { PiezasComponent } from './components/maquinaria/piezas.component';

/********    LIMPIEZA COMPONENTS */
import { LimpiezaComponent } from './components/limpieza/limpieza.component';
import { ListadoLimpiezasComponent } from './components/limpieza/listado-limpieza.component';
import { ProductosLimpiezaComponent } from './components/limpieza/productos-limpieza.component';
import { ElementosLimpiezaComponent } from './components/limpieza/elementos-limpieza.component';
import { LimpiezasRealizadasComponent } from './components/limpieza/limpiezas-realizadas.component';
import { CalendariosLimpiezaComponent } from './components/limpieza/calendarios-limpieza.component';
import { ProtocoloComponent } from './components/limpieza/protocolo.component';
import { SelectProductosComponent } from './components/limpieza/select-productos.component';
/********     PROVEEDORES          */
import { ProveedoresComponent } from './components/proveedores/proveedores.component';
import { FichaProveedorComponent } from './components/proveedores/ficha-proveedor.component';
import { ListadoProveedoresComponent } from './components/proveedores/listado-proveedores.component';
import { ProductosProveedorComponent } from './components/proveedores/productos-proveedor.component';
import { EntradaProductosComponent } from './components/proveedores/entrada-productos.component';
import { FamiliasComponent } from './components/proveedores/familias-producto';
/********     CLIENTES          */
import { ClientesComponent } from './components/clientes/clientes.component';
import { FichaClienteComponent } from './components/clientes/ficha-cliente.component';
import { ListadoClientesComponent } from './components/clientes/listado-clientes.component';
import { EntregaProductosComponent } from './components/clientes/entrega-productos.component';
/********     PRODUCCION          */
import { ProduccionComponent } from './components/produccion/produccion.component';
import { ListadoOrdenesProduccionComponent } from './components/produccion/listado-ordenes-produccion.component';
import { FichaProduccionComponent } from './components/produccion/ficha-produccion.component';
import { MateriasPrimasComponent } from './components/produccion/materias-primas.component';
import { MovimientoComponent } from './components/produccion/movimiento.component';
import { ProductosPropiosComponent } from './components/produccion/productos-propios.component';
import { DistribucionComponent } from './components/produccion/distribucion.component';
import { AlmacenesComponent } from './components/produccion/almacenes.component';

import { TrazabilidadComponent } from './components/trazabilidad/trazabilidad.component';
import { AlergenosComponent } from './components/alergenos/alergenos.component';
/********     SERVICIOS          */
import { routing } from './app.routing';
import { Servidor } from './services/servidor.service';
import { EmpresasService } from './services/empresas.service';
import { PermisosService } from './services/permisos.service';
import { ZohoService } from './services/zoho.service';

import { InformesControlComponent } from './components/informes-control/informes-control.component';
import { MigraCheckListComponent } from './components/migra-check-list/migra-check-list.component';
import { PermisosLimpiezaComponent } from './components/limpieza/permisos-limpieza/permisos-limpieza.component';

/********     PLANIFICACIONES          */
import { PlanificacionesComponent } from './components/planificaciones/planificaciones.component';
import { CalendariosPlanificacionesComponent } from './components/planificaciones/calendarios-planificaciones.component';
import { PlanesComponent } from './components/planificaciones/planes/planes.component';
import { PlanesRealizadosComponent } from './components/planificaciones/planes-realizados/planes-realizados.component';
import { FamiliasPlanesComponent } from './components/planificaciones/familias/familias.component';
import { PlanesPermisosComponent } from './components/planificaciones/planes-permisos/planes-permisos.component';
import { PermisosGeneralComponent } from './components/permisos/permisos.component';
import { PlanRealizadoComponent } from './components/planificaciones/plan-realizado/plan-realizado.component';
import { SupervisoresComponent } from './components/supervisores/supervisores.component';
//import { BocadilloComponent } from './components/bocadillo/bocadillo.component';
import { ProductosCuadroComponent } from './components/limpieza/productos-cuadro/productos-cuadro.component';
import { ProtocolosComponent } from './components/limpieza/protocolos/protocolos.component';
import { ProtocolosCuadroComponent } from './components/limpieza/protocolos-cuadro/protocolos-cuadro.component';
import { ComponentsComponent } from './components/components.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UsoComponent } from './components/dashboard/uso/uso.component';
import { AlertasControlesComponent } from './components/dashboard/alertas/alertas.component';
import { DashrealizadosComponent } from './components/dashboard/dashrealizados/dashrealizados.component';
import { DashproduccionComponent } from './components/dashboard/dashproduccion/dashproduccion.component';
import { IncidenciasComponent } from './components/incidencias/incidencias.component';
import { BotonIncidenciaComponent } from './components/incidencias/boton-incidencia/boton-incidencia.component';
import { GestionIncidenciaComponent } from './components/incidencias/gestion-incidencia/gestion-incidencia.component';


import {OverlayModule} from '@angular/cdk/overlay';
import {MatIconModule } from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatCardModule} from '@angular/material/card';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
   // MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatTabsModule,
    MatTooltipModule,
    MatSortModule,
    MatPaginatorModule,
    MatBadgeModule,
    MAT_DATE_LOCALE
  } from '@angular/material';
import { NcSelectComponent } from './components/incidencias/nc-select/nc-select.component';
import { TablaIncidenciasComponent } from './components/incidencias/tabla-incidencias/tabla-incidencias.component';
import { CalendariosIncidenciasComponent } from './components/incidencias/calendarios-incidencias/calendarios-incidencias.component';
import { LoginComponent } from './components/login/login.component';
import { TrazabilidadAdComponent } from './components/trazabilidad-ad/trazabilidad-ad.component';
import { DashincidenciasComponent } from './components/dashboard/dashincidencias/dashincidencias.component';
import { HelpComponent } from './components/help/help.component';
import { ZohoComponent } from './components/zoho/zoho.component';
import { AdminIncidenciasClienteComponent } from './components/dashboard/admin-incidencias-cliente/admin-incidencias-cliente.component';
import { AdminControlesClienteComponent } from './components/dashboard/admin-controles-cliente/admin-controles-cliente.component';
import { AdminLoginsClienteComponent } from './components/dashboard/admin-logins-cliente/admin-logins-cliente.component';

import { DownloadInformeComponent } from './components/informes/download-informe/download-informe.component';
import { AlergenosTablaComponent } from './components/alergenos-tabla/alergenos-tabla.component';
import { VerDocsComponent } from './components/ver-docs/ver-docs.component';
import { TemplatesComponent } from './components/templates/templates.component';
import { RecetasComponent } from './components/produccion/recetas/recetas.component';
import { PreparaRecetaComponent } from './components/produccion/prepara-receta/prepara-receta.component';
import { TrazabilidadAtrasComponent } from './components/trazabilidad-atras/trazabilidad-atras.component';


@NgModule({
    exports: [
      // CDk
      OverlayModule,
      
      // Material
      MatAutocompleteModule,
      MatButtonModule,
      MatButtonToggleModule,
      MatCardModule,
      MatCheckboxModule,
      MatChipsModule,
      MatDatepickerModule,
      MatDialogModule,
      MatExpansionModule,
      MatGridListModule,
      MatIconModule,
      MatInputModule,
      MatListModule,
      MatMenuModule,
      MatProgressBarModule,
      MatProgressSpinnerModule,
      MatRadioModule,
      MatRippleModule,
      MatSelectModule,
      MatSidenavModule,
      MatSlideToggleModule,
      MatSliderModule,
      MatSnackBarModule,
      MatTabsModule,
      MatToolbarModule,
      MatTooltipModule,
      MatNativeDateModule,
      MatSortModule,
      MatPaginatorModule,
      MatBadgeModule
    ],
    declarations: []
  })
  export class PlunkerMaterialModule {}

// export function translateLoader(http: Http) { return new TranslateStaticLoader(http, './assets/i18n', '.json')}
export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
  }

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    PlunkerMaterialModule,
    FormsModule,
    HttpModule,
    HttpClientModule,
    JsonpModule,
    MomentModule,
    ScheduleModule,
    PdfViewerModule,
/**********PRIME NG MODULES */
    CalendarModule,
    DialogModule,
    LightboxModule,
    TreeModule,
    DataTableModule,
    TableModule,
    SharedModule,
    MultiSelectModule,
    DropdownModule,
    FieldsetModule,
    PanelModule,
    InputTextareaModule,
    DragDropModule,
    AccordionModule,
    SpinnerModule,
    GrowlModule,
    MessagesModule,
    ChartModule,
    MenuModule,
    ContextMenuModule,
    PickListModule,
    TriStateCheckboxModule,
/**********MATERIAL */
   // MaterialModule,
   // MatSelectModule,
   // DatePickerModule,
    // TranslateModule.forRoot({
    //   provide: TranslateLoader,
    //   useFactory: translateLoader,
    //   deps: [Http]
    // }),
    TranslateModule.forRoot({
        loader: {
            provide: TranslateLoader,
            useFactory: createTranslateLoader,
            deps: [HttpClient]
        }
    }),
    routing
  ],
  declarations: [
    AppComponent,
    //CalendarComponent,
    NavComponent,
    MenuComponent,
    RouterCanvasComponent,
    StartComponent,
    LoginComponent,
    EmpresasComponent,
    OpcionesPremium,
    Opciones,
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
//******GENERALES */
    AlergenosComponent,
    AlergenosTablaComponent,
    FilterDatesComponent,
    AlertasComponent,
    BocadilloComponent,
    HelpComponent,
    ZohoComponent,
    DownloadInformeComponent,
    VerDocsComponent,
    TemplatesComponent,
//******MAQUINARIA */
    MaquinariaComponent,
    FichaMaquinaComponent,
    ListadoMaquinasComponent,
    CalendariosComponent,
    LubricantesComponent,
    MantenimientosComponent,
    MantenimientosCorrectivosComponent,
    MantenimientosRealizadosComponent,
    CalibracionesComponent,
    PiezasComponent,
//******LIMPIEZAS */
    LimpiezaComponent,
    ListadoLimpiezasComponent,
    ProductosLimpiezaComponent,
    ElementosLimpiezaComponent,
    LimpiezasRealizadasComponent,
    CalendariosLimpiezaComponent,
    ProtocoloComponent,
    SelectProductosComponent,
//******PROVEEDORES */
    ProveedoresComponent,
    FichaProveedorComponent,
    ListadoProveedoresComponent,
    ProductosProveedorComponent,
    EntradaProductosComponent,
    FamiliasComponent,
//******CLIENTES */
    ClientesComponent,
    FichaClienteComponent,
    ListadoClientesComponent,
    EntregaProductosComponent,
//******PRODUCCION */
    ProduccionComponent,
    ListadoOrdenesProduccionComponent,
    FichaProduccionComponent,
    MateriasPrimasComponent,
    MovimientoComponent,
    ProductosPropiosComponent,
    DistribucionComponent,  
    AlmacenesComponent,
    TrazabilidadComponent,
    TrazabilidadAdComponent,
    TrazabilidadAtrasComponent,
    RecetasComponent,
    PreparaRecetaComponent,
//*******COMUNES     */
    ModalComponent,
    PeriodicidadComponent,
    PeriodicidadNewComponent,
    PageNotFoundComponent,
    InformesControlComponent,
    MigraCheckListComponent,
    PermisosLimpiezaComponent,
    PlanificacionesComponent,
    CalendariosPlanificacionesComponent,
    PlanesComponent,
    PlanesRealizadosComponent,
    FamiliasPlanesComponent,
    PlanesPermisosComponent,
    PermisosGeneralComponent,
    PlanRealizadoComponent,
    SupervisoresComponent,
    ProductosCuadroComponent,
    ProtocolosComponent,
    ProtocolosCuadroComponent,
    ComponentsComponent,
//*******DASHBOARDS     */
    DashboardComponent,
    UsoComponent,
    AlertasControlesComponent,
    DashrealizadosComponent,
    DashproduccionComponent,
    DashincidenciasComponent,
    AdminIncidenciasClienteComponent, 
    AdminControlesClienteComponent, 
    AdminLoginsClienteComponent,
//*******INCIDENCIAS     */
    IncidenciasComponent,
    TablaIncidenciasComponent,
    BotonIncidenciaComponent,
    GestionIncidenciaComponent,
    CalendariosIncidenciasComponent,
    NcSelectComponent
  ],
  providers: [
    EmpresasService,
    Servidor,
    PermisosService,
    MessageService,
    ZohoService,
    {provide: MAT_DATE_LOCALE, useValue: 'es-ES'}
  ],
  
  bootstrap: [AppComponent],
})

export class AppModule {}