import { Component, Input, OnInit,Output,EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { EmpresasService } from '../../services/empresas.service';
import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { Empresa } from '../../models/empresa';
import { Planificacion } from '../../models/planificacion';
import { Modal } from '../../models/modal';
import {MdSelect} from '@angular/material';
import * as moment from 'moment';
@Component({
  selector: 'listado-planificaciones',
  templateUrl: './listado-planificaciones.component.html',
  styleUrls:['./listado-planificaciones.css']
})
export class ListadoPlanificacionesComponent implements OnInit {
  //@ViewChild('choicer') Choicer: ElementRef;
  @ViewChild('choicer') Choicer: MdSelect;
  @Output() planSeleccionado: EventEmitter<Planificacion>=new EventEmitter<Planificacion>();
  @Output() listaPlanes: EventEmitter<Planificacion[]>=new EventEmitter<Planificacion[]>();

  
  public subscription: Subscription;
  public planActivo: number = 0;
  public plan: Planificacion = new Planificacion(0,0, 'Seleccionar plan',null);
  public planes: Planificacion[] = [];
  public novoPlan: Planificacion;// = new Planificacion(0,0,'');
  public modal: Modal = new Modal();
  public modificaPlan: boolean;
  public nuevoNombre:string;
  public open:boolean;
  public import: boolean=false;
  constructor(public servidor: Servidor, public empresasService: EmpresasService) {}

ngOnInit(){
 // this.subscription = this.empresasService.empresaSeleccionada.subscribe(x => this.loadChecklistList(x));
 if (this.empresasService.seleccionada) this.loadplanes(this.empresasService.seleccionada.toString());

}

     loadplanes(emp: Empresa | string) {
    let params = typeof(emp) == "string" ? emp : emp.id
    let parametros = '&idempresa=' + params+"&entidad=planificaciones&order=nombre";
        //let parametros = '&idempresa=' + seleccionada.id;
        // Llamada al servidor para conseguir las checklists
        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            // Ocultar mostrar control checklists
            this.planActivo = 0;
            // Vaciar la lista actual
            this.planes = [];
            this.planes.push(this.plan);
            if (response.success == 'true' && response.data) {
              for (let element of response.data) {
                this.planes.push(new Planificacion(element.id,element.idempresa,element.nombre, new Date(element.fecha), element.periodicidad,element.photo,element.supervisor));
              }
            }
          },
              (error) => {console.log(error)},
              ()=>{
              this.listaPlanes.emit(this.planes);
               //this.expand(this.Choicer.nativeElement);
               this.expand();
              }
        );
   }

seleccionarPlan(event:any){
  this.planSeleccionado.emit(this.planes[event.value]);
  this.planActivo = this.planes[event.value].id;
  this.unExpand();
}


// ngOnChanges(changes:SimpleChange) {}

nuevoPlan(plan: Planificacion){
plan.idempresa = this.empresasService.seleccionada;
plan.nombre = this.nuevoNombre;
plan.idempresa = this.empresasService.seleccionada;
plan.fecha = moment(new Date()).format("YYYY-MM-DD");
let param = "&entidad=planificaciones";
    this.servidor.postObject(URLS.STD_ITEM, plan,param).subscribe(
      response => {
        if (response.success) {
          plan.id = response.id;
          this.planes.push(plan);
          this.novoPlan = null;
        }
    });
}

modificar(){
  let index = this.planes.findIndex((plan)=>plan.id == this.planActivo);

  let plan = this.planes[index];
  plan.nombre = this.nuevoNombre;
let param = "&entidad=planificaciones";
let parametros = '?id=' + this.planActivo+param;     
    this.servidor.putObject(URLS.STD_ITEM,parametros, plan).subscribe(
      response => {
        if (response.success) {
          console.log("updated");
          //let index = this.planes.findIndex((elem) =>elem.id == this.planActivo);
          this.planes[index].nombre = this.nuevoNombre;
          this.listaPlanes.emit(this.planes);
          this.modificaPlan = false;
        }
    });
}



  cerrarModal(event: boolean) {
    this.modal.visible = false;
    if (event) {
      let parametros = '?id=' + this.planActivo+'&entidad=planificaciones';
      this.servidor.deleteObject(URLS.STD_ITEM, parametros).subscribe(
        response => {
          if (response.success) {
            let indice = this.planes.findIndex((plan) => plan.id == this.planActivo);
           // let indice = this.mantenimientos.indexOf(controlBorrar);
            this.planes.splice(indice, 1);
            this.planActivo = 0;
            this.planSeleccionado.emit(this.planes[0]);
            this.expand();
          }
      });
    }
  }
eliminaPlan(){
      this.modal.titulo = 'borrarControlT';
    this.modal.subtitulo = 'borrarControlST';
    this.modal.eliminar = true;
    this.modal.visible = true;
}

// modificarZona(){
// this.modificaPlan = !this.modificaPlan;
// }

modificarItem(){
  this.nuevoNombre = this.planes[this.planes.findIndex((plan)=>plan.id==this.planActivo)].nombre;
(this.novoPlan)? this.novoPlan = null :this.modificaPlan = !this.modificaPlan;
}

addItem(){
  this.nuevoNombre='';
  this.modificaPlan=false;
  this.novoPlan = new Planificacion(0,0,'',null);
}



expand(){
setTimeout(()=>{this.Choicer.open();},200)
}
unExpand(){
  this.Choicer.close();
}
}
