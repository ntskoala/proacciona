import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { EmpresasService } from '../../services/empresas.service';
import { Servidor } from '../../services/servidor.service';
import { Empresa } from '../../models/empresa';
import { ProduccionOrden } from '../../models/produccionorden';
import { Modal } from '../../models/modal';
import { URLS } from '../../models/urls';

@Component({
  selector: 'ficha-produccion',
  templateUrl: './ficha-produccion.component.html',
  styleUrls:['./produccion.css']
})
export class FichaProduccionComponent implements OnInit {
//*** STANDARD VAR
@Input() orden: ProduccionOrden;
@Output() itemSeleccionado: EventEmitter<ProduccionOrden> = new EventEmitter<ProduccionOrden>();




//*** ESPECIFIC VAR */
private trazabilidad: boolean;

  constructor(private empresasService: EmpresasService, private servidor: Servidor) {}

  ngOnInit() {

  }
cambiarTab(){}

updateItem(orden: ProduccionOrden){
 orden.id =this.orden.id;
 orden.idempresa = this.empresasService.seleccionada;
let param = "&entidad=produccion_orden";
let parametros = '?id=' + orden.id+param;     
    this.servidor.putObject(URLS.STD_ITEM,parametros, orden).subscribe(
      response => {
        if (response.success) {
          console.log("updated");
          //let index = this.items.findIndex((elem) =>elem.id == this.itemActivo);
          //this.items[index].nombre = this.nuevoNombre;
          //this.listaZonas.emit(this.limpiezas);
          //this.modificaItem = false;
        }
    });
}


trazabilidadAtras(){
this.trazabilidad= !this.trazabilidad;
}
trazabilidadAdelante(){
this.trazabilidad= !this.trazabilidad;
}
}