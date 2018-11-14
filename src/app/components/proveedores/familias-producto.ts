import { Component, OnInit, Input } from '@angular/core';

import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { PermisosService } from '../../services/permisos.service';
import { Modal } from '../../models/modal';
import { FamiliasProducto } from '../../models/proveedorfamilias';

@Component({
  selector: 'familias-producto',
  templateUrl: './familias-producto.html',
  styleUrls:['proveedores.component.css']
})

export class FamiliasComponent implements OnInit {

public nuevoItem: FamiliasProducto = new FamiliasProducto('',0,null,0);
public items: FamiliasProducto[];
public guardar = [];
public idBorrar;
public modal: Modal = new Modal();
public modal2: Modal;
public destino: boolean=false;

public entidad:string="&entidad=proveedores_familia";

  constructor(public servidor: Servidor,public empresasService: EmpresasService, public permisosService:PermisosService) {}

  ngOnInit() {
      this.setItems();
      if ((URLS.SERVER == 'https://tfc.proacciona.es/' && this.empresasService.seleccionada == 26) || ((URLS.SERVER == 'https://tfc1-181808.appspot.com/' && this.empresasService.seleccionada == 77))) {
        this.destino=true;
      }
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
                  this.items.push(new FamiliasProducto (element.nombre,element.idempresa,element.nivel_destino,element.id));
                  // this.url.push({"imgficha":this.baseurl + element.id +'_'+element.imgficha,"imgcertificado":this.baseurl + element.id +'_'+element.imgcertificado});
             }
            }
             //console.log("familias",this.items);
        });
       
  }



  newItem() {
    console.log (this.nuevoItem);
    this.nuevoItem.idempresa = this.empresasService.seleccionada;

    let param = this.entidad
    this.servidor.postObject(URLS.STD_ITEM, this.nuevoItem,param).subscribe(
      response => {
        if (response.success) {
          this.nuevoItem.id = response.id;
          this.items.push(this.nuevoItem);
          this.nuevoItem = new FamiliasProducto('',0,null,0);
        }
    });
  }


    itemEdited(idItem: number) {
    this.guardar[idItem] = true;
    //console.log (fecha.toString());
  }
 saveItem(item: FamiliasProducto) {
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
            let controlBorrar = this.items.find(item => item.id == this.idBorrar);
            let indice = this.items.indexOf(controlBorrar);
            this.items.splice(indice, 1);
          }
      });
    }
  }



}
