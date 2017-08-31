import { Component, Input, OnInit,Output,EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { EmpresasService } from '../../../services/empresas.service';
import { Servidor } from '../../../services/servidor.service';
import { URLS } from '../../../models/urls';
import { Empresa } from '../../../models/empresa';
import { Planificacion } from '../../../models/planificacion';
import { Modal } from '../../../models/modal';
import {MdSelect} from '@angular/material';
import * as moment from 'moment';
export class Familia{
  constructor(
    public id: number,
    public idempresa: number,
    public nombre:string,
    public descripcion:string
  ){}
}
@Component({
  selector: 'app-planes',
  templateUrl: './planes.component.html',
  styleUrls: ['./planes.component.css']
})
export class PlanesComponent implements OnInit {
  @ViewChild('choicer') Choicer: MdSelect;
  @Output() planSeleccionado: EventEmitter<Planificacion>=new EventEmitter<Planificacion>();
  @Output() listaPlanes: EventEmitter<Planificacion[]>=new EventEmitter<Planificacion[]>();

  
  public subscription: Subscription;
  public planActivo: number = 0;
  public plan: Planificacion = new Planificacion(null,null,null,null,0,new Date(),'','',0);
  public planes: Planificacion[] = [];
  public guardar = [];
  public familias: Familia[];
  public tipo:string="planificacion";
  public novoPlan: Planificacion;// = new Planificacion(0,0,'');
  public modal: Modal = new Modal();
  public modificaPlan: boolean;
  public nuevoNombre:string;
  public open:boolean;
  public import: boolean=false;
  public es;
  public entidad:string="&entidad=planificaciones";
  constructor(public servidor: Servidor, public empresasService: EmpresasService) {}

ngOnInit(){
 // this.subscription = this.empresasService.empresaSeleccionada.subscribe(x => this.loadChecklistList(x));
 if (this.empresasService.seleccionada) this.loadplanes(this.empresasService.seleccionada.toString());
 this.loadFamilias();
                 this.es = {
            monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
                'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            dayNames: ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'],
            dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
            dayNamesMin: ["Do","Lu","Ma","Mi","Ju","Vi","Sa"],
            firstDayOfWeek: 1
        }; 
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
            //this.planes.push(this.plan);
            if (response.success == 'true' && response.data) {
              for (let element of response.data) {
                this.planes.push(new Planificacion(element.id,element.idempresa,element.nombre,element.descripcion,element.familia,new Date(element.fecha), element.periodicidad,element.responsable,element.supervisor));
              }
            }
          },
              (error) => {console.log(error)},
              ()=>{
              this.listaPlanes.emit(this.planes);
               //this.expand(this.Choicer.nativeElement);
              }
        );
   }
loadFamilias(){
  return new Promise((resolve,reject)=>{
    let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=planificaciones_familias&order=nombre";
        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            this.familias = [];
            if (response.success == 'true' && response.data) {
              for (let element of response.data) {
                this.familias.push(new Familia(element.id,element.idempresa,element.nombre,element.descripcion));
              }
              resolve('ok');
            }
          },
              (error) => {
                console.log(error)
                resolve(error)
              },
              ()=>{
              }
        );
  });
}


    itemEdited(idItem: number, fecha?: any) {
    this.guardar[idItem] = true;
    //console.log (fecha.toString());
  }
// ngOnChanges(changes:SimpleChange) {}



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


checkBorrar(){
this.modal.visible = true;
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

  newItem() {
    console.log (this.plan);
    let param = this.entidad;
    this.plan.fecha = new Date(Date.UTC(this.plan.fecha.getFullYear(), this.plan.fecha.getMonth(), this.plan.fecha.getDate()))
    this.plan.idempresa = this.empresasService.seleccionada;
    //this.plan.periodicidad = this.mantenimientos[i].periodicidad;
    //this.addnewItem = this.nuevoItem;

    this.servidor.postObject(URLS.STD_ITEM, this.plan,param).subscribe(
      response => {
        if (response.success) {
          this.planes.push(new Planificacion(response.id,this.plan.idempresa,this.plan.nombre,this.plan.descripcion,this.plan.familia,
          this.plan.fecha,this.plan.periodicidad,this.plan.responsable,this.plan.supervisor));
          this.plan = new Planificacion(null,null,null,null,0,new Date(),'','',0);
        }
    },
    error =>console.log(error),
    () =>  {}
    );
   
  }

modificarItem(){
  this.nuevoNombre = this.planes[this.planes.findIndex((plan)=>plan.id==this.planActivo)].nombre;
(this.novoPlan)? this.novoPlan = null :this.modificaPlan = !this.modificaPlan;
}

 saveItem(item: Planificacion,i: number) {
    this.guardar[item.id] = false;
    let parametros = '?id=' + item.id+this.entidad;    
    item.fecha = new Date(Date.UTC(item.fecha.getFullYear(), item.fecha.getMonth(), item.fecha.getDate()))
    item.periodicidad = this.planes[i].periodicidad; 
    item.supervisor = this.planes[i].supervisor;
    console.log(item);
    this.servidor.putObject(URLS.STD_ITEM, parametros, item).subscribe(
      response => {
        if (response.success) {
          console.log('item updated');
        }
    });

  }


addItem(){
  this.nuevoNombre='';
  this.modificaPlan=false;
  this.novoPlan = new Planificacion(null,null,null,null,null,moment(new Date()), null,null);
}


setPeriodicidad(periodicidad: string, idItem?: number, i?: number){
  if (!idItem){
  this.plan.periodicidad = periodicidad;
  console.log(this.plan.periodicidad);

  }else{
    console.log(idItem,i,periodicidad);
    this.itemEdited(idItem);
    this.planes[i].periodicidad = periodicidad;
    console.log(this.planes[i]);
  }
}


setSupervisor(idUsuario: number,item: Planificacion){
item.supervisor = idUsuario;
this.itemEdited(item.id);
}


}
