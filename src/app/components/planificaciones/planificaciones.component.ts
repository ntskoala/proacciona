import { Component, OnInit } from '@angular/core';
import { Planificacion } from '../../models/planificacion';

@Component({
  selector: 'app-planificaciones',
  templateUrl: './planificaciones.component.html',
  styleUrls: ['./planificaciones.component.css']
})
export class PlanificacionesComponent implements OnInit {
public calendario:boolean=false;
public familia:boolean=false;

public planes: Planificacion[] = [];
public plan: Planificacion;

  constructor() { }

  ngOnInit() {
  }

calendarios(){
this.calendario = !this.calendario;
}
familias(){
this.familia = !this.familia;
}
loadPlanes(planes){
this.planes = planes;
}
seleccionPlan(plan){
this.plan = plan;
}
nuevoPlanRealizado(id:number){
console.log('nuevoPlanRealizado',id)
}
}
