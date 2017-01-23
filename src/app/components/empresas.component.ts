import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { EmpresasService } from '../services/empresas.service';
import { Empresa } from '../models/empresa';
 
@Component({
  selector: 'empresas',
  template: `
  <div #scrollMe style="overflow: scroll; height: xyz;">
    <div class="empresas" *ngIf="permiso">
      <seleccionar-empresa *ngIf="empresasService.administrador"></seleccionar-empresa>
      <nueva-empresa *ngIf="empresasService.administrador"></nueva-empresa>
      <gestion-tablas></gestion-tablas>
      <gestion-informes></gestion-informes>
    </div>
    </div>
  `
})
export class EmpresasComponent implements OnInit {
@ViewChild('scrollMe') private myScrollContainer: ElementRef;
  permiso: boolean = false;
  token = sessionStorage.getItem('token');
  empresa: Empresa;
  constructor(private router: Router, private empresasService: EmpresasService) {}

  ngOnInit() {
    // Si no exite el token, redirecciona a login
    if (!this.token) {
      this.router.navigate(['login']);
    } else if (!this.empresasService.administrador) {
      // Si el usuario activo no es administrador, redirecciona a login
      if (this.empresasService.empresaActiva == 0){
       sessionStorage.removeItem('token');
       this.router.navigate(['login']);
      }
      this.empresa = new Empresa ('','','0','0', this.empresasService.empresaActiva);
      this.empresasService.seleccionarEmpresa(this.empresa);
      this.permiso = true;
    } else {
      // Todo ok, adelante
      this.permiso = true;
    }
    console.log("empresas",this.empresasService.administrador,this.permiso)
  }

    scrolldown(): void {
        try {
            this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        } catch(err) { }                 
    }

}
