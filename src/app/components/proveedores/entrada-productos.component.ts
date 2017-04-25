import { Component, OnInit, Input, OnChanges } from '@angular/core';
import * as moment from 'moment/moment';
//import {SelectItem} from 'primeng/primeng';
import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
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
public nuevoItem: ProveedorLoteProducto = new ProveedorLoteProducto('',new Date(),new Date(),null,'',0,'',null,0,0,0);
//public addnewItem: ProveedorLoteProducto = new ProveedorLoteProducto('','','','',0,0);;
public items: ProveedorLoteProducto[];
public fechas_inicio:Object={fecha_inicio:moment(new Date()).subtract(30,'days').format('YYYY-MM-DD').toString(),fecha_fin:moment(new Date()).format('YYYY-MM-DD').toString()}//ultimos 30 dias
public filtro_inicio:String;
public filtro_fin:String;
public filter:boolean=false;
public productos: any[]=[];
public medidas: string[]=['Kg.','g.','l.','ml.','unidades'];
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
       parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+this.field+this.proveedor.id+filterDates; 
     }else{
       parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+this.field+this.proveedor.id; 
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
         let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=proveedores_productos"+this.field+this.proveedor.id; 
        this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
          response => {
            this.productos = [];
            //this.productos.push({"id":null,"nombre":'producto'})
            if (response.success && response.data) {
              for (let element of response.data) { 
                  this.productos.push({"id":element.id,"nombre":element.nombre});
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
    
    let param = this.entidad+this.field+this.proveedor.id;
    this.nuevoItem.idproveedor = this.proveedor.id;
    this.nuevoItem.idempresa = this.empresasService.seleccionada;
    this.nuevoItem.cantidad_remanente = this.nuevoItem.cantidad_inicial;
    this.nuevoItem.id = 0;
    //this.addnewItem = this.nuevoItem;
    this.servidor.postObject(URLS.STD_ITEM, this.nuevoItem,param).subscribe(
      response => {
        if (response.success) {
          this.items.push(this.nuevoItem);
          this.items[this.items.length-1].id= response.id;
        }
    },
    error =>console.log(error),
    () =>this.setDates(this.fechas_inicio)   
    );

   this.nuevoItem =  new ProveedorLoteProducto('',new Date(),new Date(),null,'',0,'',null,0,0,0);
  }



    itemEdited(idItem: number, fecha?: any) {
    this.guardar[idItem] = true;
    //console.log (fecha.toString());
  }
 saveItem(item: ProveedorLoteProducto,i: number) {
    this.guardar[item.id] = false;
    item.fecha_entrada = moment(item.fecha_entrada).add(2,'h').utc().toDate();
    item.fecha_caducidad = moment(item.fecha_caducidad).add(2,'h').utc().toDate();
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

setDates(dates:any){
this.filter = false;
if (dates!= 'void'){
  this.fechas_inicio = dates;
 this.filtro_inicio = moment(new Date (dates['fecha_inicio'])).format('DD-MM-YYYY').toString();
 this.filtro_fin = moment(new Date (dates['fecha_fin'])).format('DD-MM-YYYY').toString();
  this.setItems("&filterdates=true&fecha_field=fecha_entrada&fecha_inicio="+ dates['fecha_inicio'] +  "&fecha_fin="+dates['fecha_fin']);
}
}
excel(){
  console.log("send to excel");

 let columnas=['Materia Prima','Lote Proveedor','fecha','fecha_caducidad','cantidad','tipo_medida','remanente'];
 let data=[];
 this.items.forEach((item)=>{
   let indice = this.productos.findIndex((prod)=>prod['id'] == item.idproducto);
   let producto;
   (indice<0)?producto="":producto= this.productos[indice].nombre;
   
   data.push({'Materia Prima':producto,'Lote Proveedor':item.numlote_proveedor,'fecha':moment(item.fecha_entrada).format('DD-MM-YYYY'),'fecha_caducidad':moment(item.fecha_caducidad).format('DD-MM-YYYY'),'cantidad':item.cantidad_inicial,'tipo_medida':item.tipo_medida,'remanente':item.cantidad_remanente})
 });
var csvData = this.ConvertToCSV(columnas, data);
    var a = document.createElement("a");
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);
    var blob = new Blob([csvData], { type: 'text/csv' });
    var url= window.URL.createObjectURL(blob);
    //window.open(url,'_blank');
    a.href = url;
    
    a.download = 'Entrada_Productos'+this.proveedor.nombre+'.csv';
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
