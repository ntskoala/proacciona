import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Router,ActivatedRoute, ParamMap  } from '@angular/router';


import { EmpresasService } from '../../services/empresas.service';
import { Planificacion } from '../../models/planificacion';
import { Formacion } from '../../models/formaciones';
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

public incidencia:any;
public calendario:boolean=false;
public familia:boolean=false;
public permiso:boolean=false;
public alerta:boolean=false;
public grupos:boolean=false;
public estadoSideNav:string="cerrado";
public subMenu:string=null;
public planes: Planificacion[] = [];
public plan: Planificacion;
public formaciones: Formacion[]=[];
public planRealizado: PlanRealizado;
public newPlanRealizado:number;
public selectedTab: number=null;
public trabajadores;
public convocatorias:boolean=false;
  constructor(public empresasService: EmpresasService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.incidencia = {'origen':'planificaciones','idOrigen':null}
    let params = this.route.params["_value"]
    if (params["modulo"] == "planificaciones_realizadas"){
        this.selectedTab = 1;
    }else{
      this.selectedTab = 0;
    }
  }


cambioMenu(opcion: string){

  this.snCalendar.toggle().then(
  (valor)=>{
    console.log ('$$$$',valor,this.subMenu, opcion)
    if (valor=="open")
      {
        console.log ('abriendo.-..')
      this.closeSideNav().then(
        (resultado)=>{
          switch (opcion){
            case "calendario":
              this.calendario=true;
              break;
            case "familia":
              this.familia=true;
              break;
            case "permiso":
              this.permiso=true;
              break;
            case "alerta":
              this.alerta=true;
              break;
            case "grupos":
              this.grupos=true;
              break;
            case "convocatorias":
              this.convocatorias=true;
              break;
          }
           this.subMenu = opcion;   
        });
      }
      
     if (valor=="close"){
        console.log ('cerrando.-..')
        //console.log ('$$$',this.subMenu, opcion)
        this.closeSideNav().then(
        (resultado)=>{
        if (this.subMenu != opcion){
          console.log ('$$',this.subMenu, opcion)
          switch (opcion){
            case "calendario":
              this.calendario=true;
              break;
            case "familia":
              this.familia=true;
              break;
            case "permiso":
              this.permiso=true;
              break;
            case "alerta":
              this.alerta=true;
              break;
            case "grupos":
              this.grupos=true;
              break;
            case "convocatorias":
              this.convocatorias=true;
              break;
          }
            this.subMenu = opcion;
            this.snCalendar.toggle();
        }else{
          this.subMenu=null;
        }
        });
        }
  });

}
closeSideNav(){
  return new Promise((resolve, reject) => {
  console.log('close sideNav')
  //this.snCalendar.close();
  this.calendario=false;
  this.familia=false;
  this.permiso=false;
  this.alerta=false;
  this.grupos=false;
  this.convocatorias=false;
   resolve('ok')
    });
}
cerrarSideNav(){
  this.snCalendar.toggle();
  this.closeSideNav();
    this.subMenu = null;
}
// calendarios(){

// //this.calendario = !this.calendario;
// this.snCalendar.toggle().then(
//   (valor)=>{
//     if (valor.type="open") this.calendario=true;
//   }
// )
// }
// familias(){

// this.snCalendar.toggle().then(
//   (valor)=>{
//     if (valor.type="open") this.familia=true;
//   }
// )
// }
// permisos(){
// this.snCalendar.toggle().then(
//   (valor)=>{
//     if (valor.type="open") this.permiso=true;
//   }
// )
// }
// alertas(){
// this.snCalendar.toggle().then(
//   (valor)=>{
//     if (valor.type="open") this.alerta=true;
//   }
// )
// }

loadPlanes(planes){
this.planes = planes;
}
loadCursos(cursos){
  console.log('cursos2',cursos)
  this.formaciones = cursos;
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
actualizaFamilias(event){
console.log('familia Actualizad',event)
}
actualizaPermisos(id){
console.log('permisos actualizados',event)
}
actualizaAlertas(id){
console.log('Alertasualizadas Act',event)
}

loadedTrabajadores(event){
  console.log('trabajadores en planificaciones',event);
this.trabajadores=event;
}
}
