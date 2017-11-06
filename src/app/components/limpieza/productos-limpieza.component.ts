import { Component, OnInit, Input,Output, EventEmitter } from '@angular/core';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from 'ng2-translate';

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
  constructor(public servidor: Servidor,public empresasService: EmpresasService
    , public translate: TranslateService, private messageService: MessageService) {}

  ngOnInit() {
      this.setItems().then(
      (resultado)=>{
        if (resultado){
          this.onProductosReady.emit(this.items);
        }
      }
      );
  }
  photoURL(i,tipo,file) {
    console.log(i,tipo,file)
  //  this.verdoc=!this.verdoc;
  //  this.foto = this.baseurl+this.items[i].id+"_"+file;

    let extension = file.substr(file.length-3);
    let url = this.baseurl+this.items[i].id+"_"+file;
    if (extension == 'jpg' || extension == 'peg' || extension == 'gif' || extension == 'png'){
    this.verdoc=!this.verdoc;
    this.foto = url
    }else{
      window.open(url,'_blank');

    }


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
    this.messageService.add(
      {severity:'warn', 
      summary:'Info', 
      detail: concepto
      }
    );
  }
 saveItem(item: LimpiezaProducto) {
    this.guardar[item.id] = false;
    this.alertaGuardar = false;
    let parametros = '?id=' + item.id+this.entidad;        
    this.servidor.putObject(URLS.STD_ITEM, parametros, item).subscribe(
      response => {
        if (response.success) {
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

}
