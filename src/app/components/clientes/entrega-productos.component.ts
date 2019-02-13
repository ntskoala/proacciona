import { Component, OnInit, Input, OnChanges, ViewChild, ElementRef } from '@angular/core';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from '@ngx-translate/core';
import { Dropdown } from 'primeng/components/dropdown/dropdown'

import * as moment from 'moment/moment';
//import {SelectItem} from 'primeng/primeng';
import { Servidor } from '../../services/servidor.service';
import { URLS,cal,dropDownMedidas } from '../../models/urls';
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
@ViewChild('choiceOrden') ChoiceOrden: ElementRef;
public nuevoItem: Distribucion =  new Distribucion(null,0,0,null,null,'',new Date(),new Date(),'',null,null,'');
//public addnewItem: ProveedorLoteProducto = new ProveedorLoteProducto('','','','',0,0);;
public items: Distribucion[];
public cols:any[];
public newRow:boolean=false;
public fechas_inicio:Object={fecha_inicio:moment(new Date()).subtract(30,'days').toDate(),fecha_fin:moment(new Date()).toDate()}//ultimos 30 dias
public filtro_inicio:String;
public filtro_fin:String;
public productos: ProductoPropio[]=[];
public ordenes: ProduccionOrden[] =[];
public dropDownProductos: object[]=[];
public dropDownOrdenes: object[] =[];
// public medidas: string[]=['Kg.','g.','l.','ml.','unidades'];
public medidas: object[]=dropDownMedidas;

public guardar = [];
public remanentesEditados = []
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
filterDates:string="&filterdates=true&fecha_inicio="+this.empresasService.currentStartDate+"&fecha_fin="+moment().format("YYYY-MM-DD")+"&fecha_field=fecha_inicio";

public es;
//***   EXPORT DATA */
public exportar_informes: boolean =false;
public exportando:boolean=false;
public informeData:any;
//***   EXPORT DATA */


  constructor(
    public servidor: Servidor,
    public empresasService: EmpresasService,
    public translate: TranslateService,
    private messageService: MessageService
    ) {}

  ngOnInit() {
     // this.setItems();
     this.getAllLotesProducto();
     this.es=cal;
        this.cols = [
          { field: 'idproductopropio', header: 'clientes.producto', type: 'custom', width:160,orden:true,'required':true },
          { field: 'idordenproduccion', header: 'clientes.numlote', type: 'custom', width:120,orden:true,'required':true },
          { field: 'fecha', header: 'clientes.fecha', type: 'fecha', width:120,orden:true,'required':true },
          { field: 'fecha_caducidad', header: 'proveedores.fecha_caducidad', type: 'fecha', width:120,orden:true,'required':true },
          { field: 'cantidad', header: 'proveedores.cantidad', type: 'std', width:90,orden:true,'required':true },
          { field: 'tipo_medida', header: 'proveedores.tipo medida', type: 'dropdown', width:120,orden:false,'required':true }
        ];
  }
  ngOnChanges(){
    console.log("onChange");
      //this.setItems();
      this.getProductos();

  }

  getOptions(option){
    //console.log('*****',option);
    switch (option[0]){
    case 'idproductopropio':
    return this.dropDownProductos;
    break;
    case 'idordenproduccion':
    return this.dropDownOrdenes;
    break;
    case 'tipo_medida':
    return this.medidas;
    break;

    }
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
       parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+this.field+this.cliente.id+filterDates+"&order=fecha desc"; 
     }else{
       parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+this.field+this.cliente.id+"&order=fecha desc"; 
     }
      //let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+this.field+this.cliente.id+filterDates; 
        this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
          response => {
            this.items = [];
            if (response.success && response.data) {
              for (let element of response.data) { 
                  this.items.push(new Distribucion(element.id,element.idempresa,element.idcliente,element.idproductopropio,element.idordenproduccion,element.numlote,new Date(element.fecha),new Date(element.fecha_caducidad),element.responsable,element.cantidad,element.tipo_medida,element.alergenos));
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
                  this.dropDownProductos.push({'label':element.nombre,'value':element.id});

             }
            }
        },
        error=>console.log(error),
        ()=>{
          //this.setItems()
          this.setDates();
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
    console.log(this.newItem);
    let index = this.dropDownOrdenes.findIndex((ordre)=>ordre["value"]==orden);
    this.nuevoItem.numlote = this.dropDownOrdenes[index]["label"]
    console.log(this.newItem)
    //this.addnewItem = this.nuevoItem;
    this.servidor.postObject(URLS.STD_ITEM, this.nuevoItem,param).subscribe(
      response => {
        if (response.success) {
          this.items.push(this.nuevoItem);
          this.items[this.items.length-1].id= response.id;
          this.saveRemanente(orden);
          this.nuevoItem =  new Distribucion(null,0,0,null,null,'',new Date(),new Date(),'',null,null,'');
        }
    },
    error =>console.log(error),
    () =>this.setDates() 
    );

   
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

updateRemanente(valor,idOrden){

  let value = "*`remanente`+"+valor;
   let  orden = {'remanente':value}
  
    let parametros = '?id=' + idOrden+"&entidad=produccion_orden";    
    this.servidor.putObject(URLS.STD_ITEM, parametros, orden).subscribe(
      response => {
        if (response.success) {
          
        }
    });
}

onEdit(event){
  console.log(event);
  if (this.guardar[event.data.id] != true) this.remanentesEditados[event.data.id] = event.data.cantidad;
  this.itemEdited(event.data.id);
}
    itemEdited(idItem: number, fecha?: any) {
     
    this.guardar[idItem] = true;
    console.log (this.remanentesEditados);
  }


  saveAll(){
    for (let x=0;x<this.guardar.length;x++){
      if (this.guardar[x]==true) {
        let indice = this.items.findIndex((myitem)=>myitem.id==x);
        console.log ("id",x,this.items[indice]);
        this.saveItem(this.items[indice],indice)
      }
    }
}

saveItem(item: Distribucion,i: number) {
  this.guardar[item.id] = false;
  let parametros = '?id=' + item.id+this.entidad;  
  item.fecha_caducidad =  new Date(Date.UTC(item.fecha_caducidad.getFullYear(), item.fecha_caducidad.getMonth(), item.fecha_caducidad.getDate()));
  item.fecha =  new Date(Date.UTC(item.fecha.getFullYear(), item.fecha.getMonth(), item.fecha.getDate()));
  
  this.servidor.putObject(URLS.STD_ITEM, parametros, item).subscribe(
    response => {
      if (response.success) {
        if (this.remanentesEditados[item.id] != item.cantidad)
        {
          let valor = this.remanentesEditados[item.id] - item.cantidad;
          this.updateRemanente(valor,item.idordenproduccion)
        }
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
            console.log(controlBorrar,indice,this.items[indice])
            this.updateRemanente(this.items[indice].cantidad,this.items[indice].idordenproduccion);
            this.items.splice(indice, 1);
          }
      });
    }
  }

// getLotesProducto(idProducto: any){
//   console.log(idProducto);
//   this.nuevoItem.idordenproduccion=null;
//   let URL;
//   (idProducto ==0 || idProducto == null)? URL = URLS.STD_ITEM: URL = URLS.STD_SUBITEM;
//            let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=produccion_orden"+"&field=idproductopropio&idItem="+idProducto; 
//         this.servidor.getObjects(URL, parametros).subscribe(
//           response => {
//             this.dropDownOrdenes = [];
//             if (response.success && response.data) {
//               for (let element of response.data) { 
//                   this.dropDownOrdenes.push({'label':element.numlote,'value':element.id});
//              }
//             }
//         },
//         error=>console.log(error),
//         ()=>{
//           }
//         ); 
// }

getLotesProducto(idProducto: any){
//this.ChoiceOrden.resetFilter();

this.dropDownOrdenes =  this.ordenes.filter((orden)=>orden.idproductopropio == idProducto).map((ordre)=>{
        return {'label':ordre.numlote,'value':ordre.id}
     })

}


getAllLotesProducto(){
  this.nuevoItem.idordenproduccion=null;
  let URL = URLS.STD_ITEM;
        let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=produccion_orden"+this.filterDates; ; 
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
  console.log('cheking',!isNaN(this.nuevoItem.cantidad),+this.nuevoItem.cantidad <= +this.cantidadMaxima, moment(this.nuevoItem.fecha_caducidad).isValid(), this.cantidadMaxima);

if (!isNaN(this.nuevoItem.cantidad) && moment(this.nuevoItem.fecha_caducidad).isValid()){
  let index = this.ordenes.findIndex((orden) => orden.id== this.nuevoItem.idordenproduccion);
  this.ordenes[index].remanente -= this.nuevoItem.cantidad;
  return true
}else{ 
  this.setAlerta("alertas.entregaNotOk");
  return false
}
}

setAlerta(concept:string){
  let concepto;
  this.translate.get(concept).subscribe((valor)=>concepto=valor)  
  this.messageService.clear();this.messageService.add(
    {severity:'warn', 
    summary:'Info', 
    detail: concepto
    }
  );
}

setDates(){
  this.filtro_inicio = moment(new Date (this.fechas_inicio['fecha_inicio'])).format('YYYY-MM-DD').toString();
  this.filtro_fin = moment(new Date (this.fechas_inicio['fecha_fin'])).format('YYYY-MM-DD').toString();
   this.setItems("&filterdates=true&fecha_field=fecha&fecha_inicio="+ this.filtro_inicio +  "&fecha_fin="+this.filtro_fin);
 }
// excel(){
//   console.log("send to excel");

//  let columnas=['producto','numlote','fecha','fecha_caducidad','cantidad','tipo_medida'];
//  let data=[];
//  this.items.forEach((item)=>{
//    let indice = this.productos.findIndex((prod)=>prod.id == item.idproductopropio);
//    let producto;
//    (indice<=0)?producto="":producto= this.productos[indice].nombre;
   
//    data.push({'producto':producto,'numlote':item.numlote,'fecha':moment(item.fecha).format('DD-MM-YYYY'),'fecha_caducidad':moment(item.fecha_caducidad).format('DD-MM-YYYY'),'cantidad':item.cantidad,'tipo_medida':item.tipo_medida})
//  });
// var csvData = this.ConvertToCSV(columnas, data);
//     var a = document.createElement("a");
//     a.setAttribute('style', 'display:none;');
//     document.body.appendChild(a);
//     var blob = new Blob([csvData], { type: 'text/csv' });
//     var url= window.URL.createObjectURL(blob);
//     //window.open(url,'_blank');
//     a.href = url;
    
//     a.download = 'entrega_Productos'+this.cliente.nombre+'.csv';
//     a.click();
// }

// ConvertToCSV(controles,objArray){
// var cabecera =  typeof controles != 'object' ? JSON.parse(controles) : controles;
// var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
//             var str = '';
//             var row = "";
//             //row += "Usuario;Fecha;"
//             for (var i = 0; i < cabecera.length; i++) {
//               row += cabecera[i] + ';';
//             }
//             row = row.slice(0, -1);
//             //append Label row with line break
//             str += row + '\r\n';
 
//             for (var i = 0; i < array.length; i++) {
                
//                 var line ="";//array[i].usuario+";"+array[i].fecha + ";";

//               for (var x = 0; x < cabecera.length; x++) {
//                 let columna = cabecera[x];
//                 let resultado = array[i][cabecera[x]];
//               line += ((array[i][cabecera[x]] !== undefined) ?array[i][cabecera[x]] + ';':';');
//             }
//             line = line.slice(0,-1);
//                 str += line + '\r\n';
//             }
//             return str;
// }





openNewRow(){
  //this.nuevoMantenimiento =  new MantenimientosMaquina(0,0,'','');
  console.log('newRow',this.newRow);
  this.newRow = !this.newRow;
  }
  closeNewRow(){
    //this.nuevoMantenimiento =  new MantenimientosMaquina(0,0,'','');
    this.newRow = false;
    }
      //**** EXPORTAR DATA */

  async exportarTable(){
    this.exportando=true;
    this.informeData = await this.ConvertToCSV(this.cols, this.items);
  }

  informeRecibido(resultado){
    console.log('informe recibido:',resultado);
    if (resultado){
      setTimeout(()=>{this.exportando=false},1500)
    }else{
      this.exportando=false;
    }
  }

  ConvertToCSV(controles,objArray){
    var cabecera =  typeof controles != 'object' ? JSON.parse(controles) : controles;
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    console.log(cabecera,array)
    let informeCabecera=[];
    let informeRows=[];
                var str = '';
                var row = "";
                let titulo="";
                for (var i = 0; i < cabecera.length; i++) {
                  this.translate.get(cabecera[i]["header"]).subscribe((desc)=>{titulo=desc});
                  row += titulo + ';';
                }
                row = row.slice(0, -1);
                informeCabecera = row.split(";");

                str='';
                for (var i = 0; i < array.length; i++) {
                  var line ="";
                   for (var x = 0; x < cabecera.length; x++) {
                  
                    let valor='';
                    
                    switch (cabecera[x]['type']){
                      case 'fecha':
                      valor = moment(array[i][cabecera[x]['field']]).format('DD-MM-YYYY');
                      break;
                      case 'dropdown':
                      valor = (array[i][cabecera[x]['field']]==null)?'':this.getDropDownValor(cabecera[x]['field'], array[i][cabecera[x]['field']]);
                      break;
                      case 'custom':
                      valor = (array[i][cabecera[x]['field']]==null)?'':this.getDropDownValor(cabecera[x]['field'], array[i][cabecera[x]['field']]);
                      break;
                      case 'periodicidad':
                      valor= JSON.parse(array[i][cabecera[x]['field']])["repeticion"];
                      break;
                      default:
                      valor = (array[i][cabecera[x]['field']]==null)?'':array[i][cabecera[x]['field']];
                      break;
                    }

                  line += valor + ';';
                }
                line = line.slice(0,-1);

                    informeRows.push(line.split(";"));
    
                }
                let informe='';
                this.translate.get('clientes.entregaproductos').subscribe((desc)=>{informe=desc + ' a ' + this.cliente.nombre});
                return {'cabecera':[informeCabecera],'rows':informeRows,'comentarios':[],'informes':informe};
    }

    getDropDownValor(tabla,valor){
      let Value;
      let index
      switch (tabla){
        case 'idproductopropio':
        index=this.dropDownProductos.findIndex((prod)=>prod["value"]==valor);
        if (index>-1)
        Value = this.dropDownProductos[index]["label"];
        return Value;
        break;
        case 'idordenproduccion':
        index=this.ordenes.findIndex((prod)=>prod["id"]==valor);
        console.log(this.ordenes,index,valor);
        if (index>-1)
        Value = this.ordenes[index]["numlote"];
        break;
        case 'tipo_medida':
         index=this.medidas.findIndex((medida)=>medida["value"]==valor);
        if (index>-1)
        Value = this.medidas[index]["label"];
        return Value;       
        break;
      }
      console.log(tabla,valor,Value,moment().format("HH:mm:SS"));
      return Value;
    }




}
