import { Component, OnInit, Input, OnChanges } from '@angular/core';
import * as moment from 'moment/moment';
//import {SelectItem} from 'primeng/primeng';
import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { ProveedorLoteProducto } from '../../models/proveedorlote';
import { ProduccionOrden } from '../../models/produccionorden';
import { ProductoPropio } from '../../models/productopropio';
import { Distribucion } from '../../models/distribucion';
import { Cliente } from '../../models/clientes';
import { Modal } from '../../models/modal';


export class alerg{
  constructor(
    public id:number,
    public nombre:string
  ){}
}

@Component({
  selector: 'entrega-productos',
  templateUrl: './entrega-productos.component.html',
  styleUrls:['clientes.css']
})

export class EntregaProductosComponent implements OnInit, OnChanges{
//@Input() orden: ProduccionOrden;
@Input() cliente: Cliente;
public nuevoItem: Distribucion =  new Distribucion(null,0,0,null,0,'',new Date(),new Date(),'',null,null,'');
//public addnewItem: ProveedorLoteProducto = new ProveedorLoteProducto('','','','',0,0);;
public items: Distribucion[];
public fechas_inicio:Object={fecha_inicio:moment(new Date()).subtract(30,'days').format('YYYY-MM-DD').toString(),fecha_fin:moment(new Date()).format('YYYY-MM-DD').toString()}//ultimos 30 dias
public filtro_inicio:String;
public filtro_fin:String;
public productos: ProductoPropio[]=[];
public ordenes: ProduccionOrden[] =[];
public medidas: string[]=['Kg.','g.','l.','ml.','unidades'];
public guardar = [];
public idBorrar;
public url=[];
public verdoc: boolean = false;
public foto:string;
public cantidadMaxima:number;
public filter:boolean=false;
public baseurl = URLS.DOCS + this.empresasService.seleccionada + '/clientes_distribucion/';
public modal: Modal = new Modal();
public modal2: Modal;
public entidad:string="&entidad=clientes_distribucion";
public field:string="&field=idcliente&idItem=";//campo de relación con tabla padre
public es;

  constructor(public servidor: Servidor,public empresasService: EmpresasService) {}

  ngOnInit() {
     // this.setItems();
      
                 this.es = {
            monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
                'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            dayNames: ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'],
            dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
            dayNamesMin: ["Do","Lu","Ma","Mi","Ju","Vi","Sa"],
            firstDayOfWeek: 1
        }; 
  }
  ngOnChanges(){
    console.log("onChange");
      //this.setItems();
      this.getProductos();
  }



//   photoURL(i,tipo) {
//     let extension = this.items[i].doc.substr(this.items[i].doc.length-3);
//     let url = this.baseurl+this.items[i].id +"_"+this.items[i].doc;
//     if (extension == 'jpg' || extension == 'epg' || extension == 'gif' || extension == 'png'){
//     this.verdoc=!this.verdoc;
//     this.foto = url
//     }else{
//       window.open(url,'_blank');

//     }

//   }




  setItems(filterDates?:string){
    let parametros ="";
     if (filterDates){
       parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+this.field+this.cliente.id+filterDates; 
     }else{
       parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+this.field+this.cliente.id; 
     }
      //let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+this.field+this.cliente.id+filterDates; 
        this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
          response => {
            this.items = [];
            if (response.success && response.data) {
              for (let element of response.data) { 
                  this.items.push(new Distribucion(element.id,element.idempresa,element.idcliente,element.idproductopropio,element.idordenProduccion,element.numlote,new Date(element.fecha),new Date(element.fecha_caducidad),element.responsable,element.cantidad,element.tipo_medida,element.alergenos));
             }
            }
        },
        error=>console.log(error),
        ()=>{}
        );
  }

getProductos(){
         let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=productos"; 
        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            this.productos = [];
            // this.productos.push(new ProductoPropio('selecciona','','','',null,0))
            this.productos.push(new ProductoPropio('todos','','','',0,0))
            if (response.success && response.data) {
              for (let element of response.data) { 
                  this.productos.push(new ProductoPropio(element.nombre,element.descripcion,element.alergenos,element.doc,element.id,element.idempresa));
             }
            }
        },
        error=>console.log(error),
        ()=>{
          //this.setItems()
          this.setDates(this.fechas_inicio);
          }
        ); 
}

  newItem() {
    if (this.check()){
    let param = this.entidad+this.field+this.cliente.id;
    let orden = this.nuevoItem.idordenproduccion;
    this.nuevoItem.idempresa = this.empresasService.seleccionada;
    this.nuevoItem.idcliente = this.cliente.id;
    this.nuevoItem.id = 0;
    //this.addnewItem = this.nuevoItem;
    this.servidor.postObject(URLS.STD_ITEM, this.nuevoItem,param).subscribe(
      response => {
        if (response.success) {
          this.items.push(this.nuevoItem);
          this.items[this.items.length-1].id= response.id;
          this.saveRemanente(orden);
        }
    },
    error =>console.log(error),
    () =>this.setDates(this.fechas_inicio) 
    );

   this.nuevoItem =  new Distribucion(null,0,0,null,0,'',new Date(),new Date(),'',null,null,'');
    }
  }

saveRemanente(idOrden:number){
  let index = this.ordenes.findIndex((orden) => orden.id== idOrden);
  let item: ProduccionOrden = this.ordenes[index];
    let parametros = '?id=' + item.id+"&entidad=produccion_orden";    
    this.servidor.putObject(URLS.STD_ITEM, parametros, item).subscribe(
      response => {
        if (response.success) {
        }
    });
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
    this.modal.titulo = 'proveedores.borrarEntregaProductoT';
    this.modal.subtitulo = 'proveedores.borrarEntregaProductoST';
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

getLotesProducto(idProducto: any){
  console.log(idProducto);
  let URL;
  (idProducto ==0 || idProducto == null)? URL = URLS.STD_ITEM: URL = URLS.STD_SUBITEM;
           let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=produccion_orden"+"&field=idproductopropio&idItem="+idProducto; 
        this.servidor.getObjects(URL, parametros).subscribe(
          response => {
            this.ordenes = [];
            if (response.success && response.data) {
              for (let element of response.data) { 
                  this.ordenes.push(new ProduccionOrden(element.id,element.idempresa,element.numlote,element.fecha_inicio,element.fecha_fin,new Date(element.fecha_caducidad),element.responsable,element.cantidad,element.remanente,element.tipo_medida,element.idproductopropio,element.nombre,element.familia,element.estado,element.idalmacen));
             }
            }
        },
        error=>console.log(error),
        ()=>{
         // let index= this.productos.findIndex((producto) => producto.id == idProducto);
         // this.nuevoItem.alergenos = this.productos[index].alergenos;
          }
        ); 
}
setCaducidad(idLote: number){
console.log(idLote);
let index = this.ordenes.findIndex((orden) => orden.id== idLote);
console.log(this.ordenes[index]);
this.nuevoItem.idordenproduccion = idLote;
this.nuevoItem.numlote = this.ordenes[index].numlote;
this.nuevoItem.fecha_caducidad = this.ordenes[index].fecha_caducidad;
this.nuevoItem.cantidad = this.ordenes[index].remanente;
this.cantidadMaxima = this.ordenes[index].remanente;
this.nuevoItem.tipo_medida = this.ordenes[index].tipo_medida;
console.log(this.nuevoItem);
}


check(){
  console.log('cheking',!isNaN(this.nuevoItem.cantidad),this.nuevoItem.cantidad < this.cantidadMaxima, this.cantidadMaxima);

if (!isNaN(this.nuevoItem.cantidad) && this.nuevoItem.cantidad < this.cantidadMaxima){
  let index = this.ordenes.findIndex((orden) => orden.id== this.nuevoItem.idordenproduccion);
  this.ordenes[index].remanente -= this.nuevoItem.cantidad;
  return true
}else{ return false}
}

setDates(dates:any){
this.filter = false;
if (dates!= 'void'){
  this.fechas_inicio = dates;
 this.filtro_inicio = moment(new Date (dates['fecha_inicio'])).format('DD-MM-YYYY').toString();
 this.filtro_fin = moment(new Date (dates['fecha_fin'])).format('DD-MM-YYYY').toString();
  this.setItems("&filterdates=true&fecha_field=fecha&fecha_inicio="+ dates['fecha_inicio'] +  "&fecha_fin="+dates['fecha_fin']);
}
}
excel(){
  console.log("send to excel");

 let columnas=['producto','numlote','fecha','fecha_caducidad','cantidad','tipo_medida'];
 let data=[];
 this.items.forEach((item)=>{
   let indice = this.productos.findIndex((prod)=>prod.id == item.idproductopropio);
   let producto;
   (indice<=0)?producto="":producto= this.productos[indice].nombre;
   
   data.push({'producto':producto,'numlote':item.numlote,'fecha':moment(item.fecha).format('DD-MM-YYYY'),'fecha_caducidad':moment(item.fecha_caducidad).format('DD-MM-YYYY'),'cantidad':item.cantidad,'tipo_medida':item.tipo_medida})
 });
var csvData = this.ConvertToCSV(columnas, data);
    var a = document.createElement("a");
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);
    var blob = new Blob([csvData], { type: 'text/csv' });
    var url= window.URL.createObjectURL(blob);
    //window.open(url,'_blank');
    a.href = url;
    
    a.download = 'entrega_Productos'+this.cliente.nombre+'.csv';
    a.click();
}

ConvertToCSV(controles,objArray){
var cabecera =  typeof controles != 'object' ? JSON.parse(controles) : controles;
var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
            var str = '';
            var row = "";
            //row += "Usuario;Fecha;"
            for (var i = 0; i < cabecera.length; i++) {
              row += cabecera[i] + ';';
            }
            row = row.slice(0, -1);
            //append Label row with line break
            str += row + '\r\n';
 
            for (var i = 0; i < array.length; i++) {
                
                var line ="";//array[i].usuario+";"+array[i].fecha + ";";

              for (var x = 0; x < cabecera.length; x++) {
                let columna = cabecera[x];
                let resultado = array[i][cabecera[x]];
              line += ((array[i][cabecera[x]] !== undefined) ?array[i][cabecera[x]] + ';':';');
            }
            line = line.slice(0,-1);
                str += line + '\r\n';
            }
            return str;
}
}
