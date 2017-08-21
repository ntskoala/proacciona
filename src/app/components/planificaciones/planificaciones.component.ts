import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Planificacion } from '../../models/planificacion';
import { PlanRealizado } from '../../models/planrealizado';
@Component({
  selector: 'app-planificaciones',
  templateUrl: './planificaciones.component.html',
  styleUrls: ['./planificaciones.component.css']
})
export class PlanificacionesComponent implements OnInit {
//@Output() newPlanRealizado: EventEmitter<number> = new EventEmitter<number>();
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

calendarios(){
this.calendario = !this.calendario;
}
familias(){
this.familia = !this.familia;
}
permisos(){
this.permiso = !this.permiso;
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
