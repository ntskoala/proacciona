import { Component, OnInit, Input } from '@angular/core';

import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { Empresa } from '../../models/empresa';
import { MantenimientosMaquina } from '../../models/mantenimientosmaquina';
 import { Maquina } from '../../models/maquina';
 import { Modal } from '../../models/modal';
@Component({
  selector: 'mantenimientos',
  templateUrl: './mantenimientos.component.html',
  styleUrls: ['mantenimientos.css']
})
export class MantenimientosComponent implements OnInit {
@Input() maquina:Maquina;
public mantenimientos: MantenimientosMaquina[] =[]; 
public nuevoMantenimiento: MantenimientosMaquina = new MantenimientosMaquina(0,0,'','');
public guardar =[];
public idBorrar;
  modal: Modal = new Modal();
  constructor(private servidor: Servidor,private empresasService: EmpresasService) {}

  ngOnInit() {
    //solo se carga el control si hay una maquina seleccionada, por eso no necesito controlar
    this.setMantenimientos();
    }
  setMantenimientos(){
    let params = this.maquina.id;
    let parametros = '&idmaquina=' + params;
       // let parametros = '&idempresa=' + seleccionada.id; 
        this.servidor.getObjects(URLS.MANTENIMIENTOS, parametros).subscribe(
          response => {
            this.mantenimientos = [];
            if (response.success && response.data) {
              for (let element of response.data) {
                this.mantenimientos.push(new MantenimientosMaquina(element.id, element.idmaquina, element.nombre, element.tipo, element.periodicidad,
                  element.tipoperiodo, element.doc));
                this.guardar[element.id] = false;
              }
            }
        });
  }

    modificarMantenimiento(idMantenimiento: number) {
    this.guardar[idMantenimiento] = true;
  }
 actualizarMantenimiento(mantenimiento: MantenimientosMaquina) {
    this.guardar[mantenimiento.id] = false;

    let parametros = '?id=' + mantenimiento.id;        
    this.servidor.putObject(URLS.MANTENIMIENTOS, parametros, mantenimiento).subscribe(
      response => {
        if (response.success) {
          console.log('Mantenimiento updated');
        }
    });
  }
  crearMantenimiento() {
    this.nuevoMantenimiento.idmaquina = this.maquina.id;
    this.servidor.postObject(URLS.MANTENIMIENTOS, this.nuevoMantenimiento).subscribe(
      response => {
        if (response.success) {
          this.nuevoMantenimiento.id = response.id;
          this.mantenimientos.push(this.nuevoMantenimiento);
          this.nuevoMantenimiento = new MantenimientosMaquina(0,0,'');
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
      let parametros = '?id=' + this.idBorrar;
      this.servidor.deleteObject(URLS.MANTENIMIENTOS, parametros).subscribe(
        response => {
          if (response.success) {
            let controlBorrar = this.mantenimientos.find(mantenimiento => mantenimiento.id == this.idBorrar);
            let indice = this.mantenimientos.indexOf(controlBorrar);
            this.mantenimientos.splice(indice, 1);
          }
      });
    }
  }

}