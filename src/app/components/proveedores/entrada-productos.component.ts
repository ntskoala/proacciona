import { Component, OnInit, Input, OnChanges } from '@angular/core';
import * as moment from 'moment/moment';
import { TranslateService } from '@ngx-translate/core';
import {MessageService} from 'primeng/components/common/messageservice';

//import {SelectItem} from 'primeng/primeng';
import { Servidor } from '../../services/servidor.service';
import { URLS,cal } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { ProveedorLoteProducto } from '../../models/proveedorlote';
import { Proveedor } from '../../models/proveedor';
import { Modal } from '../../models/modal';


export class alerg{
  constructor(
    public id:number,
    public nombre:string
  ){}
}

@Component({
  selector: 'entrada-productos',
  templateUrl: './entrada-productos.component.html',
  styleUrls:['proveedores.component.css']
})

export class EntradaProductosComponent implements OnInit, OnChanges{
@Input() proveedor: Proveedor;
@Input() cambioProductos: boolean;
public nuevoItem: ProveedorLoteProducto = new ProveedorLoteProducto('',new Date(),new Date(),null,'',null,'',null,0,0,0);
//public addnewItem: ProveedorLoteProducto = new ProveedorLoteProducto('','','','',0,0);;
public items: ProveedorLoteProducto[];
public alertaGuardar:object={'guardar':false,'ordenar':false};
public cols:any[];
public newRow:boolean=false;
// public fechas_inicio:Object={fecha_inicio:moment(new Date()).subtract(30,'days').format('YYYY-MM-DD').toString(),fecha_fin:moment(new Date()).format('YYYY-MM-DD').toString()}//ultimos 30 dias
public fechas_inicio:Object={fecha_inicio:moment(new Date()).subtract(30,'days').toDate(),fecha_fin:moment(new Date()).toDate()}//ultimos 30 dias
public filtro_inicio:String;
public filtro_fin:String;
public filter:boolean=false;
public productos: any[]=[];
public medidas: object[]=[{'label':'Kg.','value':'Kg.'},{'label':'g.','value':'g.'},{'label':'l.','value':'l.'},{'label':'ml.','value':'ml.'},{'label':'unidades','value':'unidades'}];
public guardar = [];
public idBorrar;
public url=[];
public verdoc: boolean = false;
public foto:string;

public baseurl = URLS.DOCS + this.empresasService.seleccionada + '/proveedores_entradas_producto/';
public modal: Modal = new Modal();
public modal2: Modal;

public entidad:string="&entidad=proveedores_entradas_producto";
public field:string="&field=idproveedor&idItem=";//campo de relación con tabla padre
public es;
//***   EXPORT DATA */
public exportar_informes: boolean =false;
public exportando:boolean=false;
public informeData:any;
//***   EXPORT DATA */
  constructor(public servidor: Servidor,public empresasService: EmpresasService
    , public translate: TranslateService,private messageService: MessageService) {}

  ngOnInit() {
     // this.setItems();
      
     this.es=cal;
        this.cols = [
          { field: 'idproducto', header: 'proveedores.producto', type: 'custom', width:160,orden:true,'required':true },
          { field: 'numlote_proveedor', header: 'proveedores.numlotep', type: 'std', width:120,orden:true,'required':true },
          { field: 'fecha_entrada', header: 'proveedores.fecha_entrada', type: 'fecha', width:120,orden:true,'required':true },
          { field: 'fecha_caducidad', header: 'proveedores.fecha_caducidad', type: 'fecha', width:120,orden:true,'required':true },
          { field: 'cantidad_inicial', header: 'proveedores.cantidad', type: 'std', width:90,orden:true,'required':true },
          { field: 'tipo_medida', header: 'proveedores.tipo medida', type: 'dropdown', width:120,orden:false,'required':false },
          { field: 'cantidad_remanente', header: 'proveedores.remanente', type: 'std', width:90,orden:false,'required':false, 'disabled':true },
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
    case 'idproducto':
    return this.productos;
    break;
    case 'tipo_medida':
    return this.medidas;
    break;
    }
    }

  photoURL(i,tipo) {
    let extension = this.items[i].doc.substr(this.items[i].doc.length-3);
    let url = this.baseurl+this.items[i].id +"_"+this.items[i].doc;
    if (extension == 'jpg' || extension == 'epg' || extension == 'gif' || extension == 'png'){
    this.verdoc=!this.verdoc;
    this.foto = url
    }else{
      window.open(url,'_blank');

    }

  }




  setItems(filterDates?:string){
    let parametros ="";
     if (filterDates){
       parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+this.field+this.proveedor.id+filterDates+"&order=fecha_entrada desc"; 
     }else{
       parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+this.field+this.proveedor.id+"&order=fecha_entrada desc"; 
     }
     // let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+this.field+this.proveedor.id; 
        this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
          response => {
            this.items = [];
            if (response.success && response.data) {
              for (let element of response.data) { 
                  this.items.push(new ProveedorLoteProducto(element.numlote_proveedor,new Date(element.fecha_entrada),new Date(element.fecha_caducidad),element.cantidad_inicial,element.tipo_medida,element.cantidad_remanente,element.doc,element.idproducto,element.idproveedor,element.idempresa,element.id));
             }
            }
        },
        error=>console.log(error),
        ()=>{}
        );
  }

getProductos(){
  console.log('get_prods');
         let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=proveedores_productos"+this.field+this.proveedor.id; 
        this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
          response => {
            this.productos = [];
            //this.productos.push({"id":null,"nombre":'producto'})
            if (response.success && response.data) {
              for (let element of response.data) { 
                  // this.productos.push({"id":element.id,"nombre":element.nombre});
                  this.productos.push({"value":element.id,"label":element.nombre});
             }
             //console.log("PRODS",this.productos);
            }
        },
        error=>console.log(error),
        ()=>{
          //this.setItems()
          this.setDates();
          }
        ); 
}


cambioInput(){
  this.nuevoItem.cantidad_remanente = this.nuevoItem.cantidad_inicial;
}
  newItem() {
    let param = this.entidad+this.field+this.proveedor.id;
    this.nuevoItem.idproveedor = this.proveedor.id;
    this.nuevoItem.idempresa = this.empresasService.seleccionada;
    this.nuevoItem.cantidad_remanente = this.nuevoItem.cantidad_inicial;
    this.nuevoItem.id = 0;
    //this.addnewItem = this.nuevoItem;
    console.log(this.nuevoItem);
    this.servidor.postObject(URLS.STD_ITEM, this.nuevoItem,param).subscribe(
      response => {
        if (response.success) {
          this.items.push(this.nuevoItem);
          this.items[this.items.length-1].id= response.id;
        }
    },
    error =>console.log(error),
    () =>this.setDates()   
    );

   this.nuevoItem =  new ProveedorLoteProducto('',new Date(),new Date(),null,'',null,'',null,0,0,0);
  }


  onEdit(event){
    console.log(event);
    this.itemEdited(event.data.id);
  }
    itemEdited(idItem: number, fecha?: any) {
    this.guardar[idItem] = true;
    //console.log (fecha.toString());
    if (!this.alertaGuardar['guardar']){
      this.alertaGuardar['guardar'] = true;
      this.setAlerta('alertas.guardar');
      }
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

 saveItem(item: ProveedorLoteProducto,i: number) {
    this.guardar[item.id] = false;
    item.fecha_entrada = moment(item.fecha_entrada).add(2,'h').utc().toDate();
    item.fecha_caducidad = moment(item.fecha_caducidad).add(2,'h').utc().toDate();
    let parametros = '?id=' + item.id+this.entidad;    
    this.servidor.putObject(URLS.STD_ITEM, parametros, item).subscribe(
      response => {
        if (response.success) {
          this.setAlerta('alertas.saveOk');
        }
    });

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


checkBorrar(idBorrar: number) {
    // Guardar el id del control a borrar
    this.idBorrar = idBorrar;
    // Crea el modal
    this.modal.titulo = 'proveedores.borrarEntradaProductoT';
    this.modal.subtitulo = 'proveedores.borrarEntradaProductoST';
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

  uploadImg(event, idItem,i,field) {
    console.log(event)
    var target = event.target || event.srcElement; //if target isn't there then take srcElement
    let files = target.files;
    //let files = event.srcElement.files;
    let idEmpresa = this.empresasService.seleccionada.toString();
    this.servidor.postDoc(URLS.UPLOAD_DOCS, files,'proveedores_entradas_producto',idItem, this.empresasService.seleccionada.toString(),field).subscribe(
      response => {
        console.log('doc subido correctamente',files[0].name);
        this.items[i].doc = files[0].name;
        this.url[i]= URLS.DOCS + this.empresasService.seleccionada + '/proveedores_entradas_producto/' +  idItem +'_'+files[0].name;
        // let activa = this.empresas.find(emp => emp.id == this.empresasService.seleccionada);
        // activa.logo = '1';
      }
    )
  }

setDates(){
 this.filtro_inicio = moment(new Date (this.fechas_inicio['fecha_inicio'])).format('YYYY-MM-DD').toString();
 this.filtro_fin = moment(new Date (this.fechas_inicio['fecha_fin'])).format('YYYY-MM-DD').toString();
  this.setItems("&filterdates=true&fecha_field=fecha_entrada&fecha_inicio="+ this.filtro_inicio +  "&fecha_fin="+this.filtro_fin);
}
// excel(){
//   console.log("send to excel");

//  let columnas=['Materia Prima','Lote Proveedor','fecha','fecha_caducidad','cantidad','tipo_medida','remanente'];
//  let data=[];
//  this.items.forEach((item)=>{
//    let indice = this.productos.findIndex((prod)=>prod['id'] == item.idproducto);
//    let producto;
//    (indice<0)?producto="":producto= this.productos[indice].nombre;
   
//    data.push({'Materia Prima':producto,'Lote Proveedor':item.numlote_proveedor,'fecha':moment(item.fecha_entrada).format('DD-MM-YYYY'),'fecha_caducidad':moment(item.fecha_caducidad).format('DD-MM-YYYY'),'cantidad':item.cantidad_inicial,'tipo_medida':item.tipo_medida,'remanente':item.cantidad_remanente})
//  });
// var csvData = this.ConvertToCSV(columnas, data);
//     var a = document.createElement("a");
//     a.setAttribute('style', 'display:none;');
//     document.body.appendChild(a);
//     var blob = new Blob([csvData], { type: 'text/csv' });
//     var url= window.URL.createObjectURL(blob);
//     //window.open(url,'_blank');
//     a.href = url;
    
//     a.download = 'Entrada_Productos'+this.proveedor.nombre+'.csv';
//     a.click();
// }

// ConvertToCSV_OLD(controles,objArray){
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
                this.translate.get('proveedores.entradaproductos').subscribe((desc)=>{informe=desc});
                return {'cabecera':[informeCabecera],'rows':informeRows,'comentarios':[],'informes':informe};
    }

    getDropDownValor(tabla,valor){
      let Value;
      let index
      switch (tabla){
        case 'idproducto':
         index=this.productos.findIndex((prod)=>prod["value"]==valor);
        if (index>-1)
        Value = this.productos[index]["label"];
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
