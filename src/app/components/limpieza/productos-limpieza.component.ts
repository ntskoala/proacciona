import { Component, OnInit, Input } from '@angular/core';

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

public nuevoItem: LimpiezaProducto = new LimpiezaProducto(0,this.empresasService.seleccionada,'');
public items: LimpiezaProducto[];
public guardar = [];
public idBorrar;
public url=[];
public verdoc: boolean = false;
public foto:string;
public baseurl = URLS.DOCS + this.empresasService.seleccionada + '/limpieza_producto/';
modal: Modal = new Modal();
entidad:string="&entidad=limpieza_producto";
  constructor(private servidor: Servidor,private empresasService: EmpresasService) {}

  ngOnInit() {
      this.setItems();
  }
  photoURL(i,tipo,file) {
    this.verdoc=!this.verdoc;
    this.foto = this.baseurl+this.items[i].id+"_"+file;
  }

  setItems(){
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
            }
             console.log("mantenimientos",this.items);
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
          this.nuevoItem = new LimpiezaProducto(0,this.empresasService.seleccionada,'');
        }
    });
  }


    itemEdited(idItem: number) {
    this.guardar[idItem] = true;
    //console.log (fecha.toString());
  }
 saveItem(item: LimpiezaProducto) {
    this.guardar[item.id] = false;
    let parametros = '?id=' + item.id+this.entidad;        
    this.servidor.putObject(URLS.STD_ITEM, parametros, item).subscribe(
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
