import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { EmpresasService } from '../../services/empresas.service';
import { Servidor } from '../../services/servidor.service';
import { Empresa } from '../../models/empresa';
import { ProduccionOrden } from '../../models/produccionorden';
import { Modal } from '../../models/modal';
import { URLS } from '../../models/urls';

@Component({
  selector: 'listado-ordenes-produccion',
  templateUrl: './listado-ordenes-produccion.component.html',
  styleUrls:['./produccion.css']
})
export class ListadoOrdenesProduccionComponent implements OnInit {
//*** STANDARD VAR
@Output() itemSeleccionado: EventEmitter<ProduccionOrden> = new EventEmitter<ProduccionOrden>();
public itemActivo: number;
public items: ProduccionOrden[]=[];//Array de Items para el desplegable;
public  nuevoItem: ProduccionOrden = new ProduccionOrden(0,0,'',new Date(),new Date());
public item1:ProduccionOrden = new ProduccionOrden(0,0,'Selecciona',new Date(),new Date());
public  modal: Modal = new Modal();
public  modificaItem: boolean;
public  nuevoNombre:string;

//*** ESPECIFIC VAR */

  constructor(private empresasService: EmpresasService, private servidor: Servidor) {}

  ngOnInit() {
    this.loadItems(this.empresasService.seleccionada.toString());
  }
cambiarTab(){}

loadItems(emp: Empresa | string) {
    let params = typeof(emp) == "string" ? emp : emp.id
    let parametros = '&idempresa=' + params+"&entidad=produccion_orden";

        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            this.itemActivo = 0;
            // Vaciar la lista actual
            this.items = [];
            this.items.push(this.item1);
            if (response.success == 'true' && response.data) {
              for (let element of response.data) {
                this.items.push(new ProduccionOrden(element.id,element.idempresa,element.numlote,new Date(element.fecha_inicio),new Date(element.fecha_fin),new Date(element.fecha_caducidad),element.responsable,element.cantidad,element.tipo_medida,element.nombre,element.familia,element.estado));
              }
             // this.listaZonas.emit(this.limpiezas);
            }
        });
   }
seleccionarItem(valor: number){

  this.itemSeleccionado.emit(this.items[valor]);
  this.itemActivo = this.items[valor].id;
}

crearItem(){
this.nuevoItem.idempresa = this.empresasService.seleccionada;
this.nuevoItem.nombre = this.nuevoItem.numlote;
let param = "&entidad=produccion_orden";
    this.servidor.postObject(URLS.STD_ITEM, this.nuevoItem,param).subscribe(
      response => {
        if (response.success) {
          this.nuevoItem.id = response.id;
          this.items.push(this.nuevoItem);
          this.nuevoItem = new ProduccionOrden(0,0,'',new Date(),new Date());
        }
    });
}


modificar(){
 // let prov = new Proveedor(this.nuevoNombre,this.empresasService.seleccionada,this.itemActivo);
 let index = this.items.findIndex((prov) => prov.id == this.itemActivo);
let prov = this.items[index];
prov.nombre=this.nuevoNombre;
let param = "&entidad=produccion_orden";
let parametros = '?id=' + this.itemActivo+param;     
    this.servidor.putObject(URLS.STD_ITEM,parametros, prov).subscribe(
      response => {
        if (response.success) {
          console.log("updated");
          let index = this.items.findIndex((elem) =>elem.id == this.itemActivo);
          this.items[index].nombre = this.nuevoNombre;
          //this.listaZonas.emit(this.limpiezas);
          this.modificaItem = false;
        }
    });
}

  cerrarModal(event: boolean) {
    this.modal.visible = false;
    if (event) {
      let parametros = '?id=' + this.itemActivo+'&entidad=produccion_orden';
      this.servidor.deleteObject(URLS.STD_ITEM, parametros).subscribe(
        response => {
          if (response.success) {
            let indice = this.items.findIndex((limpieza) => limpieza.id == this.itemActivo);
           // let indice = this.mantenimientos.indexOf(controlBorrar);
            this.items.splice(indice, 1);
          }
      });
    }
  }
eliminarItem(){
      this.modal.titulo = 'produccion.borrarOrdenT';
    this.modal.subtitulo = 'produccion.borrarOrdenST';
    this.modal.eliminar = true;
    this.modal.visible = true;
}

modificarItem(){
this.modificaItem = !this.modificaItem;
}

}