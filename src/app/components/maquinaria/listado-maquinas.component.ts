import { Component, Input, OnInit, OnChanges, SimpleChange,Output,EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { EmpresasService } from '../../services/empresas.service';
import { Servidor } from '../../services/servidor.service';
import { Empresa } from '../../models/empresa';
import { URLS } from '../../models/urls';
import { Checklist } from '../../models/checklist';
import { Maquina } from '../../models/maquina';
import { Modal } from '../../models/modal';

@Component({
  selector: 'listado-maquinas',
  templateUrl: './listado-maquinas.component.html',
  styleUrls:['./listado-maquinas.css']
})
export class ListadoMaquinasComponent implements OnInit {
  @Output() maquinaSeleccionada: EventEmitter<Maquina>=new EventEmitter<Maquina>();
  private subscription: Subscription;
  maquinaActiva: number = 0;
  maquina1: Maquina = new Maquina(0, 'Seleccionar máquina',0);
  maquinas: Maquina[] = [];
  novaMaquina: Maquina = new Maquina(0,'',0);
  constructor(private servidor: Servidor, private empresasService: EmpresasService) {}

ngOnInit(){
 // this.subscription = this.empresasService.empresaSeleccionada.subscribe(x => this.loadChecklistList(x));
 if (this.empresasService.seleccionada) this.loadMaquinas(this.empresasService.seleccionada.toString());
}

     loadMaquinas(emp: Empresa | string) {
    let params = typeof(emp) == "string" ? emp : emp.id
    let parametros = '&idempresa=' + params;
        //let parametros = '&idempresa=' + seleccionada.id;
        // Llamada al servidor para conseguir las checklists
        this.servidor.getObjects(URLS.MAQUINAS, parametros).subscribe(
          response => {
            // Ocultar mostrar control checklists
            this.maquinaActiva = 0;
            // Vaciar la lista actual
            this.maquinas = [];
            this.maquinas.push(this.maquina1);
            if (response.success == 'true' && response.data) {
              for (let element of response.data) {
                this.maquinas.push(new Maquina(element.id,element.nombre, element.idempresa, element.ubicacion, element.numserie, element.fecha_adquisicion, element.fabricante, element.modelo, element.codigo_interno, element.potencia, element.medidas, element.funciones, element.imgfunciones, element.regimen_trabajo, element.ciclo_productivo, element.material, element.liquido_refrigerante, element.modo_trabajo, element.lubricacion ));
              }
            }
        });
   }




seleccionarMaquina(valor: any){
  console.log("changelist",this.maquinas[valor]);
  this.maquinaSeleccionada.emit(this.maquinas[valor]);
}


ngOnChanges(changes: {[propKey: string]: SimpleChange}) {

  }

nuevaMaquina(maq){
console.log(maq)
}
}
