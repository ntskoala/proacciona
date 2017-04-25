import { Component, Input, OnInit, OnChanges, SimpleChange,Output,EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { EmpresasService } from '../services/empresas.service';
import { Servidor } from '../services/servidor.service';
import { Empresa } from '../models/empresa';
import { URLS } from '../models/urls';
import { Checklist } from '../models/checklist';

import { Modal } from '../models/modal';

@Component({
  selector: 'listado-checklists',
  templateUrl: '../assets/html/listado-checklists.component.html'
})
export class ListadoChecklistsComponent implements OnInit {
  @Input() empresaSeleccionada: string;
  @Output() checklistSeleccionada: EventEmitter<string>=new EventEmitter<string>();
  public subscription: Subscription;
  checklistActiva: number = 0;
  checklist: Checklist = new Checklist(0, 0, 'Seleccionar', 0, '');
  checklists: Checklist[] = [];
  
  constructor(public servidor: Servidor, public empresasService: EmpresasService) {}

ngOnInit(){
 // this.subscription = this.empresasService.empresaSeleccionada.subscribe(x => this.loadChecklistList(x));
 if (this.empresaSeleccionada) this.loadChecklistList(this.empresaSeleccionada);
}

     loadChecklistList(emp: Empresa | string) {
    let params = typeof(emp) == "string" ? emp : emp.id
    let parametros = '&idempresa=' + params;
        //let parametros = '&idempresa=' + seleccionada.id;
        // Llamada al servidor para conseguir las checklists
        this.servidor.getObjects(URLS.CHECKLISTS, parametros).subscribe(
          response => {
            // Ocultar mostrar control checklists
            this.checklistActiva = 0;
            // Vaciar la lista actual
            this.checklists = [];
            this.checklists.push(this.checklist);
            if (response.success == 'true' && response.data) {
              for (let element of response.data) {
                this.checklists.push(new Checklist(element.id, element.idempresa, element.nombrechecklist,
                  element.periodicidad, element.tipoperiodo));
              }
            }
        });
   }




seleccionarCCL(valor: any){
  this.checklistSeleccionada.emit(valor);
}


ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    for (let propName in changes) {
      let changedProp = changes[propName];
      let from = JSON.stringify(changedProp.previousValue);
      let to =   JSON.stringify(changedProp.currentValue);
       this.empresaSeleccionada = to;
    }
   console.log ("cambio de seleccion",this.empresaSeleccionada);
   if (this.empresaSeleccionada) this.loadChecklistList(this.empresaSeleccionada);
  // this.checklistSeleccionada.emit("");
  }

}
