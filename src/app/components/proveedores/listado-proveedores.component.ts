import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';

import { EmpresasService } from '../../services/empresas.service';
import { Servidor } from '../../services/servidor.service';
import { Empresa } from '../../models/empresa';
import { Proveedor } from '../../models/proveedor';
import { Modal } from '../../models/modal';
import { URLS } from '../../models/urls';
import {MatSelect} from '@angular/material';

@Component({
  selector: 'listado-proveedores',
  templateUrl: './listado-proveedores.component.html',
  styleUrls:['./proveedores.component.css']
})
export class ListadoProveedoresComponent implements OnInit {
//*** STANDARD VAR
 @ViewChild('choicer') Choicer: MatSelect;
@Output() itemSeleccionado: EventEmitter<Proveedor> = new EventEmitter<Proveedor>();
public itemActivo: number;
public items: Proveedor[]=[];//Array de Items para el desplegable;
public  nuevoItem: Proveedor;// = new Proveedor('',0);
public item1:Proveedor = new Proveedor('Selecciona',0);
public  modal: Modal = new Modal();
public  modificaItem: boolean;
public  nuevoNombre:string;

//*** ESPECIFIC VAR */

  constructor(public empresasService: EmpresasService, public servidor: Servidor) {}

  ngOnInit() {
    this.loadItems(this.empresasService.seleccionada.toString());
  }
cambiarTab(){}

loadItems(emp: Empresa | string) {
    let params = typeof(emp) == "string" ? emp : emp.id
    let parametros = '&idempresa=' + params+"&entidad=proveedores&order=nombre";

        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            this.itemActivo = 0;
            // Vaciar la lista actual
            this.items = [];
            this.items.push(this.item1);
            if (response.success == 'true' && response.data) {
              for (let element of response.data) {
                this.items.push(new Proveedor(element.nombre,element.idempresa,element.contacto,element.telf,element.email,element.alert_contacto,element.alert_telf,element.alert_email,element.id,element.direccion,element.poblacion,element.nrs));
              }
             // this.listaZonas.emit(this.limpiezas);
            }
          },
              (error) => {console.log(error)},
              ()=>{
              //this.listaZonas.emit(this.limpiezas);
               //this.expand(this.Choicer.nativeElement);
               this.expand();
              }
        );
   }
seleccionarItem(event: any){

  this.itemSeleccionado.emit(this.items[event.value]);
  this.itemActivo = this.items[event.value].id;
  this.unExpand();
}

crearItem(proveedor: Proveedor){
proveedor.idEmpresa = this.empresasService.seleccionada;
proveedor.nombre = this.nuevoNombre;
let param = "&entidad=proveedores";
    this.servidor.postObject(URLS.STD_ITEM, proveedor,param).subscribe(
      response => {
        if (response.success) {
          proveedor.id = response.id;
          this.items.push(proveedor);
          console.log(this.items);
          this.nuevoItem = null;
        }
    });
}


modificar(){
 // let prov = new Proveedor(this.nuevoNombre,this.empresasService.seleccionada,this.itemActivo);
 let index = this.items.findIndex((prov) => prov.id == this.itemActivo);
let prov = this.items[index];
prov.nombre=this.nuevoNombre;
let param = "&entidad=proveedores";
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
      let parametros = '?id=' + this.itemActivo+'&entidad=proveedores';
      this.servidor.deleteObject(URLS.STD_ITEM, parametros).subscribe(
        response => {
          if (response.success) {
            let indice = this.items.findIndex((limpieza) => limpieza.id == this.itemActivo);
           // let indice = this.mantenimientos.indexOf(controlBorrar);
            this.items.splice(indice, 1);
            this.itemActivo = 0;
            this.itemSeleccionado.emit(this.items[0]);
            this.expand();
          }
      });
    }
  }
eliminarItem(){
      this.modal.titulo = 'proveedores.borrarProveedorT';
    this.modal.subtitulo = 'proveedores.borrarProveedorST';
    this.modal.eliminar = true;
    this.modal.visible = true;
}


modificarItem(){
  this.nuevoNombre = this.items[this.items.findIndex((item)=>item.id==this.itemActivo)].nombre;
(this.nuevoItem)? this.nuevoItem = null :this.modificaItem = !this.modificaItem;
}

addItem(){
  this.nuevoNombre='';
  this.modificaItem=false;
  this.nuevoItem = new Proveedor('',0);
}

expand(){
setTimeout(()=>{this.Choicer.open();},200)
}
unExpand(){
  this.Choicer.close();
}

}