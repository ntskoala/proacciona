import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';

import * as moment from 'moment/moment';


import { EmpresasService } from '../../services/empresas.service';
import { Servidor } from '../../services/servidor.service';
import { Empresa } from '../../models/empresa';
import { ProduccionOrden } from '../../models/produccionorden';
import { Modal } from '../../models/modal';
import { URLS,cal,dropDownMedidas } from '../../models/urls';
import { Almacen } from '../../models/almacenes';
import { ProductoPropio } from '../../models/productopropio';

@Component({
  selector: 'ficha-produccion',
  templateUrl: './ficha-produccion.component.html',
  styleUrls:['./produccion.css']
})
export class FichaProduccionComponent implements OnInit, OnChanges {
//*** STANDARD VAR
@Input() orden: ProduccionOrden;
@Output() itemSeleccionado: EventEmitter<ProduccionOrden> = new EventEmitter<ProduccionOrden>();




//*** ESPECIFIC VAR */
public modo: string;
public es:any;
public trazabilidad: boolean;
public trazabilidadAd:boolean;
public almacenesDestino: Almacen[];
public productos: ProductoPropio[]=[];
//public medidas: string[]=['Kg.','g.','l.','ml.','unidades'];
public medidas:object[]=dropDownMedidas;
public url; 
public baseurl;
public foto;

  constructor(public empresasService: EmpresasService, public servidor: Servidor) {}

  ngOnInit() {
    this.getProductos();
    this.getAlmacenes();
    this.es=cal;
    this.baseurl = URLS.DOCS + this.empresasService.seleccionada + '/produccion_orden/';
    this.url = this.baseurl + this.orden.id +'_'+this.orden.doc;
  }
  ngOnChanges(){

    if (!moment(this.orden.fecha_inicio).isValid()) this.orden.fecha_inicio = null;
    if (!moment(this.orden.fecha_fin).isValid()) this.orden.fecha_fin = null;
    if (!moment(this.orden.fecha_caducidad).isValid()) this.orden.fecha_caducidad = null;
    this.url = this.baseurl + this.orden.id +'_'+this.orden.doc;
  }
  
cambiarTab(){}

updateItem(orden: ProduccionOrden){
 orden.id =this.orden.id;
 orden.idempresa = this.empresasService.seleccionada;
 orden.fecha_inicio = new Date(Date.UTC(orden.fecha_fin.getUTCFullYear(),orden.fecha_fin.getMonth(),orden.fecha_fin.getDate()));
 orden.fecha_fin = new Date(Date.UTC(orden.fecha_fin.getUTCFullYear(),orden.fecha_fin.getMonth(),orden.fecha_fin.getDate()));
 orden.fecha_caducidad = new Date(Date.UTC(orden.fecha_caducidad.getUTCFullYear(),orden.fecha_caducidad.getMonth(),orden.fecha_caducidad.getDate()));
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

getAlmacenes() {
    
    let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=almacenes";

        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            //this.itemActivo = 0;
            // Vaciar la lista actual
            this.almacenesDestino = [];
            this.almacenesDestino.push(new Almacen(0,0,'Selecciona',0,0,0));
            if (response.success == 'true' && response.data) {
              for (let element of response.data) {
                this.almacenesDestino.push(new Almacen(element.id,element.idempresa,element.nombre,element.capacidad,element.estado,element.idproduccionordenactual,element.level));
              }
             // this.listaZonas.emit(this.limpiezas);
            }
        });
   }

getProductos(){
         let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=productos"; 
        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            this.productos = [];
            if (response.success && response.data) {
              for (let element of response.data) { 
                  this.productos.push(new ProductoPropio(element.nombre,element.descripcion,element.alergenos,element.doc,element.id,element.idempresa));
             }
            }
        },
        error=>console.log(error),
        ()=>{}
        ); 
}
setIdProductoPropio(id: number){
  let i = this.productos.findIndex((prod) => prod.id==id)
  if (i>=0) this.orden.nombre = this.productos[i].nombre;
}

seleccionarDestino(valor){
  this.orden.idalmacen = this.almacenesDestino[valor].id;
}

trazabilidadAtras(){
  this.modo = 'atras';
this.trazabilidad= !this.trazabilidad;
}
trazabilidadAdelante(){
  this.modo = 'adelante';
  this.trazabilidad= !this.trazabilidad;
// this.trazabilidadAd= !this.trazabilidadAd;
}


verFoto(foto:string){
  //this.verdoc =  true;
  if (this.orden.doc){
  this.foto=this.url;
  }
}


uploadFunciones(event:any,field?:string) {
  var target = event.target || event.srcElement; //if target isn't there then take srcElement
  let files = target.files;
  console.log(target);
  field='doc';
  //let files = event.srcElement.files;
  let idEmpresa = this.empresasService.seleccionada.toString();
  this.servidor.postDoc(URLS.UPLOAD_DOCS, files,'produccion_orden', this.orden.id.toString(), this.empresasService.seleccionada.toString(),field).subscribe(
    response => {
      console.log('doc subido correctamente');
        this.orden.doc = files[0].name;
        this.url = this.baseurl + this.orden.id +'_'+this.orden.doc;          
      // let activa = this.empresas.find(emp => emp.id == this.empresasService.seleccionada);
      // activa.logo = '1';
    }
  )
}


}