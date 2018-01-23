import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';
import { Http } from '@angular/http';

import { MaterialModule } from '@angular/material';
//import {MdSelectModule} from '@angular/material';
import { TranslateModule, TranslateService, TranslateLoader, TranslateStaticLoader } from 'ng2-translate';
//**********DATEPICKER    ALERT!!!!! SUBSTITUIR POR CALENDARMODULE PRIMENG EN INFORMES */
import { DatePickerModule } from 'ng2-datepicker';
//**********REQUIRED FOR CALENDAR */
//import {CalendarComponent} from "angular2-fullcalendar/src/calendar/calendar";
import {MomentModule} from 'angular2-moment';
//**********PRIME NG MODULES */
import {CalendarModule} from 'primeng/primeng';
import {ScheduleModule} from 'primeng/primeng';
import {DialogModule} from 'primeng/primeng';
import {LightboxModule} from 'primeng/primeng';
import {TreeModule,TreeNode} from 'primeng/primeng';
import {MultiSelectModule} from 'primeng/primeng';
import {DataTableModule,SharedModule} from 'primeng/primeng';
import {DropdownModule} from 'primeng/primeng';
import {FieldsetModule} from 'primeng/primeng';
import {PanelModule} from 'primeng/primeng';
import {InputTextareaModule} from 'primeng/primeng';
import {DragDropModule} from 'primeng/primeng';
import {AccordionModule} from 'primeng/primeng';
import {SpinnerModule} from 'primeng/primeng';
import {GrowlModule} from 'primeng/primeng';
import {MessageService} from 'primeng/components/common/messageservice';
import {ChartModule} from 'primeng/primeng';

//**********MY COMPONENTS */
import { AppComponent } from './components/app.component';
import { NavComponent } from './components/nav.component';
import { MenuComponent} from './components/menu.component';

import { LoginComponent } from './components/login.component';
import { EmpresasComponent } from './components/empresas.component';
import { OpcionesPremium } from './components/configuracion/empresasopcionespremium.component';
import { Opciones } from './components/configuracion/opciones';
import { SeleccionarEmpresaComponent } from './components/seleccionar-empresa.component';
import { ListadoEmpresasComponent } from './components/listado-empresas.component';
import { NuevaEmpresaComponent } from './components/nueva-empresa.component';
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
import { PageNotFoundComponent } from './components/404.component';
/********    GENERAL COMPONENTS */
import { FilterDatesComponent } from './components/filterdates/filter-dates.component';
import { AlertasComponent} from './components/alertas/alertas.component';

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
import { BocadilloComponent } from './components/bocadillo/bocadillo.component';
import { ProductosCuadroComponent } from './components/limpieza/productos-cuadro/productos-cuadro.component';
import { ProtocolosComponent } from './components/limpieza/protocolos/protocolos.component';
import { ProtocolosCuadroComponent } from './components/limpieza/protocolos-cuadro/protocolos-cuadro.component';
import { ComponentsComponent } from './components/components.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UsoComponent } from './components/dashboard/uso/uso.component';
import { AlertasControlesComponent } from './components/dashboard/alertas/alertas.component';
import { DashrealizadosComponent } from './components/dashboard/dashrealizados/dashrealizados.component';
import { DashproduccionComponent } from './components/dashboard/dashproduccion/dashproduccion.component';




export function translateLoader(http: Http) { return new TranslateStaticLoader(http, './assets/i18n', '.json')}


@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    JsonpModule,
    MomentModule,
    ScheduleModule,
/**********PRIME NG MODULES */
    CalendarModule,
    DialogModule,
    LightboxModule,
    TreeModule,
    DataTableModule,
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
    ChartModule,
/**********MATERIAL */
    MaterialModule,
   // MdSelectModule,
    DatePickerModule,
    TranslateModule.forRoot({
      provide: TranslateLoader,
      //useFactory: (http: Http) => new TranslateStaticLoader(http, '/app/assets/i18n', '.json'),
      // useFactory: (http: Http) => new TranslateStaticLoader(http, '/app/assets/i18n', '.json'),
//    TranslateService, { provide: TranslateLoader, useFactory: TranslateLoader, deps: [Http] },
      useFactory: translateLoader,
      deps: [Http]
    }),
    routing
  ],
  declarations: [
    AppComponent,
    //CalendarComponent,
    NavComponent,
    MenuComponent,
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
    FilterDatesComponent,
    AlertasComponent,
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
    AlergenosComponent,
//*******COMUNES     */
    ModalComponent,
    PeriodicidadComponent,
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
    BocadilloComponent,
    ProductosCuadroComponent,
    ProtocolosComponent,
    ProtocolosCuadroComponent,
    ComponentsComponent,
    DashboardComponent,
    UsoComponent,
    AlertasControlesComponent,
    DashrealizadosComponent,
    DashproduccionComponent
  ],
  providers: [
    EmpresasService,
    Servidor,
    PermisosService,
    MessageService
  ],
  
  bootstrap: [AppComponent],
})

export class AppModule {}