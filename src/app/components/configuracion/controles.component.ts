import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { EmpresasService } from '../../services/empresas.service';
import { Servidor } from '../../services/servidor.service';
import { Empresa } from '../../models/empresa';
import { URLS } from '../../models/urls';
import { Control } from '../../models/control';
import { Modal } from '../../models/modal';

@Component({
  selector: 'tab-controles',
  templateUrl: './controles.component.html'
})

export class ControlesComponent implements OnInit {

  public subscription: Subscription;
  controles: Control[] = [];
  nuevoControl: Object = {tipoperiodo: 'Día'};
  guardar = [];
  idBorrar: number;
  modal: Modal = new Modal();

  constructor(public servidor: Servidor, public empresasService: EmpresasService) {}

  ngOnInit() {
    if (this.empresasService.seleccionada > 0) this.setEmpresa(this.empresasService.seleccionada.toString());
    this.subscription = this.empresasService.empresaSeleccionada.subscribe(
      emp => {
        this.setEmpresa(emp);
    });
    if (this.empresasService.administrador == false) {
      this.setEmpresa(this.empresasService.empresaActiva.toString());
    }
  }

   setEmpresa(emp: Empresa | string) {
    let params = typeof(emp) == "string" ? emp : emp.id
    let parametros = '&idempresa=' + params;
       // let parametros = '&idempresa=' + seleccionada.id; 
        this.servidor.getObjects(URLS.CONTROLES, parametros).subscribe(
          response => {
            this.controles = [];
            if (response.success && response.data) {
              for (let element of response.data) {
                this.controles.push(new Control(element.id, element.nombre, element.pla, element.valorminimo,
                  element.valormaximo, element.objetivo, element.tolerancia, element.critico, element.periodicidad,
                  element.tipoperiodo, element.idempresa
                ));
                this.guardar[element.id] = false;
              }
            }
        });
   }

  crearControl(nuevoControl: Control) {
    nuevoControl.idempresa = this.empresasService.seleccionada;
    this.servidor.postObject(URLS.CONTROLES, nuevoControl).subscribe(
      response => {
        if (response.success) {
          nuevoControl.id = response.id;
          this.controles.push(nuevoControl);
          this.nuevoControl = {tipoperiodo: 'Día'};
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
      this.servidor.deleteObject(URLS.CONTROLES, parametros).subscribe(
        response => {
          if (response.success) {
            let controlBorrar = this.controles.find(control => control.id == this.idBorrar);
            let indice = this.controles.indexOf(controlBorrar);
            this.controles.splice(indice, 1);
          }
      });
    }
  }

  modificarControl(idControl: number) {
    this.guardar[idControl] = true;
  }

  actualizarControl(control: Control) {
    this.guardar[control.id] = false;
    for (let property in control) {
      if (control[property] == '') control[property] = null;
    }
    let parametros = '?id=' + control.id;        
    this.servidor.putObject(URLS.CONTROLES, parametros, control).subscribe(
      response => {
        if (response.success) {
          console.log('Control updated');
        }
    });
  }

}
