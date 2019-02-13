import { Component, OnInit, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { Router,ActivatedRoute, ParamMap, NavigationEnd,NavigationStart  } from '@angular/router';
import 'rxjs/add/operator/switchMap';
import { TranslateService } from '@ngx-translate/core';

import { Observable } from 'rxjs/Observable';
//import {MessageService} from 'primeng/components/common/messageservice';
import * as moment from 'moment/moment';

import { EmpresasService } from '../services/empresas.service';
import { Empresa } from '../models/empresa';
import { Servidor } from '../services/servidor.service';
import { PermisosService } from '../services/permisos.service';
import { URLS } from '../models/urls';
@Component({
  // selector: 'empresas',
  selector: 'routerCanvas',
  templateUrl: './routerCanvas.component.html'
//   styleUrls: ['./empresas.css']
})
export class RouterCanvasComponent implements OnInit, OnChanges {
@ViewChild('scrollMe') public myScrollContainer: ElementRef;
public selectedMenu:string='home';
public inicio:string;
public params;
  permiso: boolean = false;
  token = sessionStorage.getItem('token');
  empresa: Empresa;
  public nuevoLogin:boolean=false;

  constructor(public router: Router,private route: ActivatedRoute,
     public empresasService: EmpresasService,public servidor: Servidor,
  public permisos: PermisosService, public translate: TranslateService) {
    console.log("## CONSTRUCTOR PARAM",this.route.paramMap["source"]["_value"]["modulo"]);
  }

  ngOnInit() {
     let x = 0;
     this.router.events.subscribe((val) => {
       x++;
     //  console.log(val);
      // see also 
      let modulo 
     // console.log(val["url"]);
      if (val["url"]) modulo = val["url"].split("/")[1]
   //   console.log('modulo',modulo);
      //if (val["url"]) console.log("***",val instanceof NavigationStart,val["url"].split("/")[1]) 
      if (val instanceof NavigationStart && modulo != 'login'){
        let page
        page = val["url"].split("/")[3]
        console.log("ruteando...",x,val) 
        this.ruteado(page);
      }
  },
  (error)=>{console.log('error ruteando',error)}
  );
  console.log("rutea...",x) 
  if ( x== 0) this.ruteado(this.route.paramMap["source"]["_value"]["modulo"]);
  }

ruteado(page?:string){
  if (this.translate.currentLang === undefined) this.setIdioma();
  console.log("########RUTEADO",page);
  if (!page){
    this.setInitial();
  }else{
    if (this.isTokenExired(this.token)) {
      console.log('no hay token');
      //this.router.navigate(['login']);
      this.nuevoLogin = true;
    }else{
      console.log('Hay token');
      this.irAlMenu(page);
}
}
}
setIdioma(){
  console.log(this.translate.currentLang);
  this.translate.setDefaultLang('cat');
  this.translate.use('cat');
if (localStorage.getItem("idioma")){
   let idioma = localStorage.getItem("idioma");
   this.empresasService.idioma = idioma;
  this.translate.use(idioma);
}
console.log(this.translate.currentLang);
}
ngOnChanges(){
  console.log("### ONCHANGES PARAM",this.route.paramMap["source"]["_value"]["modulo"]);
}
setUser(){
  return new Promise((resolve,reject)=>{
  this.empresasService.login=false;
  this.empresasService.userId = parseInt(sessionStorage.getItem('userId'));
  this.empresasService.userName = sessionStorage.getItem('userName');
  this.empresasService.userTipo = sessionStorage.getItem('userTipo');
  this.empresasService.empresaActiva = parseInt(sessionStorage.getItem('idEmpresa'));
  this.empresasService.nombreEmpresa = sessionStorage.getItem('nombreEmpresa');
  this.empresasService.administrador = (sessionStorage.getItem('administrador') === 'true');
  this.empresasService.holding = parseInt(sessionStorage.getItem('holding'));
  this.empresasService.idHolding = parseInt(sessionStorage.getItem('idHolding'));
  this.empresa = new Empresa(this.empresasService.nombreEmpresa, '', this.empresasService.empresaActiva, this.empresasService.holding, this.empresasService.idHolding);
  console.log(this.empresasService.nombreEmpresa, '', this.empresasService.empresaActiva, this.empresasService.holding, this.empresasService.idHolding);
  this.empresasService.seleccionarEmpresa(this.empresa);
  console.log('set User, empresa.id:',this.empresa.id);
  resolve(this.empresa.id);
  })
}


loggedIn(evento){
if (evento){
  this.nuevoLogin=false;
  let idempresa:number;
  let paramsurl = this.route.url["value"]
  console.log('***LOGGEDIN',this.route.url["value"],evento);
   if (paramsurl[1]["path"]>0) idempresa = paramsurl[1]["path"];
  this.empresasService.seleccionarEmpresa(new Empresa('','',idempresa,null));
  //this.setInitial();
  if (paramsurl[2]["path"]) this.irAlMenu(paramsurl[2]["path"]);
}
}

  setInitial(){
    // Si no exite el token, redirecciona a login
    console.log(this.isTokenExired(this.token),this.token);
    if (this.isTokenExired(this.token)) {
      console.log('no hay token');
      this.router.navigate(['login']);
      //this.nuevoLogin = true;
    }

    this.setUser();
    console.log(this.empresasService.userTipo,this.empresasService.idioma,this.empresasService.userId,this.empresasService.userName)
    switch (this.empresasService.userTipo) {
      case 'Administrador':
      //  this.permiso = true;
        console.log('user Administrador');
        this.irAlMenu('empresas');
        break;
        case 'Admin':
          console.log('user Admin Holding');
          if (this.empresasService.empresaActiva == 0) {
            console.log('user ADMIN');
            sessionStorage.removeItem('token');
            this.router.navigate(['login']);
          }else{
            console.log('EMPRESA ACTIVA',this.empresasService.empresaActiva);
           // this.setPermisos(this.empresasService.empresaActiva,'setUser Admin 149');
          }
          this.irAlMenu('empresas');
          break;
      case "Mantenimiento":
        if (this.empresasService.empresaActiva == 0) {
          console.log('user mantenimientor');
          sessionStorage.removeItem('token');
          this.router.navigate(['login']);
        }else{
         // this.setPermisos(this.empresasService.empresaActiva,'setUser Mantenimiento 159');
        }
        this.irAlMenu('maquinaria');
        break;
      case 'Gerente':
        if (this.empresasService.empresaActiva == 0) {
          console.log('user gerente');
          sessionStorage.removeItem('token');
          this.router.navigate(['login']);
        }else{
         // this.setPermisos(this.empresasService.empresaActiva,'setUser Gerente 172');
        }
        this.irAlMenu('Controles')
        break;
      default:
        // USUARIO SIN PERMISOS, COMO HA LLEGADO HASTA AQUI???
        console.log('no hay user');
        this.router.navigate(['login']);
    }
  }

    scrolldown(): void {
        try {
            this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        } catch(err) { }                 
    }

    setMenu(menu){
      this.selectedMenu = menu;
    }


irAlMenu(menuDefecto?:string){
  console.log('GOTO',menuDefecto)
  this.setUser().then(
    (empresa)=>{
  this.setPermisos(empresa,'irAlMenu 201');
  this.permiso=true;
      switch(menuDefecto){
        case "dashboard":
        this.selectedMenu = "dashboard";
        break;
        case "limpieza_realizada":
        this.selectedMenu = "limpieza";
        break;
        case "mantenimientos_realizados":
        this.setUser();
        this.selectedMenu = "maquinaria";
        break;
        case "mantenimientos_relizados":
        this.setUser();
        this.selectedMenu = "maquinaria";
        break;
        case "planificaciones_realizadas":
        this.setUser();
        this.selectedMenu = "planificaciones";
        break;
        case "incidencias":
        this.selectedMenu = "incidencias";
        break;
        case "Controles":
        this.selectedMenu = "informes";
        break;
        case "Checklists":
        this.selectedMenu = "informes";
        break;
        default:
        if (menuDefecto == undefined) menuDefecto = this.route.params["_value"]["modulo"];
        this.selectedMenu = menuDefecto;
      }
      console.log('selectedMenu:',this.selectedMenu)
    });

}

setPermisos(idempresa, fuente){
  console.log('SET PERMISOS',idempresa,fuente)
  let parametros = '&idempresa=' + idempresa; 
  this.servidor.getObjects(URLS.OPCIONES_EMPRESA, parametros).subscribe(
    response => {
      
      if (response.success && response.data) {
        for (let element of response.data) {
          //this.permisos.setOpciones(true,element.opcion);
          this.permisos.setOpciones(true,element.idopcion,'routerCanvas');
        }
        console.log('setting permisos');
        this.permisos.modulosFuente.next('routerCanvas');
      }
  },
  error => {console.log(error)});
}

isTokenExired (token) {
  token = sessionStorage.getItem('token');
  if (token){
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace('-', '+').replace('_', '/');
            //return JSON.parse(window.atob(base64));
            let jwt = JSON.parse(window.atob(base64));
            console.log (moment.unix(jwt.exp).isBefore(moment()));
            if (moment.unix(jwt.exp).isBefore(moment())) this.token = null;
           return moment.unix(jwt.exp).isBefore(moment());
  }else{
    return true;
  }
}


}
