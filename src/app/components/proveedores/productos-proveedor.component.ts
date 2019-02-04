import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
//import {SelectItem} from 'primeng/primeng';
import { TranslateService } from '@ngx-translate/core';

import * as moment from 'moment/moment';

import { Servidor } from '../../services/servidor.service';
import { URLS,cal } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { ProveedorProducto } from '../../models/proveedorproductos';
import { Proveedor } from '../../models/proveedor';
import { Modal } from '../../models/modal';
//import { myprods } from '../../models/limpiezamyprods';
import { FamiliasProducto } from '../../models/proveedorfamilias';

export class alerg{
  constructor(
    public id:number,
    public nombre:string
  ){}
}

@Component({
  selector: 'productos-proveedor',
  templateUrl: './productos-proveedor.component.html',
  styleUrls:['proveedores.component.css']
})

export class ProductosProveedorComponent implements OnInit, OnChanges{
@Input() proveedor: Proveedor;
@Output() nuevoProducto: EventEmitter<boolean> = new EventEmitter<boolean>();
public nuevoItem: ProveedorProducto = new ProveedorProducto('','','','',0,0,null);
public addnewItem: ProveedorProducto = new ProveedorProducto('','','','',0,0,null);;
public items: ProveedorProducto[];
public cols:any[];
public newRow:boolean=false;
public familias: object[];
public guardar = [];
public idBorrar;
public url=[];
public verdoc: boolean = false;
public foto:string;

public baseurl = URLS.DOCS + this.empresasService.seleccionada + '/proveedores_productos/';
public modal: Modal = new Modal();
public modal2: Modal;
public entidad:string="&entidad=proveedores_productos";
public field:string="&field=idproveedor&idItem=";//campo de relación con tabla padre
public es;
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
     // this.setItems();
      this.getFamilias();
      this.es=cal;
        this.cols = [
          { field: 'nombre', header: 'proveedores.nombre', type: 'std', width:160,orden:true,'required':true },
          { field: 'descripcion', header: 'proveedores.descripcion', type: 'std', width:120,orden:true,'required':true },
          { field: 'idfamilia', header: 'proveedores.familia', type: 'dropdown', width:120,orden:true,'required':true },
          { field: 'doc', header: 'proveedores.fichatecnica', type: 'foto', width:120,orden:true,'required':true }
        ];
  }
  ngOnChanges(){
    console.log("onChange");
      this.setItems();
  }
  getOptions(option){
    //console.log('*****',option);
    switch (option[0]){
    case 'idfamilia':
    return this.familias;
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

getFamilias(){
        let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=proveedores_familia"; 
        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            this.familias = [];
            if (response.success && response.data) {
              for (let element of response.data) {  
                  //this.familias.push(new FamiliasProducto (element.nombre,element.idempresa,element.nivel_destino,element.id));   
                  this.familias.push({'label':element.nombre,'value':element.id});   
             }
            }
        });
}


  setItems(){
     console.log('setting items...')
      let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+this.field+this.proveedor.id; 
        this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
          response => {
            this.items = [];
            if (response.success && response.data) {
              for (let element of response.data) { 
                  this.items.push(new ProveedorProducto(element.nombre,element.descripcion,element.alergenos,element.doc,element.idproveedor,element.id,element.idfamilia));
             }
            }
        },
        error=>console.log(error),
        ()=>{
          if(this.addnewItem.id != 0) this.addnewItem.id =0;
          }
        );
  }



  newItem() {
    let param = this.entidad+this.field+this.proveedor.id;
    this.nuevoItem.idproveedor = this.proveedor.id;
    if (!this.nuevoItem.idfamilia) this.nuevoItem.idfamilia = 0;
    this.addnewItem = this.nuevoItem;
    this.servidor.postObject(URLS.STD_ITEM, this.addnewItem,param).subscribe(
      response => {
        if (response.success) {
          this.items.push(this.addnewItem);
          this.items[this.items.length-1].id= response.id;
          setTimeout(()=>{this.setItems();
                          this.nuevoProducto.emit(true);  
                        },150);
        }
    },
    error =>console.log(error),
    () =>  {}
    );

   this.nuevoItem = new ProveedorProducto('','','','',0,0,null);
   
  }


  onEdit(event){
    console.log(event);
    this.itemEdited(event.data.id);
  }
    itemEdited(idItem: number, fecha?: any) {
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

 saveItem(item: ProveedorProducto,i: number) {
    this.guardar[item.id] = false;
    let parametros = '?id=' + item.id+this.entidad;    
    item.idproveedor = this.proveedor.id;  
    item.alergenos = this.items[i].alergenos;
    this.servidor.putObject(URLS.STD_ITEM, parametros, item).subscribe(
      response => {
        if (response.success) {
          this.nuevoProducto.emit(true);
        }
    });
  }


checkBorrar(idBorrar: number) {
    // Guardar el id del control a borrar
    this.idBorrar = idBorrar;
    // Crea el modal
    this.modal.titulo = 'proveedores.borrarProductoT';
    this.modal.subtitulo = 'proveedores.borrarProductoST';
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
            this.nuevoProducto.emit(true);
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
    this.servidor.postDoc(URLS.UPLOAD_DOCS, files,'proveedores_productos',idItem, this.empresasService.seleccionada.toString(),field).subscribe(
      response => {
        console.log('doc subido correctamente',files[0].name);
        this.items[i].doc = files[0].name;
        this.url[i]= URLS.DOCS + this.empresasService.seleccionada + '/proveedores_productos/' +  idItem +'_'+files[0].name;
        // let activa = this.empresas.find(emp => emp.id == this.empresasService.seleccionada);
        // activa.logo = '1';
      }
    )
  }

setAlergenos(alergens: string, idItem?: number, i?: number){
  console.log(alergens,idItem,i);
  if (!idItem){
  this.nuevoItem.alergenos = alergens;
  }else{
    this.itemEdited(idItem);
    this.items[i].alergenos = alergens;
    console.log(this.items[i]);
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
                    this.translate.get('proveedores.productos').subscribe((desc)=>{informe=desc});
                    return {'cabecera':[informeCabecera],'rows':informeRows,'comentarios':[],'informes':informe};
        }
    
        getDropDownValor(tabla,valor){
          let Value;
          switch (tabla){
            case "idfamilia":
            let index=this.familias.findIndex((familia)=>familia["value"]==valor);
            if (index>-1)
            Value = this.familias[index]["label"];
            break;
          }
          console.log(tabla,valor,Value);
          return Value;
        }
    


}
