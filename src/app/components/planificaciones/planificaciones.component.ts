import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Planificacion } from '../../models/planificacion';
import { PlanRealizado } from '../../models/planrealizado';
@Component({
  selector: 'app-planificaciones',
  templateUrl: './planificaciones.component.html',
  styleUrls: ['./planificaciones.component.css']
})
export class PlanificacionesComponent implements OnInit {
//@Output() newPlanRealizado: EventEmitter<number> = new EventEmitter<number>();
@ViewChild('sidenavCalendar') snCalendar: any;
// @ViewChild('sidenavFamilias') snFamilias: any;
// @ViewChild('sidenavPermisos') snPermisos: any;
public calendario:boolean=false;
public familia:boolean=false;
public permiso:boolean=false;

public planes: Planificacion[] = [];
public plan: Planificacion;
public planRealizado: PlanRealizado;
public newPlanRealizado:number;
  constructor() { }

  ngOnInit() {
  }
closeSideNav(){
  console.log('cerrando... sideNav')
  this.calendario=false;
  this.familia=false;
  this.permiso=false
}
calendarios(){

//this.calendario = !this.calendario;
this.snCalendar.toggle().then(
  (valor)=>{
    if (valor.type="open") this.calendario=true;
  }
)
}
familias(){

this.snCalendar.toggle().then(
  (valor)=>{
    if (valor.type="open") this.familia=true;
  }
)
}
permisos(){
this.snCalendar.toggle().then(
  (valor)=>{
    if (valor.type="open") this.permiso=true;
  }
)
}
loadPlanes(planes){
this.planes = planes;
}
seleccionPlan(plan){
this.plan = plan;
}
seleccionPlanRealizado(plan){
this.planRealizado = plan;
}
nuevoPlanRealizado(id:number){
console.log('nuevoPlanRealizado',id)
//this.newPlanRealizado.emit(id);
this.newPlanRealizado = id;

}
actualizaFamilias(id){
console.log('nuevoPlanRealizado',id)
}

}
