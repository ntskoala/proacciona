//let server = 'https://tfc.proacciona.es/'; //prod
let server = 'http://tfc.ntskoala.com/';//DESARROLLO
let base = server + 'api/';

export const URLS = {
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
  //**********TRAZABILIDAD */
  TRAZA_ORDENES:  base + 'traza_ordenes.php',
  TRAZA_ATRAS:  base + 'traza_atras.php',
  UPDATE_REMANENTE: base+ 'update_remanente.php',

  UPLOAD_LOGO: base + 'logoempresa.php',
  FOTOS: server +'controles/',
  LOGOS: server + 'logos/',
  DOCS: server + 'docs/'
}
