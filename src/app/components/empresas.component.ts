import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
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
export class EmpresasComponent implements OnInit {
@ViewChild('scrollMe') public myScrollContainer: ElementRef;
public selectedMenu:string='home';
public inicio:string;

  permiso: boolean = false;
  token = sessionStorage.getItem('token');
  empresa: Empresa;
  constructor(public router: Router, public empresasService: EmpresasService,public servidor: Servidor,
  public permisos: PermisosService) {}

  ngOnInit() {
    this.isTokenExired(this.token)
    // Si no exite el token, redirecciona a login
    console.log(this.isTokenExired(this.token),this.token);
    if (this.isTokenExired(this.token)) {
      console.log('no hay token');
      this.router.navigate(['login']);
    }
    //if (this.empresasService.login){
      this.empresasService.login=false;
      this.empresasService.userId = parseInt(sessionStorage.getItem('userId'));
      this.empresasService.userName = sessionStorage.getItem('userName');
      this.empresasService.userTipo = sessionStorage.getItem('userTipo');
      this.empresasService.empresaActiva = parseInt(sessionStorage.getItem('idEmpresa'));
      this.empresasService.administrador = (sessionStorage.getItem('administrador') === 'true');
    //}
    console.log(this.empresasService.userTipo,this.empresasService.idioma,this.empresasService.userId,this.empresasService.userName)
    switch (this.empresasService.userTipo) {
      case 'Administrador':
        this.permiso = true;
        console.log('Seleccion automática de empresa, empresas component');
        //this.empresasService.seleccionarEmpresa(new Empresa('','',2));
        //this.selectedMenu = "incidencias";
        this.selectedMenu = "empresas";
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
        this.selectedMenu = "maquinaria";
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
        this.selectedMenu = "informes";
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

}
