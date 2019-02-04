import { Component, OnInit, Input,Output, EventEmitter } from '@angular/core';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment/moment';

import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { LimpiezaProducto } from '../../models/limpiezaproducto';
import { Modal } from '../../models/modal';

@Component({
  selector: 'productos-limpieza',
  templateUrl: './productos-limpieza.component.html',
  styleUrls:['limpieza.component.css']
})

export class ProductosLimpiezaComponent implements OnInit {
@Output() onProductosReady:EventEmitter<LimpiezaProducto[]>=new EventEmitter<LimpiezaProducto[]>();
public nuevoItem: LimpiezaProducto = new LimpiezaProducto(0,this.empresasService.seleccionada,'');
public items: LimpiezaProducto[];
public sino:object[]=[{label:'Si', value:'si'},{label:'No', value:'no'}];
public guardar = [];
public alertaGuardar:boolean=false;
public idBorrar;
public url=[];
public verdoc: boolean = false;
public foto:string;
public baseurl = URLS.DOCS + this.empresasService.seleccionada + '/limpieza_producto/';
public modal: Modal = new Modal();
public modal2: Modal;
public entidad:string="&entidad=limpieza_producto";
public opciones:object[]=[{label:'si',value:'si'},{label:'no',value:'no'}];
public cols:any[];
public newRow:boolean=false;
//***   EXPORT DATA */
public exportar_informes: boolean =false;
public exportando:boolean=false;
public informeData:any;
//***   EXPORT DATA */


  constructor(public servidor: Servidor,public empresasService: EmpresasService
    , public translate: TranslateService, private messageService: MessageService) {}

  ngOnInit() {
    this.cols = [
      { field: 'nombre', header: 'limpieza.nombre', type: 'std', width:160,orden:false,'required':true },
      { field: 'marca', header: 'limpieza.marca', type: 'std', width:120,orden:false,'required':true },
      { field: 'desinfectante', header: 'limpieza.desinfectante', type: 'dropdown', width:130,orden:false,'required':true }, 
      { field: 'dosificacion', header: 'limpieza.dosificacion', type: 'std', width:120,orden:false,'required':true }, 
      { field: 'doc', header: 'foto', type: 'foto', width:120,orden:false,'required':false },
      { field: 'ficha', header: 'limpieza.ficha', type: 'foto', width:120,orden:false,'required':false },
    ];
      this.setItems().then(
      (resultado)=>{
        if (resultado){
          this.onProductosReady.emit(this.items);
        }
      }
      );
  }


  getOptions(option){
    //console.log('*****',option);
    switch (option[0]){
    case 'desinfectante':
    return this.opciones;
    break;
    }
    }


  photoURL(i,tipo,file) {
    console.log(i,tipo,file)
  //  this.verdoc=!this.verdoc;
  //  this.foto = this.baseurl+this.items[i].id+"_"+file;

    let extension = file.substr(file.length-3);
    let url = this.baseurl+this.items[i].id+"_"+file;
   // if (extension == 'jpg' || extension == 'peg' || extension == 'gif' || extension == 'png'){
    this.verdoc=!this.verdoc;
    this.foto = url
    //}else{
    //  window.open(url,'_blank');

    //}


  }

  setItems(){
    return new Promise((resolve, reject) => {
  //  let params = this.maquina.id;
  //  let parametros = '&idmaquina=' + params;
      let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad; 
        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            this.items = [];
            if (response.success && response.data) {
              for (let element of response.data) {  
                  this.items.push(new LimpiezaProducto(element.id,element.idempresa,element.nombre,element.marca,element.desinfectante,element.dosificacion, element.doc, element.ficha));
                  // this.url.push({"imgficha":this.baseurl + element.id +'_'+element.imgficha,"imgcertificado":this.baseurl + element.id +'_'+element.imgcertificado});
             }
                resolve(true);
                
            }else{
              resolve(false);
            }
             console.log("mantenimientos",this.items);
        });
    });
       
  }



  newItem() {
    console.log (this.nuevoItem);
    let param = this.entidad
    this.servidor.postObject(URLS.STD_ITEM, this.nuevoItem,param).subscribe(
      response => {
        if (response.success) {
          this.nuevoItem.id = response.id;
          this.items.push(this.nuevoItem);
          this.items = this.items.slice();
          this.nuevoItem = new LimpiezaProducto(0,this.empresasService.seleccionada,'');
          this.onProductosReady.emit(this.items);
        }
    });
  }

  onEdit(event){
    console.log(event);
    this.itemEdited(event.data.id);
  }
    itemEdited(idItem: number) {
    this.guardar[idItem] = true;
    if (!this.alertaGuardar){
      this.alertaGuardar = true;
      this.setAlerta('alertas.guardar');
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

  saveAll(){
    for (let x=0;x<this.guardar.length;x++){
      if (this.guardar[x]==true) {
        let indice = this.items.findIndex((myitem)=>myitem.id==x);
        console.log ("id",x,this.items[indice]);
        this.saveItem(this.items[indice])
      }
    }
}

 saveItem(item: LimpiezaProducto) {
    this.guardar[item.id] = false;
    this.alertaGuardar = false;
    let parametros = '?id=' + item.id+this.entidad;        
    this.servidor.putObject(URLS.STD_ITEM, parametros, item).subscribe(
      response => {
        if (response.success) {
          this.setAlerta('alertas.saveOk');
          console.log('item updated');
          this.onProductosReady.emit(this.items);
        }
    });

  }


checkBorrar(idBorrar: number) {
    // Guardar el id del control a borrar
    this.idBorrar = idBorrar;
    // Crea el modal
    this.modal.titulo = 'borrarControlT';
    this.modal.subtitulo = 'borrarControlST';
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
            let controlBorrar = this.items.find(mantenimiento => mantenimiento.id == this.idBorrar);
            let indice = this.items.indexOf(controlBorrar);
            this.items.splice(indice, 1);
            this.items = this.items.slice();
            this.onProductosReady.emit(this.items);
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
    this.servidor.postDoc(URLS.UPLOAD_DOCS, files,'limpieza_producto',idItem, this.empresasService.seleccionada.toString(),field).subscribe(
      response => {
        console.log('doc subido correctamente',files[0].name);
        this.items[i][field] = field+"_"+files[0].name;
 //       this.url[i]= URLS.DOCS + this.empresasService.seleccionada + '/limpieza_producto/' +  idItem +'_'+files[0].name;
        // let activa = this.empresas.find(emp => emp.id == this.empresasService.seleccionada);
        // activa.logo = '1';
      }
    )
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
              case "desinfectante":
              Value = valor
              break;
            }
            console.log(tabla,valor,Value);
            return Value;
          }

          
}
