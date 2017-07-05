import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { EmpresasService } from '../services/empresas.service';
import { Empresa } from '../models/empresa';
 
@Component({
  selector: 'empresas',
  templateUrl: '../assets/html/empresas.component.html'
})
export class EmpresasComponent implements OnInit {
@ViewChild('scrollMe') public myScrollContainer: ElementRef;
public selectedMenu:string='home';

  permiso: boolean = false;
  token = sessionStorage.getItem('token');
  empresa: Empresa;
  constructor(public router: Router, public empresasService: EmpresasService) {}

  ngOnInit() {

    // Si no exite el token, redirecciona a login
    if (!this.token) {
      this.router.navigate(['login']);
    }
    switch (this.empresasService.userTipo) {
      case 'Administrador':
        this.permiso = true;
        console.log('Seleccion automática de empresa, empresas component');
        //this.empresasService.seleccionarEmpresa(new Empresa('','',2));
        //this.selectedMenu = "settings";
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

}
