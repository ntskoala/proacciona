import { Component, Input, Output, EventEmitter } from '@angular/core';

import { EmpresasService } from '../services/empresas.service';
import { TranslateService } from 'ng2-translate';
import { Modal } from '../models/modal';

@Component({
  selector: 'modal',
  templateUrl: '../assets/html/modal.component.html'
})
export class ModalComponent {
empresaSeleccionada:string;
checklist:string;
  constructor(public empresasService: EmpresasService, public translate: TranslateService) {
    translate.use(this.empresasService.idioma);
  }

  @Input() modal: Modal;
  @Output() onCerrar = new EventEmitter<boolean>();
  @Output() onImportar = new EventEmitter<string>();
  cerrar() {
    this.empresaSeleccionada="";
    this.checklist="";
    this.onCerrar.emit(false);
  }

  eliminar() {
    this.onCerrar.emit(true);
  }

  seleccionada(empresa:any){
    this.empresaSeleccionada = empresa.id;
    this.checklist="";
  }
  checklistseleccionada(checklist:any){
    this.checklist = checklist;
  }
  importar(){
    this.onImportar.emit(this.checklist);
    this.empresaSeleccionada="";
    this.checklist="";
  }
}
