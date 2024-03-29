import { Component, OnInit, Input, Output, EventEmitter,ViewChild, ElementRef } from '@angular/core';

import { EmpresasService } from '../../services/empresas.service';
import { Servidor } from '../../services/servidor.service';
import { Empresa } from '../../models/empresa';
import { Cliente } from '../../models/clientes';
import { Modal } from '../../models/modal';
import { URLS } from '../../models/urls';
import {MatSelect} from '@angular/material';
@Component({
  selector: 'listado-clientes',
  templateUrl: './listado-clientes.component.html',
  styleUrls:['./clientes.css']
})
export class ListadoClientesComponent implements OnInit {
//*** STANDARD VAR
 @ViewChild('choicer') Choicer: MatSelect;
@Output() itemSeleccionado: EventEmitter<Cliente> = new EventEmitter<Cliente>();
public itemActivo: number;
public items: Cliente[]=[];//Array de Items para el desplegable;
public  nuevoItem: Cliente;// = new Cliente('',0);
public item1:Cliente = new Cliente('Selecciona',0);
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
    let parametros = '&idempresa=' + params+"&entidad=clientes&order=nombre";

        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            this.itemActivo = 0;
            // Vaciar la lista actual
            this.items = [];
            this.items.push(this.item1);
            if (response.success == 'true' && response.data) {
              for (let element of response.data) {
                this.items.push(new Cliente(element.nombre,element.idempresa,element.contacto,element.telf,element.email,element.id,element.direccion,element.poblacion,element.nrs));
              }
             // this.listaZonas.emit(this.limpiezas);
            }
        },
        (error) => console.log(error),
        ()=>{
          this.expand();
        }
        );
   }
seleccionarItem(event: any){

  this.itemSeleccionado.emit(this.items[event.value]);
  this.itemActivo = this.items[event.value].id;
  this.unExpand();
}

crearItem(cliente: Cliente){
cliente.idEmpresa = this.empresasService.seleccionada;
cliente.nombre = this.nuevoNombre;

let param = "&entidad=clientes";
    this.servidor.postObject(URLS.STD_ITEM, cliente,param).subscribe(
      response => {
        if (response.success) {
          cliente.id = response.id;
          this.items.push(cliente);
          this.nuevoItem = null;
        }
    });
}


modificar(){
 // let prov = new Proveedor(this.nuevoNombre,this.empresasService.seleccionada,this.itemActivo);
 let index = this.items.findIndex((prov) => prov.id == this.itemActivo);
let prov = this.items[index];
prov.nombre=this.nuevoNombre;
let param = "&entidad=clientes";
let parametros = '?id=' + this.itemActivo+param;     
    this.servidor.putObject(URLS.STD_ITEM,parametros, prov).subscribe(
      response => {
        if (response.success) {
          console.log("updated");
          let index = this.items.findIndex((elem) =>elem.id == this.itemActivo);
          this.items[index].nombre = this.nuevoNombre;
          this.modificaItem = false;
        }
    });
}

  cerrarModal(event: boolean) {
    this.modal.visible = false;
    if (event) {
      let parametros = '?id=' + this.itemActivo+'&entidad=clientes';
      this.servidor.deleteObject(URLS.STD_ITEM, parametros).subscribe(
        response => {
          if (response.success) {
            let indice = this.items.findIndex((cliente) => cliente.id == this.itemActivo);
           // let indice = this.mantenimientos.indexOf(controlBorrar);
            this.items.splice(indice, 1);
            this.expand();
          }
      });
    }
  }
eliminarItem(){
      this.modal.titulo = 'clientes.borrarClienteT';
    this.modal.subtitulo = 'clientes.borrarClienteST';
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
  this.nuevoItem = new Cliente('',0);
}

expand(){
setTimeout(()=>{this.Choicer.open();},200)
}
unExpand(){
  this.Choicer.close();
}
}