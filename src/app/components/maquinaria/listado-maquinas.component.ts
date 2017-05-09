import { Component, Input, OnInit,Output,EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { EmpresasService } from '../../services/empresas.service';
import { Servidor } from '../../services/servidor.service';
import { Empresa } from '../../models/empresa';
import { URLS } from '../../models/urls';
import { Checklist } from '../../models/checklist';
import { Maquina } from '../../models/maquina';
import { Modal } from '../../models/modal';
import {MdSelect} from '@angular/material';

@Component({
  selector: 'listado-maquinas',
  templateUrl: './listado-maquinas.component.html',
  styleUrls:['./listado-maquinas.css']
})
export class ListadoMaquinasComponent implements OnInit {
  //@ViewChild('choicer') Choicer: ElementRef;
  @ViewChild('choicer') Choicer: MdSelect;
  @Output() maquinaSeleccionada: EventEmitter<Maquina>=new EventEmitter<Maquina>();
  @Output() listaMaquinas: EventEmitter<Maquina[]>=new EventEmitter<Maquina[]>();
  public subscription: Subscription;
  maquinaActiva: number = 0;
  maquina1: Maquina = new Maquina(0, 'Seleccionar máquina',0);
  maquinas: Maquina[] = [];
  novaMaquina: Maquina;// = new Maquina(0,'',0);
  modal: Modal = new Modal();
  public   modificaMaquina: boolean;
  public nuevoNombre:string;
  constructor(public servidor: Servidor, public empresasService: EmpresasService) {}

ngOnInit(){
 // this.subscription = this.empresasService.empresaSeleccionada.subscribe(x => this.loadChecklistList(x));
 if (this.empresasService.seleccionada) this.loadMaquinas(this.empresasService.seleccionada.toString());

}

     loadMaquinas(emp: Empresa | string) {
    let params = typeof(emp) == "string" ? emp : emp.id
    let parametros = '&idempresa=' + params;
        //let parametros = '&idempresa=' + seleccionada.id;
        // Llamada al servidor para conseguir las checklists
        this.servidor.getObjects(URLS.MAQUINAS, parametros).subscribe(
          response => {
            // Ocultar mostrar control checklists
            this.maquinaActiva = 0;
            // Vaciar la lista actual
            this.maquinas = [];
            this.maquinas.push(this.maquina1);
            if (response.success == 'true' && response.data) {
              for (let element of response.data) {
                this.maquinas.push(new Maquina(element.id,element.nombre, element.idempresa, element.ubicacion, element.numserie, element.fecha_adquisicion, element.fabricante, element.modelo, element.codigo_interno, element.potencia, element.medidas, element.funciones, element.doc, element.regimen_trabajo, element.ciclo_productivo, element.material, element.liquido_refrigerante, element.modo_trabajo, element.lubricacion ));
              }
            }
          },
              (error) => {console.log(error)},
              ()=>{
              this.listaMaquinas.emit(this.maquinas);
               this.expand();
              }
        );
   }




seleccionarMaquina(event:any){
//  console.log("changelist",valor,event);
//this.maquinaSeleccionada.emit(this.maquinas[event.target.value]);
  this.maquinaSeleccionada.emit(this.maquinas[event.value]);
  this.maquinaActiva = this.maquinas[event.value].id;
  this.unExpand();
}


// ngOnChanges(changes: {[propKey: string]: SimpleChange}) {

//   }

nuevaMaquina(maq: Maquina){
maq.idempresa = this.empresasService.seleccionada;
maq.nombre = this.nuevoNombre;
    this.servidor.postObject(URLS.MAQUINAS, maq).subscribe(
      response => {
        if (response.success) {
          maq.id = response.id;
          this.maquinas.push(maq);
          this.novaMaquina = null;
        }
    });
}

modificar(){
  let maquina = new Maquina(this.maquinaActiva,this.nuevoNombre,this.empresasService.seleccionada);
  let index = this.maquinas.findIndex((maquina)=>maquina.id == this.maquinaActiva);
  maquina = this.maquinas[index];
  maquina.nombre = this.nuevoNombre;
//let param = "&entidad=limpieza_zona";
let parametros = '?id=' + this.maquinaActiva;     
    this.servidor.putObject(URLS.MAQUINAS,parametros, maquina).subscribe(
      response => {
        if (response.success) {
          console.log("updated");
          // this.maquinas[index].nombre = this.nuevoNombre;
          // this.maquinaSeleccionada.emit(this.maquinas[index]);
          this.modificaMaquina = false;
        }
    });
}



  cerrarModal(event: boolean) {
    this.modal.visible = false;
    if (event) {
      let parametros = '?id=' + this.maquinaActiva;
      this.servidor.deleteObject(URLS.MAQUINAS, parametros).subscribe(
        response => {
          if (response.success) {
            let indice = this.maquinas.findIndex((mantenimiento) => mantenimiento.id == this.maquinaActiva);
           // let indice = this.mantenimientos.indexOf(controlBorrar);
            this.maquinas.splice(indice, 1);
            this.maquinaSeleccionada.emit(this.maquinas[0]);
            this.expand();
          }
      });
    }
  }
eliminaMaquina(){
      this.modal.titulo = 'borrarControlT';
    this.modal.subtitulo = 'borrarControlST';
    this.modal.eliminar = true;
    this.modal.visible = true;
}

// modificarMaquina(){
// this.modificaMaquina = !this.modificaMaquina;
// }

modificarItem(){
  this.nuevoNombre = this.maquinas[this.maquinas.findIndex((maquina)=>maquina.id==this.maquinaActiva)].nombre;
(this.novaMaquina)? this.novaMaquina = null :this.modificaMaquina = !this.modificaMaquina;

}

addItem(){
  this.nuevoNombre='';
  this.modificaMaquina=false;
  this.novaMaquina = new Maquina(0,'',0);
}




expand(){
setTimeout(()=>{this.Choicer.open();},200)
}
unExpand(){
  this.Choicer.close();
}
}
