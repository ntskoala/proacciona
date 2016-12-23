import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { EmpresasService } from '../services/empresas.service';

@Component({
  selector: 'empresas',
  template: `
    <div class="empresas" *ngIf="permiso">
      <seleccionar-empresa></seleccionar-empresa>
      <nueva-empresa></nueva-empresa>
      <gestion-tablas></gestion-tablas>
      <gestion-informes></gestion-informes>
    </div>
  `
})
export class EmpresasComponent implements OnInit {

  permiso: boolean = false;
  token = sessionStorage.getItem('token');

  constructor(private router: Router, private empresasService: EmpresasService) {}

  ngOnInit() {
    // Si no exite el token, redirecciona a login
    if (!this.token) {
      this.router.navigate(['login']);
    } else if (!this.empresasService.administrador) {
      // Si el usuario activo no es administrador, redirecciona a login
      sessionStorage.removeItem('token');
      this.router.navigate(['login']);
    } else {
      // Todo ok, adelante
      this.permiso = true;
    }
  }

}
