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
      console.log('Actualizando showTooltips',this.empresasService.showTooltips);
      switch(opcion){
        case "tooltips":
          if (this.empresasService.showTooltips){
            localStorage.setItem("showTooltips","true");
            }else{
            localStorage.setItem("showTooltips","false");
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
