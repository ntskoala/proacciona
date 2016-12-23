import { Component } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { EmpresasService } from '../services/empresas.service';
import { Servidor } from '../services/servidor.service';
import { URLS } from '../models/urls';
import { Control } from '../models/control';

@Component({
  selector: 'informe-periodicidad',
  templateUrl: '../assets/html/informe-periodicidad.component.html'
})
export class InformePeriodicidadComponent {

  private subscription: Subscription;
  controles: any[] = [];
  checklists: any[] = [];
  fecha: Object = {inicio: '2016-10-01'};

  constructor(private servidor: Servidor, private empresasService: EmpresasService) {}

  mostrarInforme() {
    let parametros = '&idempresa=' + this.empresasService.seleccionada;
    // Conseguir controles
    this.servidor.getObjects(URLS.CONTROLES, parametros).subscribe(
      controles => {
        if (controles.success && controles.data) {
          // Limpiar tabla
          this.controles = [];
          // Iterar los controles
          for (let control of controles.data) {
            let per: Object = {nombre: control.nombre};
            let dias: number;
            switch (control.tipoperiodo) {
              case 'Día':
                dias = 1;
                break;
              case 'Semana':
                dias = 7;
                break;
              case 'Mes':
                dias = 30;
                break;
              case 'Año':
                dias = 365;
                break;
            }
            let fechaLimite = Date.now() - dias / control.periodicidad * 86400000;
            let parametros = '&idcontrol=' + control.id + '&fecha=' + fechaLimite;
            // Conseguir resultados
            this.servidor.getObjects(URLS.PERIODICIDAD_CONTROL, parametros).subscribe(
              response => {
                if (response.data) per['resultado'] = true;
              },
              error => console.log(error),
              () => {
                this.controles.push(per);
                this.controles.sort((a, b) => {return a.nombre > b.nombre ? 1 : a.nombre < b.nombre ? -1 : 0});
              }
            );
          }
        }
      }
    );
    // Conseguir checklists
    this.servidor.getObjects(URLS.CHECKLISTS, parametros).subscribe(
      checklists => {
        if (checklists.success && checklists.data) {
          // Limpiar tabla
          this.checklists = [];
          // Iterar los checklists
          for (let checklist of checklists.data) {
            let per: Object = {nombre: checklist.nombrechecklist};
            let dias: number;
            switch (checklist.tipoperiodo) {
              case 'Día':
                dias = 1;
                break;
              case 'Semana':
                dias = 7;
                break;
              case 'Mes':
                dias = 30;
                break;
              case 'Año':
                dias = 365;
                break;
            }
            let fechaLimite = Date.now() - dias * 86400000;
            let parametros = '&idchecklist=' + checklist.id + '&fecha=' + fechaLimite;
            // Conseguir resultados
            this.servidor.getObjects(URLS.PERIODICIDAD_CHECKLIST, parametros).subscribe(
              response => {
                if (response.data) per['resultado'] = true;
              },
              error => console.log(error),
              () => {
                this.checklists.push(per);
                this.checklists.sort((a, b) => {return a.nombre > b.nombre ? 1 : a.nombre < b.nombre ? -1 : 0});
              }
            );
          }
        }
      }
    );
  }

}
