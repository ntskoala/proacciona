//let server = 'https://tfc.proacciona.es/'; //prod
//let server = 'http://tfc.ntskoala.com/';//DESARROLLO

import { server } from 'environments/environment';
let base = server + 'api/';

export const URLS = {
  SERVER: server,
  LOGIN: base + 'actions/login.php',
  EMPRESAS: base + 'empresas.php',
  OPCIONES: base + 'opciones.php',
  OPCIONES_EMPRESA: base + 'opcionesempresa.php',
  USUARIOS: base + 'usuarios.php',
  CONTROLES: base + 'controles.php',
  CHECKLISTS: base + 'checklist.php',
  CONTROLCHECKLISTS: base + 'controlchecklist.php',
  PERMISSION_USER_CONTROL: base + 'permissionusercontrol.php',
  PERMISSION_USER_CHECKLIST: base + 'permissionuserchecklist.php',
  PERMISSION_USER_LIMPIEZA: base + 'permissionuserlimpieza.php',
  RESULTADOS_CONTROL: base + 'resultadoscontrol.php',
  RESULTADOS_CHECKLIST: base + 'resultadoschecklist.php',
  RESUMEN_ACCIONES_LOGS: base + 'resumen_acciones_logs.php',
  PERIODICIDAD_CONTROL: base + 'periodicidadcontrol.php',
  PERIODICIDAD_CHECKLIST: base + 'periodicidadchecklist.php',
  MAQUINAS: base +'maquinaria.php',
  CALENDARIOS: base + 'calendarios.php',
  CALENDARIOSLIMPIEZA: base + 'calendarios-limpieza.php',
  MANTENIMIENTOS: base + 'mantenimientos.php',
  CALIBRACIONES: base+ 'calibraciones.php',
  MANTENIMIENTOS_REALIZADOS: base + 'mantenimientosrealizados.php',
  LUBRICANTES: base + 'lubricantes.php',
  PIEZAS: base + 'piezas.php',
  UPLOAD_DOCS: base + 'uploads.php',
  STD_ITEM: base + 'std_item.php',
  STD_SUBITEM: base + 'std_subitem.php',
  DASHCONTROLES: base + 'dashControles.php',
  ALERTES: base + 'alertes.php',
  GETDASHBOARDADMIN: base + 'views/getDashboardAdmin.php',
  //***********ZOHO API    */
  GET_ZOHO_TOKEN: base + 'zoho.php',
  SET_ZOHO_TICKET: base + 'zoho2.php',
  SET_TICKET: 'https://desk.zoho.com/api/v1/tickets',
  //**********TRAZABILIDAD */
  TRAZA_ORDENES:  base + 'traza_ordenes.php',
  TRAZA_ATRAS:  base + 'traza_atras.php',
  TRAZA_ADELANTE:  base + 'traza_adelante.php',
  UPDATE_REMANENTE: base+ 'update_remanente.php',

  UPLOAD_LOGO: base + 'logoempresa.php',
  FOTOS: server +'controles/',
  LOGOS: server + 'logos/',
  DOCS: server + 'docs/'
}
let calendar;
if (localStorage.getItem("idioma")=='es'){
 calendar={
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
  'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: [ "Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic" ],              
dayNames: ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'],
dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
dayNamesMin: ["Do","Lu","Ma","Mi","Ju","Vi","Sa"],
firstDayOfWeek: 1
}
}
if (localStorage.getItem("idioma")=='cat'){
  calendar={
   monthNames: ['Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny', 'Juliol',
   'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'],
   monthNamesShort: [ "Gen","Feb","Mar","Abr","Mai","Jun","Jul","Ago","Set","Oct","Nov","Dec" ],              
 dayNames: ['Diumenge','Dilluns','Dimarts','Dimecres','Dijous','Divendres','Disabte'],
 dayNamesShort: ['Dg', 'Dl', 'Dm', 'Dc', 'Dj', 'Dv', 'Ds'],
 dayNamesMin: ['Dg', 'Dl', 'Dm', 'Dc', 'Dj', 'Dv', 'Ds'],
 firstDayOfWeek: 1
 }
}
export const cal = calendar;