import { Component, Input, OnInit,Output,EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { EmpresasService } from '../../services/empresas.service';
import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { Empresa } from '../../models/empresa';
import { LimpiezaZona } from '../../models/limpiezazona';
import { Modal } from '../../models/modal';

@Component({
  selector: 'listado-limpieza',
  templateUrl: './listado-limpieza.component.html',
  styleUrls:['./listado-limpieza.css']
})
export class ListadoLimpiezasComponent implements OnInit {
  @Output() zonaSeleccionada: EventEmitter<LimpiezaZona>=new EventEmitter<LimpiezaZona>();
  @Output() listaZonas: EventEmitter<LimpiezaZona[]>=new EventEmitter<LimpiezaZona[]>();
  public subscription: Subscription;
  public limpiezaActiva: number = 0;
  public limpieza1: LimpiezaZona = new LimpiezaZona(0,0, 'Seleccionar zona');
  public limpiezas: LimpiezaZona[] = [];
  public novaLimpieza: LimpiezaZona = new LimpiezaZona(0,0,'');
  public modal: Modal = new Modal();
  public modificaZona: boolean;
  public nuevoNombre:string;
  constructor(public servidor: Servidor, public empresasService: EmpresasService) {}

ngOnInit(){
 // this.subscription = this.empresasService.empresaSeleccionada.subscribe(x => this.loadChecklistList(x));
 if (this.empresasService.seleccionada) this.loadLimpiezas(this.empresasService.seleccionada.toString());
}

     loadLimpiezas(emp: Empresa | string) {
    let params = typeof(emp) == "string" ? emp : emp.id
    let parametros = '&idempresa=' + params+"&entidad=limpieza_zona";
        //let parametros = '&idempresa=' + seleccionada.id;
        // Llamada al servidor para conseguir las checklists
        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            // Ocultar mostrar control checklists
            this.limpiezaActiva = 0;
            // Vaciar la lista actual
            this.limpiezas = [];
            this.limpiezas.push(this.limpieza1);
            if (response.success == 'true' && response.data) {
              for (let element of response.data) {
                this.limpiezas.push(new LimpiezaZona(element.id,element.idempresa,element.nombre, element.descripcion));
              }
              this.listaZonas.emit(this.limpiezas);
            }
        });
   }

seleccionarZona(valor: any, event:any){
//  console.log("changelist",valor,event);
//this.maquinaSeleccionada.emit(this.maquinas[event.target.value]);
  this.zonaSeleccionada.emit(this.limpiezas[valor]);
  this.limpiezaActiva = this.limpiezas[valor].id;
}


// ngOnChanges(changes:SimpleChange) {}

nuevaZona(zona: LimpiezaZona){
zona.idempresa = this.empresasService.seleccionada;
let param = "&entidad=limpieza_zona";
    this.servidor.postObject(URLS.STD_ITEM, zona,param).subscribe(
      response => {
        if (response.success) {
          zona.id = response.id;
          this.limpiezas.push(zona);
          this.novaLimpieza = new LimpiezaZona(0,0,'');
        }
    });
}

modificar(){
  let zona = new LimpiezaZona(this.limpiezaActiva,this.empresasService.seleccionada,this.nuevoNombre,'');
let param = "&entidad=limpieza_zona";
let parametros = '?id=' + this.limpiezaActiva+param;     
    this.servidor.putObject(URLS.STD_ITEM,parametros, zona).subscribe(
      response => {
        if (response.success) {
          console.log("updated");
          let index = this.limpiezas.findIndex((elem) =>elem.id == this.limpiezaActiva);
          this.limpiezas[index].nombre = this.nuevoNombre;
          this.listaZonas.emit(this.limpiezas);
          this.modificaZona = false;
        }
    });
}



  cerrarModal(event: boolean) {
    this.modal.visible = false;
    if (event) {
      let parametros = '?id=' + this.limpiezaActiva+'&entidad=limpieza_zona';
      this.servidor.deleteObject(URLS.STD_ITEM, parametros).subscribe(
        response => {
          if (response.success) {
            let indice = this.limpiezas.findIndex((limpieza) => limpieza.id == this.limpiezaActiva);
           // let indice = this.mantenimientos.indexOf(controlBorrar);
            this.limpiezas.splice(indice, 1);
          }
      });
    }
  }
eliminaZona(){
      this.modal.titulo = 'borrarControlT';
    this.modal.subtitulo = 'borrarControlST';
    this.modal.eliminar = true;
    this.modal.visible = true;
}

modificarZona(){
this.modificaZona = !this.modificaZona;
}

}
