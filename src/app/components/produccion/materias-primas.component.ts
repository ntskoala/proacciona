import { Component, OnInit, Input, OnChanges } from '@angular/core';
//import {SelectItem} from 'primeng/primeng';
import * as moment from 'moment/moment';
import { TranslateService } from '@ngx-translate/core';

import { Servidor } from '../../services/servidor.service';
import { URLS,dropDownMedidas } from '../../models/urls';
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
public nuevoItem: ProduccionDetalle = new ProduccionDetalle(0,0,null,null,null,null,0,0,'');
public passItem: ProduccionDetalle;
//public addnewItem: ProveedorLoteProducto = new ProveedorLoteProducto('','','','',0,0);;
public items: ProduccionDetalle[];
public productos: any[]=[];
public proveedores: any[]=[];
public entrada_productos: any[]=[];
public medidas: object[]=dropDownMedidas;

public guardar = [];
public remanentesEditados = [];
public idBorrar;
public url=[];
public verdoc: boolean = false;
public foto:string;
public maxCantidad:number=0;

public baseurl = URLS.DOCS + this.empresasService.seleccionada + '/proveedores_entradas_producto/';
public modal: Modal = new Modal();
public modal2: Modal;
entidad:string="&entidad=produccion_detalle";
field:string="&field=idorden&idItem=";//campo de relación con tabla padre
public es;

public cols:any[];
public newRow:boolean=false;
//***   EXPORT DATA */
public exportar_informes: boolean =false;
public exportando:boolean=false;
public informeData:any;
//***   EXPORT DATA */
  constructor(
    public servidor: Servidor,
    public empresasService: EmpresasService,
    public translate: TranslateService
    ) {}

  ngOnInit() {
      this.getProveedores();
      this.cols = [
        { field: 'proveedor', header: 'proveedores.proveedor', type: 'custom', width:160,orden:true,'required':true, 'disabled':true,'function':'getProductos($event.target.value)' },
        { field: 'producto', header: 'proveedores.producto', type: 'custom', width:120,orden:true,'required':true, 'disabled':true,'function':'getProductos($event.target.value)' },
        { field: 'idmateriaprima', header: 'proveedores.lote', type: 'custom', width:120,orden:true,'required':true, 'disabled':true,'function':'getProductos($event.target.value)' },
        { field: 'cantidad', header: 'proveedores.cantidad', type: 'std', width:90,orden:true,'required':true, 'disabled':false },
        { field: 'tipo_medida', header: 'proveedores.tipo medida', type: 'dropdown', width:120,orden:false,'required':true, 'disabled':false }
      ];
  }

  ngOnChanges(){
    console.log("onChange");
      this.setItems();
     // this.getProductos();
  }

  getOptions(option){
    //console.log('*****',option);
    switch (option[0]){
    case 'proveedor':
    return this.proveedores;
    break;
    case 'producto':
    return this.productos;
    break;
    case 'tipo_medida':
    return this.medidas;
    break;
    case 'idmateriaprima':
    return this.entrada_productos;
    break;    
    }
    }




  setItems(){
     console.log('setting items...')
      let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+this.field+this.orden.id; 
        this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
          response => {
            this.items = [];
            if (response.success && response.data) {
              for (let element of response.data) { 
                  this.items.push(new ProduccionDetalle(element.id,element.idorden,element.proveedor,element.producto,element.numlote_proveedor,element.idmateriaprima,element.idloteinterno,element.cantidad,element.tipo_medida,parseInt(element.cantidad_remanente_origen)));
             }
             console.log(this.items)
            }
        },
        error=>console.log(error),
        ()=>{}
        );
  }

getProductos(idProveedor:number){
  console.log(idProveedor);
  if (idProveedor > 0){
         let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=proveedores_productos&field=idproveedor&idItem="+idProveedor; 
        this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
          response => {
            this.productos = [];
            this.entrada_productos = [];
            this.nuevoItem.producto=null;
            this.nuevoItem.idmateriaprima=null;
            if (response.success && response.data) {
              for (let element of response.data) { 
                  this.productos.push({"value":element.id,"label":element.nombre});
             }
            }
        },
        error=>console.log(error),
        ()=>{}
        ); 
  }else{
    this.productos =[];
    this.entrada_productos = [];
    this.nuevoItem.producto=null;
    this.nuevoItem.idmateriaprima=null;
    this.productos.push({"value":0,"label":"lote interno"});
  }
}

getEntradasProducto(idProducto: number){ ///LOTES DE PROVEEDOR
  console.log('getEntradasProducto',idProducto)
  if (idProducto > 0){
         let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=proveedores_entradas_producto&field=idproducto&idItem="+idProducto+"&WHERE=cantidad_remanente>0&order=fecha_entrada"; 
        this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
          response => {
            this.entrada_productos = [];
            this.nuevoItem.idmateriaprima=null;
            if (response.success && response.data) {
              for (let element of response.data) { 
                  this.entrada_productos.push({"value":element.id,"label":element.numlote_proveedor,"id":element.id,"lote":element.numlote_proveedor,"tipo":"lote_proveedor","cantidad":element.cantidad_remanente,"tipo_medida":element.tipo_medida});
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
                  this.entrada_productos.push({"value":element.id,"label":element.numlote,"id":element.id,"lote":element.numlote,"tipo":"lote_interno","cantidad":element.remanente,"tipo_medida":element.tipo_medida});
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
            // this.proveedores.push({"id":null,"nombre":"Selecciona"})
            this.proveedores.push({"value":0,"label":"Interno"})
            if (response.success && response.data) {
              for (let element of response.data) { 
                  this.proveedores.push({"value":element.id,"label":element.nombre});
             }
            }
        },
        error=>console.log(error),
        ()=>{}
        ); 
}


  newItem() {
    console.log (this.proveedores.findIndex((prov)=>prov.value==parseInt(this.nuevoItem.proveedor)))
    let param = this.entidad+this.field+this.orden.id;
    this.nuevoItem.id =0;
    this.nuevoItem.idorden = this.orden.id;
    this.nuevoItem.proveedor = this.proveedores[this.proveedores.findIndex((prov)=>prov.value==parseInt(this.nuevoItem.proveedor))].label;
    this.nuevoItem.producto = this.productos[this.productos.findIndex((prod)=>prod.value==parseInt(this.nuevoItem.producto))].label;
    let index_entrada_productos = this.entrada_productos.findIndex((lot)=>lot.id==this.nuevoItem.idmateriaprima);
    this.nuevoItem.numlote_proveedor = this.entrada_productos[index_entrada_productos].lote;
    if (this.entrada_productos[index_entrada_productos].tipo == "lote_interno"){
     this.nuevoItem.idloteinterno = this.nuevoItem.idmateriaprima;
    this.nuevoItem.idmateriaprima = 0;
    }

    let cantidad = this.entrada_productos[index_entrada_productos].cantidad;
    this.nuevoItem.cantidad_remanente_origen = cantidad - this.nuevoItem.cantidad;    
    this.nuevoItem.cantidad_real_origen = cantidad;  


    this.passItem = this.nuevoItem
    //this.nuevoItem.idempresa = this.empresasService.seleccionada;
    //this.addnewItem = this.nuevoItem;
    this.servidor.postObject(URLS.STD_ITEM, this.nuevoItem,param).subscribe(
      response => {
        if (response.success) {
          this.items.push(this.nuevoItem);
          this.items[this.items.length-1].id= response.id;
          this.passItem.id = response.id;
          this.setRemanente(this.passItem);
          this.nuevoItem = new ProduccionDetalle(0,0,null,null,null,null,0,0,'');
          this.productos=[];
          this.entrada_productos=[];
        }
    },
    error =>console.log(error),
    () =>this.setItems()   
    );

   
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
    let value = "*`remanente`- "+detalleProduccion.cantidad;
     let  orden = {'remanente':value}
      let param = "&entidad=produccion_orden";
      let parametros = '?id=' + detalleProduccion.idloteinterno+param;     
          this.servidor.putObject(URLS.STD_ITEM,parametros, orden).subscribe(
            response => {
             if (response.success) {
              console.log('updated');
             }
          });

  }
}

onEdit(event){
  console.log(event);
  if (this.guardar[event.data.id] != true) this.remanentesEditados[event.data.id] = event.data.cantidad;
  this.itemEdited(event.data.id);
}
    itemEdited(idItem: number, fecha?: any) {
    this.guardar[idItem] = true;
    //console.log (fecha.toString());
  }
 //saveItem(item: ProveedorLoteProducto,i: number) {
  saveItem(item: ProduccionDetalle,i: number) {
    this.guardar[item.id] = false;
    let parametros = '?id=' + item.id+this.entidad;
    if (this.remanentesEditados[item.id] != item.cantidad){
      let index = this.items.findIndex((ordenDetalle)=>ordenDetalle.id==item.id);
      let diferencia=  parseInt(this.remanentesEditados[item.id]) - item.cantidad
      console.log('****^^',typeof(this.remanentesEditados[item.id]),typeof(diferencia),typeof(this.items[index].cantidad_remanente_origen))
      item.cantidad_remanente_origen =  this.items[index].cantidad_remanente_origen + diferencia;
    }

    this.servidor.putObject(URLS.STD_ITEM, parametros, item).subscribe(
      response => {
        if (response.success) {
          if (this.remanentesEditados[item.id] != item.cantidad)
          {
          let valor = this.remanentesEditados[item.id] - item.cantidad;
          if (item.idloteinterno>0){
            this.retornoRemanenteLI(valor,item.idloteinterno).then(
              (resultado)=>{
                if (resultado){
                  console.log(valor,'remanente retornado al lote de producto del proveedor')
                }else{
                  alert('Atención! No se ha podido devolver el remanente al lote de producto del proveedor')
                }
              }
            )
          }
          if (item.idmateriaprima>0){
            this.retornoRemanenteMP(valor,item.idmateriaprima).then(
              (resultado)=>{
                if (resultado){
                  console.log(valor,'remanente retornado al lote de producto del proveedor')
                }else{
                  alert('Atención! No se ha podido devolver el remanente al lote de producto del proveedor')
                }
              }
            )
          }
          }
          //alert('Si se ha modificdo la cantidad, no se ve reflejada en el remanente del lote de proveedor, Eliminar la entrada y crear una nueva, si actualiza los remanentes.');
        }
    });

  }


checkBorrar(idBorrar: number) {
    // Guardar el id del control a borrar
    this.idBorrar = idBorrar;
    // Crea el modal
    this.modal.titulo = 'produccion.borrarMateriaPrimaT';
    this.modal.subtitulo = 'produccion.borrarMateriaPrimaST';
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
            this.retornarRemanente(this.items[indice]);
            this.items.splice(indice, 1);

          }
      });
    }
  }

retornarRemanente(entradaMP: ProduccionDetalle ){
if (entradaMP.idloteinterno>0){
  this.retornoRemanenteLI(entradaMP.cantidad,entradaMP.idloteinterno).then(
    (resultado)=>{
      if (resultado){
        console.log('remanente retornado al lote de producto del proveedor')
      }else{
        alert('Atención! No se ha podido devolver el remanente al lote de producto del proveedor')
      }
    }
  )
}

if (entradaMP.idmateriaprima>0){
  this.retornoRemanenteMP(entradaMP.cantidad,entradaMP.idmateriaprima).then(
    (resultado)=>{
      if (resultado){
        console.log('remanente retornado al lote de producto del proveedor')
      }else{
        alert('Atención! No se ha podido devolver el remanente al lote de producto del proveedor')
      }
    }
  )
}
}

retornoRemanenteLI(valor,idLote){
  return new Promise((resolve, reject) => {
    let value = "*`remanente`+"+valor;
 
  let  orden = {'remanente':value}

   let param = "&entidad=produccion_orden";
   let parametros = '?id=' + idLote+param;     
       this.servidor.putObject(URLS.STD_ITEM,parametros, orden).subscribe(
         response => {
          if (response.success) {
            resolve(true);
          }
          else{
            resolve(false);
          }
       });
  });
}

retornoRemanenteMP(valor,idLote){
  return new Promise((resolve, reject) => {
    let EPentidad:string="&entidad=proveedores_entradas_producto";
    let value = "*`cantidad_remanente` +" +  valor;
    let EPitem= {'cantidad_remanente':value};
    let i: number
      let parametros = '?id=' + idLote+EPentidad;    
      this.servidor.putObject(URLS.STD_ITEM, parametros, EPitem).subscribe(
        response => {
          if (response.success) {
            resolve(true);
          }
          else{
            resolve(false);
          }
      });
    
  });
}

setMaxCantidad(idLote:number){
  console.log(idLote);
  let index_entrada_productos = this.entrada_productos.findIndex((lot)=>lot.id==idLote);
    this.nuevoItem.cantidad = this.entrada_productos[index_entrada_productos].cantidad;
    this.nuevoItem.tipo_medida = this.entrada_productos[index_entrada_productos].tipo_medida;
  this.maxCantidad = this.entrada_productos[index_entrada_productos].cantidad;
//console.log(idLote,index_entrada_productos,this.entrada_productos[index_entrada_productos].cantidad);
}





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
                      valor = (array[i][cabecera[x]['field']]==null )?'':this.getDropDownValor(cabecera[x]['field'], array[i][cabecera[x]['field']]);
                      break;
                      case 'custom':
                      switch (cabecera[x]['field']){
                        case 'proveedor':
                        valor = (array[i][cabecera[x]['field']]==null)?'':array[i][cabecera[x]['field']];
                        break;
                        case 'producto':
                        valor = (array[i][cabecera[x]['field']]==null)?'':array[i][cabecera[x]['field']];
                        break;
                        case 'idmateriaprima':
                        valor = (array[i]['numlote_proveedor']==null)?'':array[i]['numlote_proveedor'];
  
                        break;                       
                      }
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
                this.translate.get('produccion.materias_primas').subscribe((desc)=>{informe=desc + ' Lote: ' + this.orden.numlote});
                return {'cabecera':[informeCabecera],'rows':informeRows,'comentarios':[],'informes':informe};
    }

    getDropDownValor(tabla,valor){
      let Value;
      let index
      switch (tabla){
        case 'tipo_medida':
         index=this.medidas.findIndex((medida)=>medida["value"]==valor);
        if (index>-1)
        Value = this.medidas[index]["label"];     
        break;
      }
      return Value;
    }





}
