import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router'
import { Subscription } from 'rxjs/Subscription';


import { EmpresasService } from '../services/empresas.service';
import { Servidor } from '../services/servidor.service';
import { Empresa } from '../models/empresa';
import { URLS } from '../models/urls';


@Component({
  selector: 'opciones-premium',
  templateUrl: '../assets/html/empresasopcionespremium.component.html'
})

export class OpcionesPremium implements OnInit {
  private subscription: Subscription;
  idEmpresa: number;
  public opciones: Object[]=[{}];
 // public opcionespremium: Object[] = [{"nombre":"Exportar informes","value":this.empresasService.empresa.exportar_informes},{"nombre":"Fichas Maquinaria","value":this.empresasService.empresa.fichas_maquinaria}];
  public estados =[{"Exportar informes":false},{"Fichas Maquinaria":true}];
  constructor(private router: Router, private route: ActivatedRoute, private empresasService: EmpresasService, private servidor: Servidor,) {}
  
  
  ngOnInit() {
    this.subscription = this.empresasService.empresaSeleccionada.subscribe(
      emp => {
        this.setEmpresa(emp);
    });
    if (this.empresasService.administrador == false) {
      this.setEmpresa(this.empresasService.empresaActiva.toString());
    }
  }

  setEmpresa(emp: Empresa | string){
    let params = typeof(emp) == "string" ? emp : emp.id
    let parametros = '&idempresa=' + params;
       // let parametros = '&idempresa=' + seleccionada.id; 
        this.servidor.getObjects(URLS.OPCIONES, parametros).subscribe(
          response => {
            this.opciones = [];
            if (response.success && response.data) {
              for (let element of response.data) {
                this.opciones.push({"id":element.id,"nombre":element.opcion});
                //this.guardar[element.id] = false;
              }
            }
        });

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
