import { Component, OnInit, Input, Output, EventEmitter,ViewChild, OnChanges } from '@angular/core';
import * as moment from 'moment/moment';

import { EmpresasService } from '../../services/empresas.service';
import { Servidor } from '../../services/servidor.service';
import { Empresa } from '../../models/empresa';
import { ProduccionOrden } from '../../models/produccionorden';
import { Modal } from '../../models/modal';
import { URLS } from '../../models/urls';
import {MatSelect, MatTooltip} from '@angular/material';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'listado-ordenes-produccion',
  templateUrl: './listado-ordenes-produccion.component.html',
  styleUrls:['./produccion.css']
})

export class ListadoOrdenesProduccionComponent implements OnInit,OnChanges {
//*** STANDARD VAR
 @ViewChild('choiceEstat') ChoiceEstat: MatSelect;
  @ViewChild('choicer') Choicer: MatSelect;
  @ViewChild('ff') f2: MatTooltip;
@Output() itemSeleccionado: EventEmitter<ProduccionOrden> = new EventEmitter<ProduccionOrden>();
public itemActivo: number;
public items: ProduccionOrden[]=[];//Array de Items para el desplegable;
public  nuevoItem: ProduccionOrden;
public item1:ProduccionOrden = new ProduccionOrden(0,0,'Selecciona',new Date(),new Date(),new Date());
public  modal: Modal = new Modal();
public  modificaItem: boolean;
public  nuevoNombre:string;
public estado:string='abierto';
public element;
//*** ESPECIFIC VAR */
public fechas_inicio:Object={fecha_inicio:moment(new Date()).subtract(30,'days').format('YYYY-MM-DD').toString(),fecha_fin:moment(new Date()).format('YYYY-MM-DD').toString()}//ultimos 30 dias
public filtro_inicio:String;
public filtro_fin:String;
public filter:boolean=false;
public botones;
public botonActual=-1;
  constructor(public empresasService: EmpresasService, public servidor: Servidor) {}

  ngOnInit() {

    // this.botones = window.document.getElementsByTagName('button');
    // this.nextBocadillo('ok');

    this.expand(this.ChoiceEstat)
  }
  ngOnChanges(){
    this.f2.show();
  }
cambiarTab(){}
nextBocadillo($event){
  this.botonActual++;
  console.log(this.botonActual,this.botones,this.botones[this.botonActual].parentElement);
  if(this.botones[this.botonActual].parentElement=='div.tooltip') console.log('OK')
  console.log(this.botones[this.botonActual].parentElement.attributes["ng-reflect-message"].nodeValue);
  this.element=this.botones[this.botonActual].getBoundingClientRect();
}
loadItems(emp: Empresa | string, estat:string,filterDates?:string) {
    let params = typeof(emp) == "string" ? emp : emp.id;
     let parametros ="";
      if (filterDates){
       parametros = '&idempresa=' + params+"&entidad=produccion_orden&order=id DESC&WHERE=estado=&valor="+estat+filterDates; 
     }else{
       parametros = '&idempresa=' + params+"&entidad=produccion_orden&order=id DESC&WHERE=estado=&valor="+estat+"";
     }
    

        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            this.itemActivo = 0;
            // Vaciar la lista actual
            this.items = [];
            this.items.push(this.item1);
            if (response.success == 'true' && response.data) {
              for (let element of response.data) {
                this.items.push(new ProduccionOrden(element.id,element.idempresa,element.numlote,new Date(element.fecha_inicio),new Date(element.fecha_fin),new Date(element.fecha_caducidad),element.responsable,element.cantidad,element.remanente,element.tipo_medida,element.idproductopropio,element.nombre,element.familia,element.estado,element.idalmacen,element.idcliente));
              }
             console.log(this.items);
            }
        },
        (error) => console.log(error),
        ()=>{
          this.expand(this.Choicer);
        }
        );
   }

quitaSeleccionado(){
  this.itemSeleccionado.emit(null);
}   
seleccionarItem(event: any){
  console.log('LOTE SELECCIONADO',event);
  this.itemSeleccionado.emit(this.items[event.value]);
  this.itemActivo = this.items[event.value].id;
    this.unExpand(this.Choicer);
}


crearItem(){
this.nuevoItem.numlote = this.nuevoNombre;
this.nuevoItem.idempresa = this.empresasService.seleccionada;
this.nuevoItem.fecha_inicio = new Date();
this.nuevoItem.fecha_fin = new Date();
this.nuevoItem.fecha_caducidad = new Date();
//this.nuevoItem.nombre = this.nuevoItem.numlote;
this.nuevoItem.estado = 'abierto';
let param = "&entidad=produccion_orden";
    this.servidor.postObject(URLS.STD_ITEM, this.nuevoItem,param).subscribe(
      response => {
        if (response.success) {
          this.nuevoItem.id = response.id;
          this.items.push(this.nuevoItem);
          this.nuevoItem = null;
          this.expand(this.Choicer);
        }
    });
}


modificar(){
 // let prov = new Proveedor(this.nuevoNombre,this.empresasService.seleccionada,this.itemActivo);
 let index = this.items.findIndex((prov) => prov.id == this.itemActivo);
let prov = this.items[index];
prov.nombre=this.nuevoNombre;
prov.numlote=this.nuevoNombre;

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
            //this.seleccionarItem(0);
            this.expand(this.Choicer);
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

// modificarItem(){
// (this.nuevoItem)? this.nuevoItem = null :this.modificaItem = !this.modificaItem;

// }

// addItem(){
//   this.modificaItem=false;
//   this.nuevoItem= new ProduccionOrden(0,0,'',new Date(),new Date());
// }
modificarItem(){
  this.nuevoNombre = this.items[this.items.findIndex((item)=>item.id==this.itemActivo)].numlote;
(this.nuevoItem)? this.nuevoItem = null :this.modificaItem = !this.modificaItem;
}

addItem(){
  this.nuevoNombre='';
  this.modificaItem=false;
  this.nuevoItem = new ProduccionOrden(0,0,'',new Date(),new Date());
}

expand(list: MatSelect){
setTimeout(()=>{list.open();},200)
}

unExpand(list: MatSelect){
  list.close();
}


// changeEstado(){
//   console.log('cambiando');
//   this.estado == "abierto"? this.estado="cerrado":this.estado="abierto";
//   this.loadItems(this.empresasService.seleccionada.toString(), this.estado);
// }
changeEstado(event: any){
  this.f2.show();
  console.log('cambio estado',event)
  this.Choicer.value=null;
  //this.loadItems(this.empresasService.seleccionada.toString(), estado);
  this.estado = event.value;
  this.setDates(this.fechas_inicio);
  this.unExpand(this.ChoiceEstat);
  this.quitaSeleccionado();
}


setDates(dates:any){
this.filter = false;
if (dates!= 'void'){
  this.fechas_inicio = dates;
 this.filtro_inicio = moment(new Date (dates['fecha_inicio'])).format('DD-MM-YYYY').toString();
 this.filtro_fin = moment(new Date (dates['fecha_fin'])).format('DD-MM-YYYY').toString();
  this.loadItems(this.empresasService.seleccionada.toString(), this.estado,"&filterdates=true&fecha_field=fecha_inicio&fecha_inicio="+ dates['fecha_inicio'] +  "&fecha_fin="+dates['fecha_fin']);
}
}

}