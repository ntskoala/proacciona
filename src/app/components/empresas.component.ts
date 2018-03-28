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
  if ( x== 0) this.ruteado();
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
  this.empresasService.login=false;
  this.empresasService.userId = parseInt(sessionStorage.getItem('userId'));
  this.empresasService.userName = sessionStorage.getItem('userName');
  this.empresasService.userTipo = sessionStorage.getItem('userTipo');
  this.empresasService.empresaActiva = parseInt(sessionStorage.getItem('idEmpresa'));
  this.empresasService.administrador = (sessionStorage.getItem('administrador') === 'true');
  this.empresa = new Empresa('', '', this.empresasService.empresaActiva);
  this.empresasService.seleccionarEmpresa(this.empresa);
}

loggedIn(evento){
if (evento){
  this.nuevoLogin=false;
  let idempresa:number;
  this.route.paramMap.forEach((param)=>{
   if (param["params"]["empresa"]) idempresa = param["params"]["empresa"];
  });
      
  this.empresasService.seleccionarEmpresa(new Empresa('','',idempresa));

  this.setInitial();
}
}

  setInitial(){
    this.isTokenExired(this.token)
    // Si no exite el token, redirecciona a login
    console.log(this.isTokenExired(this.token),this.token);
    if (this.isTokenExired(this.token)) {
      console.log('no hay token');
      this.router.navigate(['login']);
      //this.nuevoLogin = true;
    }

    this.setUser();
    //if (this.empresasService.login){
      // this.empresasService.login=false;
      // this.empresasService.userId = parseInt(sessionStorage.getItem('userId'));
      // this.empresasService.userName = sessionStorage.getItem('userName');
      // this.empresasService.userTipo = sessionStorage.getItem('userTipo');
      // this.empresasService.empresaActiva = parseInt(sessionStorage.getItem('idEmpresa'));
      // this.empresasService.administrador = (sessionStorage.getItem('administrador') === 'true');
    //}
    console.log(this.empresasService.userTipo,this.empresasService.idioma,this.empresasService.userId,this.empresasService.userName)
    switch (this.empresasService.userTipo) {
      case 'Administrador':
        this.permiso = true;
        console.log('Seleccion automática de empresa, empresas component');
        //this.empresasService.seleccionarEmpresa(new Empresa('','',2));
        //this.selectedMenu = "incidencias";
        //this.selectedMenu = "empresas";
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
        this.empresa = new Empresa('', '', this.empresasService.empresaActiva);
        this.empresasService.seleccionarEmpresa(this.empresa);
        this.permiso = true;
        //this.selectedMenu = "maquinaria";
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
        this.empresa = new Empresa('', '',this.empresasService.empresaActiva);
        this.empresasService.seleccionarEmpresa(this.empresa);
        this.permiso = true;
        //this.selectedMenu = "informes";
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


irAlMenu(menuDefecto?:string){
  console.log('GOTO',menuDefecto)
      switch(menuDefecto){
        case "limpieza_realizada":
        // console.log('Go to Limiezas',this.empresasService.empresaActiva);
        this.setUser();

        this.setPermisos(this.empresasService.empresaActiva);
        this.permiso = true;
        this.selectedMenu = "limpieza";
        break;
        case "incidencias":
        this.setUser();
        this.setPermisos(this.empresasService.empresaActiva);
        this.permiso = true;
        this.selectedMenu = "incidencias";
        break;
        // case "limpieza":
        // console.log('limpieza Item');
        // this.setPermisos(this.empresasService.empresaActiva);
        // this.permiso = true;
        // this.selectedMenu = "limpieza";
        // break;
        default:
        if (menuDefecto == undefined) menuDefecto = this.route.params["_value"]["modulo"];
        this.setPermisos(this.empresasService.empresaActiva);
        this.permiso = true;
        //this.selectedMenu = param["params"]["modulo"];  
        console.log(menuDefecto,this.route.params["_value"]["modulo"])
        this.selectedMenu = menuDefecto;
      }
}
}
