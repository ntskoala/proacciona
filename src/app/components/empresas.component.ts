import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
//import {MessageService} from 'primeng/components/common/messageservice';
import * as moment from 'moment/moment';

import { EmpresasService } from '../services/empresas.service';
import { Empresa } from '../models/empresa';
 
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
  constructor(public router: Router, public empresasService: EmpresasService) {}

  ngOnInit() {
    this.isTokenExired(this.token)
    // Si no exite el token, redirecciona a login

    if (!this.token) {
      this.router.navigate(['login']);
    }
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
          sessionStorage.removeItem('token');
          this.router.navigate(['login']);
        }
        this.empresa = new Empresa('', '', this.empresasService.empresaActiva);
        this.empresasService.seleccionarEmpresa(this.empresa);
        this.permiso = true;
        this.selectedMenu = "maquinaria";
        break;
      case 'Gerente':
        if (this.empresasService.empresaActiva == 0) {
          sessionStorage.removeItem('token');
          this.router.navigate(['login']);
        }
        this.empresa = new Empresa('', '',this.empresasService.empresaActiva);
        this.empresasService.seleccionarEmpresa(this.empresa);
        this.permiso = true;
        this.selectedMenu = "informes";
        break;
      default:
        // USUARIO SIN PERMISOS, COMO HA LLEGADO HASTA AQUI???
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

}
