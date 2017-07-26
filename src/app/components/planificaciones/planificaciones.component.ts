import { Component, OnInit } from '@angular/core';
import { Planificacion } from '../../models/planificacion';
import { PlanRealizado } from '../../models/planrealizado';
@Component({
  selector: 'app-planificaciones',
  templateUrl: './planificaciones.component.html',
  styleUrls: ['./planificaciones.component.css']
})
export class PlanificacionesComponent implements OnInit {
public calendario:boolean=false;
public familia:boolean=false;
public permiso:boolean=false;

public planes: Planificacion[] = [];
public plan: Planificacion;
public planRealizado: PlanRealizado;

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
}
actualizaFamilias(id){
console.log('nuevoPlanRealizado',id)
}

}
