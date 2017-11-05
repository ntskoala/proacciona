import { Component, OnInit } from '@angular/core';

import { EmpresasService } from '../../services/empresas.service';




@Component({
  selector: 'tab-opciones2',
  templateUrl: './opciones.html'
})

export class Opciones implements OnInit {


  constructor(public empresasService: EmpresasService) {}

  ngOnInit() {
  }

  actualizarOpcion(opcion){
      console.log('Actualizando noTooltips',this.empresasService.noTooltips);
      switch(opcion){
        case "tooltips":
          if (this.empresasService.noTooltips){
            localStorage.setItem("noTooltips","true");
            }else{
            localStorage.setItem("noTooltips","false");
            }
        case "alertas":
        if (this.empresasService.showAlerts){
          localStorage.setItem("showAlerts","true");
          }else{
          localStorage.setItem("showAlerts","false");
          }        
    }
  }
}
