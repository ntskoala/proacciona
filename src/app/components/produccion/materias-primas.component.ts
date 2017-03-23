import { Component, OnInit, Input, OnChanges } from '@angular/core';
//import {SelectItem} from 'primeng/primeng';
import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { ProveedorLoteProducto } from '../../models/proveedorlote';
import { Proveedor } from '../../models/proveedor';
import { ProduccionOrden } from '../../models/produccionorden';
import { ProduccionDetalle } from '../../models/producciondetalle';
import { Modal } from '../../models/modal';


export class alerg{
  constructor(
    public id:number,
    public nombre:string
  ){}
}

@Component({
  selector: 'materias-primas',
  templateUrl: './materias-primas.component.html',
  styleUrls:['produccion.css']
})

export class MateriasPrimasComponent implements OnInit, OnChanges{
@Input() orden: ProduccionOrden;
public nuevoItem: ProduccionDetalle = new ProduccionDetalle(0,0,'','','',0,0,0,'');
public passItem: ProduccionDetalle;
//public addnewItem: ProveedorLoteProducto = new ProveedorLoteProducto('','','','',0,0);;
public items: ProduccionDetalle[];
public productos: any[]=[];
public proveedores: any[]=[];
public entrada_productos: any[]=[];
public medidas: string[]=['Kg.','g.','l.','ml.','unidades'];
public guardar = [];
public idBorrar;
public url=[];
public verdoc: boolean = false;
public foto:string;
public maxCantidad:number=0;

public baseurl = URLS.DOCS + this.empresasService.seleccionada + '/proveedores_entradas_producto/';
modal: Modal = new Modal();
entidad:string="&entidad=produccion_detalle";
field:string="&field=idorden&idItem=";//campo de relación con tabla padre
es;

  constructor(private servidor: Servidor,private empresasService: EmpresasService) {}

  ngOnInit() {
      this.getProveedores();
  }

  ngOnChanges(){
    console.log("onChange");
      this.setItems();
     // this.getProductos();
  }






  setItems(){
     console.log('setting items...')
      let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+this.field+this.orden.id; 
        this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
          response => {
            this.items = [];
            if (response.success && response.data) {
              for (let element of response.data) { 
                  this.items.push(new ProduccionDetalle(element.id,element.idorden,element.proveedor,element.producto,element.numlote_proveedor,element.idmateriaprima,element.idloteinterno,element.cantidad,element.tipo_medida));
             }
            }
        },
        error=>console.log(error),
        ()=>{}
        );
  }

getProductos(idProveedor:number){
  if (idProveedor > 0){
         let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=proveedores_productos&field=idproveedor&idItem="+idProveedor; 
        this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
          response => {
            this.productos = [];
            if (response.success && response.data) {
              for (let element of response.data) { 
                  this.productos.push({"id":element.id,"nombre":element.nombre});
             }
            }
        },
        error=>console.log(error),
        ()=>{}
        ); 
  }else{
    this.productos =[];
    this.productos.push({"id":0,"nombre":"lote interno"});
  }
}

getEntradasProducto(idProducto: number){ ///LOTES DE PROVEEDOR
  if (idProducto > 0){
         let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=proveedores_entradas_producto&field=idproducto&idItem="+idProducto+"&where=cantidad_remanente>0"; 
        this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
          response => {
            this.entrada_productos = [];
            if (response.success && response.data) {
              for (let element of response.data) { 
                  this.entrada_productos.push({"id":element.id,"lote":element.numlote_proveedor,"tipo":"lote_proveedor","cantidad":element.cantidad_remanente});
             }
            }
        },
        error=>console.log(error),
        ()=>{}
        ); 
  }else{
           let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=produccion_orden"; 
        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            this.entrada_productos = [];
            if (response.success && response.data) {
              for (let element of response.data) { 
                  this.entrada_productos.push({"id":element.id,"lote":element.numlote,"tipo":"lote_interno","cantidad":element.cantidad_remanente});
             }
            }
        },
        error=>console.log(error),
        ()=>{}
        ); 
  }
}

getProveedores(){
         let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=proveedores"; 
        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            this.proveedores = [];
            this.proveedores.push({"id":0,"nombre":"Interno"})
            if (response.success && response.data) {
              for (let element of response.data) { 
                  this.proveedores.push({"id":element.id,"nombre":element.nombre});
             }
            }
        },
        error=>console.log(error),
        ()=>{}
        ); 
}


  newItem() {
    console.log (this.proveedores.findIndex((prov)=>prov.id==parseInt(this.nuevoItem.proveedor)))
    let param = this.entidad+this.field+this.orden.id;
    this.nuevoItem.id =0;
    this.nuevoItem.idorden = this.orden.id;
    this.nuevoItem.proveedor = this.proveedores[this.proveedores.findIndex((prov)=>prov.id==parseInt(this.nuevoItem.proveedor))].nombre;
    this.nuevoItem.producto = this.productos[this.productos.findIndex((prod)=>prod.id==parseInt(this.nuevoItem.producto))].nombre;
    let index_entrada_productos = this.entrada_productos.findIndex((lot)=>lot.id==this.nuevoItem.idmateriaprima);
    this.nuevoItem.numlote_proveedor = this.entrada_productos[index_entrada_productos].lote;
    if (this.entrada_productos[index_entrada_productos].tipo == "lote_interno"){
     this.nuevoItem.idloteinterno = this.nuevoItem.idmateriaprima;
    this.nuevoItem.idmateriaprima = 0;
    }
    this.passItem = this.nuevoItem
    //this.nuevoItem.idempresa = this.empresasService.seleccionada;
    //this.addnewItem = this.nuevoItem;
    this.servidor.postObject(URLS.STD_ITEM, this.nuevoItem,param).subscribe(
      response => {
        if (response.success) {
          this.items.push(this.nuevoItem);
          this.items[this.items.length-1].id= response.id;
          this.passItem.id = response.id
          this.setRemanente(this.passItem);
        }
    },
    error =>console.log(error),
    () =>this.setItems()   
    );

   this.nuevoItem =  new ProduccionDetalle(0,0,'','','',0,0,0,'');
  }

setRemanente(detalleProduccion: ProduccionDetalle){
  console.log("setRemanente",detalleProduccion)
  if (detalleProduccion.idmateriaprima >0){
        let parametros = '&idempresa=' + this.empresasService.seleccionada+"&idmateriaprima="+detalleProduccion.idmateriaprima+"&cantidad="+detalleProduccion.cantidad; 
        this.servidor.getObjects(URLS.UPDATE_REMANENTE, parametros).subscribe(
          response => {
            this.entrada_productos = [];
            if (response.success && response.data) {
              console.log('updated');
             }
        },
        error=>console.log(error),
        ()=>{}
        ); 
  }else{

  }
}

    itemEdited(idItem: number, fecha?: any) {
    this.guardar[idItem] = true;
    //console.log (fecha.toString());
  }
 saveItem(item: ProveedorLoteProducto,i: number) {
    this.guardar[item.id] = false;
    let parametros = '?id=' + item.id+this.entidad;    
    this.servidor.putObject(URLS.STD_ITEM, parametros, item).subscribe(
      response => {
        if (response.success) {
        }
    });

  }


checkBorrar(idBorrar: number) {
    // Guardar el id del control a borrar
    this.idBorrar = idBorrar;
    // Crea el modal
    this.modal.titulo = 'proveedores.borrarProduccionDetalleT';
    this.modal.subtitulo = 'proveedores.borrarProduccionDetalleST';
    this.modal.eliminar = true;
    this.modal.visible = true;
}
  cerrarModal(event: boolean) {
    this.modal.visible = false;
    if (event) {
      let parametros = '?id=' + this.idBorrar+this.entidad;
      this.servidor.deleteObject(URLS.STD_ITEM, parametros).subscribe(
        response => {
          if (response.success) {
            let controlBorrar = this.items.find(prod => prod.id == this.idBorrar);
            let indice = this.items.indexOf(controlBorrar);
            this.items.splice(indice, 1);
          }
      });
    }
  }

setMaxCantidad(idLote:number){
  
  let index_entrada_productos = this.entrada_productos.findIndex((lot)=>lot.id==idLote);
    this.nuevoItem.cantidad = this.entrada_productos[index_entrada_productos].cantidad;
  this.maxCantidad = this.entrada_productos[index_entrada_productos].cantidad;
console.log(idLote,index_entrada_productos,this.entrada_productos[index_entrada_productos].cantidad);
}



}
