import { Component } from '@angular/core';

import { EmpresasService } from '../services/empresas.service';
@Component({
  selector: 'gestion-tablas',
  templateUrl: '../assets/html/gestion-tablas.component.html'
})
export class GestionTablasComponent {

  constructor(public empresasService: EmpresasService) {}

  tabs = [true, null, null, null,null]
  tabActivo: number = 0;
  
  cambiarTab(tab: number) {
    this.tabActivo = tab;
    // Quitar true al tab anterior
    this.tabs[this.tabs.indexOf(true)] = null;
    // Poner true en el nuevo tab
    this.tabs[tab] = true;
  }

}
