import { Component, OnInit, Input } from '@angular/core';

import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { Modal } from '../../models/modal';
import { FamiliasProducto } from '../../models/proveedorfamilias';

@Component({
  selector: 'familias-producto',
  templateUrl: './familias-producto.html',
  styleUrls:['proveedores.component.css']
})

export class FamiliasComponent implements OnInit {

public nuevoItem: FamiliasProducto = new FamiliasProducto('',0,0);
public items: FamiliasProducto[];
public guardar = [];
public idBorrar;
modal: Modal = new Modal();
entidad:string="&entidad=proveedores_familia";
  constructor(private servidor: Servidor,private empresasService: EmpresasService) {}

  ngOnInit() {
      this.setItems();
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
                  this.items.push(new FamiliasProducto (element.nombre,element.idempresa,element.id));
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
          this.nuevoItem = {"id":0,"idempresa":0,"nombre":''};
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
