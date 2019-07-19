import { Component, OnInit, Input, OnChanges } from '@angular/core';
//import {SelectItem} from 'primeng/primeng';
import * as moment from 'moment/moment';
import { TranslateService } from '@ngx-translate/core';


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
  selector: 'distribucion',
  templateUrl: './distribucion.component.html',
  styleUrls:['produccion.css']
})

export class DistribucionComponent implements OnInit, OnChanges{
@Input() orden: ProduccionOrden;
//@Input() cliente: Cliente;
public nuevoItem: Distribucion = new Distribucion(0,0,0,0,0,'',new Date(),new Date(),'',0,'','');
//public addnewItem: ProveedorLoteProducto = new ProveedorLoteProducto('','','','',0,0);;
public items: Distribucion[];
public cols:any[];
public productos: ProductoPropio[]=[];
public clientes: object[]=[];
public medidas: object[]=dropDownMedidas;

public guardar = [];
public remanentesEditados = [];
public idBorrar;
public url=[];
public verdoc: boolean = false;
public foto:string;

public baseurl = URLS.DOCS + this.empresasService.seleccionada + '/clientes_distribucion/';
public modal: Modal = new Modal();
public modal2: Modal;
entidad:string="&entidad=clientes_distribucion";
field:string="&field=idordenproduccion&idItem=";//campo de relación con tabla padre
public es;
public newRow:boolean=false;
//***   EXPORT DATA */
public exportar_informes: boolean =false;
public exportando:boolean=false;
public informeData:any;
//***   EXPORT DATA */
  constructor(
    public servidor: Servidor,
    public empresasService: EmpresasService,
    public translate: TranslateService) {}

  ngOnInit() {
      this.getClientes();
      this.getProductos();
      this.setItems();
      this.es=cal;
        this.cols = [
          { field: 'idcliente', header: 'produccion.cliente', type: 'dropdown', width:160,orden:true,'required':true, 'disabled':true },
          { field: 'numlote', header: 'produccion.numlote', type: 'std', width:120,orden:true,'required':true, 'disabled':true },
          { field: 'fecha', header: 'produccion.fecha', type: 'fecha', width:120,orden:true,'required':true, 'disabled':false },
          { field: 'fecha_caducidad', header: 'produccion.fecha_caducidad', type: 'fecha', width:120,orden:true,'required':true, 'disabled':false },
          { field: 'cantidad', header: 'produccion.cantidad', type: 'std', width:90,orden:true,'required':true, 'disabled':false },
          { field: 'tipo_medida', header: 'produccion.tipo medida', type: 'dropdown', width:120,orden:false,'required':true, 'disabled':false }
        ];
  }
  
  ngOnChanges(){
    console.log("onChange");
      this.setItems();
      this.nuevoItem.numlote = this.orden.numlote;
      this.nuevoItem.tipo_medida = this.orden.tipo_medida;
      if (this.orden.fecha_caducidad){
      if (this.orden.fecha_caducidad.toString() != 'Invalid Date') this.nuevoItem.fecha_caducidad = this.orden.fecha_caducidad;
      }
  }


  getOptions(option){
    //console.log('*****',option);
    switch (option[0]){
    case 'idcliente':
    return this.clientes;
    break;
    case 'tipo_medida':
    return this.medidas;
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

// getProd(){
//   if (this.orden.idproductopropio){
//   let i= this.productos.findIndex((prod)=> prod.id==this.orden.idproductopropio);
//   }
// }
getClientes(){
         let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=clientes"; 
        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            this.clientes = [];
            if (response.success && response.data) {
              for (let element of response.data) { 
                  // this.clientes.push(new Cliente(element.nombre,element.idempresa,element.contacto,element.telf,element.email,element.id));
                  this.clientes.push({"value":element.id,"label":element.nombre});
             }
            }
        },
        error=>console.log(error),
        ()=>{this.setItems()}
        ); 
}
  newItem() {
    
    let param = this.entidad+this.field+this.orden.id;
    this.nuevoItem.idempresa = this.empresasService.seleccionada;
    this.nuevoItem.idordenproduccion = this.orden.id;
    this.nuevoItem.idproductopropio = this.orden.idproductopropio;
    this.nuevoItem.id = 0;
     this.orden.remanente -= this.nuevoItem.cantidad;
    //this.addnewItem = this.nuevoItem;
    this.servidor.postObject(URLS.STD_ITEM, this.nuevoItem,param).subscribe(
      response => {
        if (response.success) {
          this.items.push(this.nuevoItem);
          this.items[this.items.length-1].id= response.id;
          this.saveRemanente();
        }
    },
    error =>console.log(error),
    () =>this.setItems()   
    );

   this.nuevoItem =  new Distribucion(0,0,0,0,0,this.orden.numlote,new Date(),new Date(),'',0,this.orden.tipo_medida,'');
  }

  onEdit(event){
    console.log(event);
    if (this.guardar[event.data.id] != true) this.remanentesEditados[event.data.id] = event.data.cantidad;
    this.itemEdited(event.data.id);
  }

    itemEdited(idItem: number, fecha?: any) {
      
      if (this.guardar[idItem] != true) {
        let cantidad = this.items[this.items.findIndex((item)=>item.id==idItem)].cantidad;
        this.remanentesEditados[idItem] = cantidad;
        console.log(this.remanentesEditados,cantidad)
      }
    this.guardar[idItem] = true;
    //console.log (fecha.toString());
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
    item.idordenproduccion =  this.items[this.items.findIndex((myitem)=>myitem.id==item.id)].idordenproduccion;
    item.fecha_caducidad =  new Date(Date.UTC(item.fecha_caducidad.getFullYear(), item.fecha_caducidad.getMonth(), item.fecha_caducidad.getDate()));
    item.fecha =  new Date(Date.UTC(item.fecha.getFullYear(), item.fecha.getMonth(), item.fecha.getDate()));

    this.servidor.putObject(URLS.STD_ITEM, parametros, item).subscribe(
      response => {
        if (response.success) {
          console.log(item.cantidad,this.remanentesEditados[item.id]);
          if (this.remanentesEditados[item.id] != item.cantidad)
          {
          let valor = this.remanentesEditados[item.id] - item.cantidad;
          this.updateRemanente(valor,item.idordenproduccion)
          }
        }
    });
  }

saveRemanente(){
  let item: ProduccionOrden = this.orden;
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
            this.updateRemanente(this.items[indice].cantidad,this.items[indice].idordenproduccion);            
            this.items.splice(indice, 1);
          }
      });
    }
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
                  this.translate.get('produccion.distribucion').subscribe((desc)=>{informe=desc  + ' Lote: ' + this.orden.numlote});
                  return {'cabecera':[informeCabecera],'rows':informeRows,'comentarios':[],'informes':informe};
      }
  
      getDropDownValor(tabla,valor){
        let Value;
        let index
        switch (tabla){
          case 'idcliente':
           index=this.clientes.findIndex((cli)=>cli["value"]==valor);
          if (index>-1)
          Value = this.clientes[index]["label"];
          return Value;
          break;
          case 'tipo_medida':
           index=this.medidas.findIndex((medida)=>medida["value"]==valor);
          if (index>-1)
          Value = this.medidas[index]["label"];
          return Value;       
          break;
        }
        console.log(tabla,valor,Value);
        return Value;
      }
  
  



}
