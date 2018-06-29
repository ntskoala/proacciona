import { Component, OnInit, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { Router,ActivatedRoute, ParamMap, NavigationEnd,NavigationStart  } from '@angular/router';
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';
//import {MessageService} from 'primeng/components/common/messageservice';
import * as moment from 'moment/moment';

import { EmpresasService } from '../services/empresas.service';
import { Empresa } from '../models/empresa';
import { Servidor } from '../services/servidor.service';
import { PermisosService } from '../services/permisos.service';
import { URLS } from '../models/urls';
@Component({
  selector: 'empresas',
  templateUrl: '../assets/html/empresas.component.html'
})
export class EmpresasComponent implements OnInit, OnChanges {
@ViewChild('scrollMe') public myScrollContainer: ElementRef;
public selectedMenu:string='home';
public inicio:string;
public params;
  permiso: boolean = false;
  token = sessionStorage.getItem('token');
  empresa: Empresa;
  constructor(public router: Router,private route: ActivatedRoute,
     public empresasService: EmpresasService,public servidor: Servidor,
  public permisos: PermisosService) {
    console.log("## CONSTRUCTOR PARAM",this.route.paramMap["source"]["_value"]["modulo"]);
  }
public nuevoLogin:boolean=false;
  ngOnInit() {
     let x = 0;
     this.router.events.subscribe((val) => {
       x++;
      // see also 
      let modulo 
      if (val["url"]) modulo = val["url"].split("/")[1]
      //if (val["url"]) console.log("***",val instanceof NavigationStart,val["url"].split("/")[1]) 
      if (val instanceof NavigationStart && modulo != 'login'){
        let page
        page = val["url"].split("/")[3]
        console.log("ruteando...",x,val) 
        this.ruteado(page);
      }
  });
  console.log("rutea...",x) 
  if ( x== 0) this.ruteado(this.route.paramMap["source"]["_value"]["modulo"]);
  }

ruteado(page?:string){
  console.log("########RUTEADO",page);
  if (!page){
    this.setInitial();
  }else{
    if (this.isTokenExired(this.token)) {
      console.log('no hay token');
      //this.router.navigate(['login']);
      this.nuevoLogin = true;
    }else{
      this.irAlMenu(page);
}
}
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
  this.empresa = new Empresa(this.empresasService.nombreEmpresa, '', this.empresasService.empresaActiva);
  this.empresasService.seleccionarEmpresa(this.empresa);
  console.log()
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
  this.empresasService.seleccionarEmpresa(new Empresa('','',idempresa));
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
      case "Mantenimiento":
        if (this.empresasService.empresaActiva == 0) {
          console.log('user mantenimientor');
          sessionStorage.removeItem('token');
          this.router.navigate(['login']);
        }else{
          this.setPermisos(this.empresasService.empresaActiva);
        }
        // this.empresa = new Empresa('', '', this.empresasService.empresaActiva);
        // this.empresasService.seleccionarEmpresa(this.empresa);
        // this.permiso = true;
        this.irAlMenu('maquinaria');
        break;
      case 'Gerente':
        if (this.empresasService.empresaActiva == 0) {
          console.log('user gerente');
          sessionStorage.removeItem('token');
          this.router.navigate(['login']);
        }else{
          this.setPermisos(this.empresasService.empresaActiva);
        }
        // this.empresa = new Empresa('', '',this.empresasService.empresaActiva);
        // this.empresasService.seleccionarEmpresa(this.empresa);
        // this.permiso = true;
        this.irAlMenu('informes')
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
  this.setPermisos(empresa);
  this.permiso=true;
      switch(menuDefecto){
        case "limpieza_realizada":
        this.selectedMenu = "limpieza";
        break;
        case "mantenimientos_realizados":
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

setPermisos(idempresa){
  let parametros = '&idempresa=' + idempresa; 
  this.servidor.getObjects(URLS.OPCIONES_EMPRESA, parametros).subscribe(
    response => {
      
      if (response.success && response.data) {
        for (let element of response.data) {
          //this.permisos.setOpciones(true,element.opcion);
          this.permisos.setOpciones(true,element.idopcion,'login');
        }
        console.log('setting permisos');
        this.permisos.modulosFuente.next('login');
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
