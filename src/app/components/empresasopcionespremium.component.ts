import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router'

import { EmpresasService } from '../services/empresas.service';
import { Servidor } from '../services/servidor.service';
import { Empresa } from '../models/empresa';
import { URLS } from '../models/urls';


@Component({
  selector: 'opciones-premium',
  templateUrl: '../assets/html/empresasopcionespremium.component.html'
})

export class OpcionesPremium implements OnInit {
  idEmpresa: number;
  public opcionespremium: Object[] = [{"nombre":"Exportar informes"},{"nombre":"Fichas Maquinaria"}];
  public estados =[{"Exportar informes":false},{"Fichas Maquinaria":true}];
  constructor(private router: Router, private route: ActivatedRoute, private empresasService: EmpresasService) {}
  ngOnInit() {
  }

    actualizarOpcion(opcion: string) {
    // this.guardar[idControlchecklist] = false;
    // let modControlchecklist = this.controlchecklists.find(controlchecklist => controlchecklist.id == idControlchecklist);
    // let parametros = '?id=' +  idControlchecklist;
    // this.servidor.putObject(URLS.CONTROLCHECKLISTS, parametros, modControlchecklist).subscribe(
    //   response => {
    //     if (response.success) {
    //       console.log('Controlchecklist updated');
    //     }
    // });
  }

}
