import { Component } from '@angular/core';

import { EmpresasService } from '../services/empresas.service';

@Component({
  selector: 'gestion-informes',
  templateUrl: '../assets/html/gestion-informes.component.html'
})
export class GestionInformesComponent {

  tabs = [true, null, null, null]
  tabActivo: number = 0;

  constructor(private empresasService: EmpresasService) {}

  cambiarTab(tab: number) {
    this.tabActivo = tab;
    // Quitar true al tab anterior
    this.tabs[this.tabs.indexOf(true)] = null;
    // Poner true en el nuevo tab
    this.tabs[tab] = true;
  }

}
