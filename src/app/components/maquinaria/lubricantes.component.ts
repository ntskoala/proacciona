import { Component, OnInit, Input } from '@angular/core';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from 'ng2-translate';

import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { Lubricante } from '../../models/lubricante';
import { Modal } from '../../models/modal';

@Component({
  selector: 'lubricantes',
  templateUrl: './lubricantes.component.html',
  styleUrls:['ficha-maquina.css']
})

export class LubricantesComponent implements OnInit {

public nuevoItem: Lubricante = new Lubricante(0,this.empresasService.seleccionada);
public items: Lubricante[];
public guardar = [];
public alertaGuardar:boolean=false;
public idBorrar;
public url=[];
public verdoc: boolean = false;
public foto:string;
public baseurl = URLS.DOCS + this.empresasService.seleccionada + '/lubricantes/';
public modal: Modal = new Modal();
public modal2: Modal;

  constructor(public servidor: Servidor,public empresasService: EmpresasService
    , public translate: TranslateService, private messageService: MessageService) {}

  ngOnInit() {
      this.setItems();
  }

  // photoURL(i,tipo) {

  //   this.verdoc=!this.verdoc;
  //   this.foto = this.url[i][tipo];
  // }

  photoURL(i,tipo,file) {
    
    //let extension = this.url[i][tipo].substr(this.items[i][tipo].length-3);
    let extension = file.substr(file.length-3);
   // let url = this.baseurl+this.items[i].id +"_"+this.items[i].doc;
   console.log(file,extension);
    if (extension == 'jpg' || extension == 'epg' || extension == 'gif' || extension == 'png'){
    this.verdoc=!this.verdoc;
    this.foto = this.url[i][tipo];
    }else{
      window.open(this.url[i][tipo],'_blank');
    }
  }

  setItems(){
  //  let params = this.maquina.id;
  //  let parametros = '&idmaquina=' + params;
      let parametros = '&idempresa=' + this.empresasService.seleccionada; 
        this.servidor.getObjects(URLS.LUBRICANTES, parametros).subscribe(
          response => {
            this.items = [];
            if (response.success && response.data) {
              for (let element of response.data) {  
                  this.items.push(new Lubricante(element.id,element.idempresa,element.nombre,element.marca,element.tipo,element.imgficha,element.imgcertificado));
                   this.url.push({"imgficha":this.baseurl + element.id +'_'+element.imgficha,"imgcertificado":this.baseurl + element.id +'_'+element.imgcertificado});
             }
            }
             console.log("mantenimientos",this.items);
        });
       
  }



  newItem() {
    console.log (this.nuevoItem);
    this.servidor.postObject(URLS.LUBRICANTES, this.nuevoItem).subscribe(
      response => {
        if (response.success) {
          this.nuevoItem.id = response.id;
          this.items.push(this.nuevoItem);
          this.url.push({"imgficha":"","imgcertificado":""});
          this.nuevoItem = new Lubricante(0,this.empresasService.seleccionada);
          this.items = this.items.slice();
        }
    });
  }

  onEdit(evento){
    this.itemEdited(evento.data.id);
    }
    itemEdited(idMantenimiento: number) {
    this.guardar[idMantenimiento] = true;
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

 saveItem(item: Lubricante) {
    this.guardar[item.id] = false;
    this.alertaGuardar = false;
    let parametros = '?id=' + item.id;        
    this.servidor.putObject(URLS.LUBRICANTES, parametros, item).subscribe(
      response => {
        if (response.success) {
          console.log('item updated');
        }
    });

  }


checkBorrar(idBorrar: number) {
    // Guardar el id del control a borrar
    this.idBorrar = idBorrar;
    // Crea el modal
    this.modal.titulo = 'borrarT';
    this.modal.subtitulo = 'borrarST';
    this.modal.eliminar = true;
    this.modal.visible = true;
}
  cerrarModal(event: boolean) {
    this.modal.visible = false;
    if (event) {
      let parametros = '?id=' + this.idBorrar;
      this.servidor.deleteObject(URLS.LUBRICANTES, parametros).subscribe(
        response => {
          if (response.success) {
            let controlBorrar = this.items.find(mantenimiento => mantenimiento.id == this.idBorrar);
            let indice = this.items.indexOf(controlBorrar);
            this.items.splice(indice, 1);
            this.url.splice(indice,1)
            this.items = this.items.slice();
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
    this.servidor.postDoc(URLS.UPLOAD_DOCS, files,'lubricantes',idItem, this.empresasService.seleccionada.toString(),field).subscribe(
      response => {
        console.log('doc subido correctamente',files[0].name);
        this.items[i][field] = files[0].name;
        this.url[i][field]= URLS.DOCS + this.empresasService.seleccionada + '/lubricantes/' +  idItem +'_'+field+'_'+files[0].name;
        console.log(this.url);
        // let activa = this.empresas.find(emp => emp.id == this.empresasService.seleccionada);
        // activa.logo = '1';
      }
    )
  }

}
