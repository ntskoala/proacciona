import { Component, OnInit, Input,Output, EventEmitter } from '@angular/core';
import {Moment} from 'moment';
import * as moment from 'moment/moment';

import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { Empresa } from '../../models/empresa';
 import { Planificacion } from '../../models/planificacion';
  import { Usuario } from '../../models/usuario';
 import { CalendarioLimpieza } from '../../models/calendarlimpieza';
 import { PlanRealizado } from '../../models/planrealizado';
   import { LimpiezaElemento } from '../../models/limpiezaelemento';
//  import { MantenimientosMaquina } from '../../models/mantenimientosmaquina';

 import { Periodicidad } from '../../models/periodicidad';

@Component({
  selector: 'calendarios-planificaciones',
  templateUrl: './calendarios-planificaciones.component.html',
  styleUrls: ['./calendarios.css']
})
export class CalendariosPlanificacionesComponent implements OnInit {
public planificacion: Planificacion;
//@Input() planes: Planificacion[];
@Output() nuevoPlanRealizado:EventEmitter<number>= new EventEmitter<number>();
//public calendario: CalendarioLimpieza[];
public planes: Planificacion[];
public cols:number = 7;
public events :any[] =[];
public events_realizados :any[] =[];
public eventsSoucers:any;
public headerCalendar: any;
public es:any;
public cat:any;
public locale:string;
public buttonText:any;
public dialogVisible: boolean = false;
public planrealizado: PlanRealizado;
public newdate = new Date();
public periodicidad: Periodicidad;
public moment: Moment;
//public mantenimientos: LimpiezaElemento[]=[];
public usuarios:Usuario[];
public tipoevento:string[]=[];
public event:any;
public estado;
public emptyDate: Date;
//public localSupervisor: string;
public supervisor: string;
entidad:string="&entidad=planificaciones_realizadas";
public supervisar:object[]=[{"value":0,"label":"porSupervisar"},{"value":1,"label":"correcto"},{"value":2,"label":"incorrecto"}];
  constructor(public servidor: Servidor,public empresasService: EmpresasService) {}


  ngOnInit() {
      //this.setEventsMantenimientos();
      this.loadSupervisores();
      this.headerCalendar = {left: 'prev,next today',center: 'title',right: 'month,basicWeek,basicDay,listMonth,listYear'};
       
       this.empresasService.idioma == "cat"?this.locale="ca":this.locale="es";
       
}
  setEventsMantenimientos(){

    let parametros = '&idempresa=' + this.empresasService.empresaActiva+"&entidad=planificaciones&order=nombre";
        //let parametros = '&idempresa=' + seleccionada.id;
        // Llamada al servidor para conseguir las checklists
        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
           // this.calendario = [];
           this.events = [];
           this.planes=[];
            if (response.success && response.data) {
              for (let element of response.data) {
                let fecha;
                let repeticion;
                let color = this.setColor(element.fecha)
                if (element.periodicidad){
                 repeticion = this.checkPeriodo(element.periodicidad);
                
                if (repeticion =='por uso'){
                  console.log('############POR USO')
                  fecha = new Date();
                  color = "#3333ff";
                }else{
                  fecha = element.fecha;
                }
              }else{
                 repeticion =null;
                  fecha = element.fecha;
                }

               // this.calendario.push(new CalendarioLimpieza(element.zona, element.nombre, element.tipo, element.periodicidad));
                 let supervisor = ''; 
                (element.supervisor>0)? supervisor = this.findSupervisor(element.supervisor):supervisor =  '';
                //console.log ('#',element.idsupervisor,supervisor);
                  this.events.push({"idplan":element.id,"title": element.nombre,"familia":element.familia,"start":fecha,"responsable":element.responsable,"periodicidad":element.periodicidad,
                  "color":color,"descripcion":element.descripcion,"estado":"pendiente","idsupervisor":element.supervisor,"supervisor":supervisor});
                this.planes.push(new Planificacion(element.id,element.idempresa,element.nombre,element.descripcion, element.familia,
                 new Date(element.fecha), element.periodicidad,element.responsable,element.supervisor));

              }
                           this.loadRealizados();
            }
        },
        (error) => console.log(error),
        ()=> {});
  }
loadRealizados(){
   console.log('@realizados ini');
///****** INSEERT MANTENIMIENTOS REALIZADOS */
///****** INSEERT MANTENIMIENTOS REALIZADOS */
    let params = this.empresasService.seleccionada;
    let parametros2 = '&idempresa=' + params+this.entidad;
    //  let parametros = '&idempresa=' + this.empresasService.seleccionada; 
        this.servidor.getObjects(URLS.STD_ITEM, parametros2).subscribe(
          response => {
            this.events_realizados = [];
            if (response.success && response.data) {
              for (let element of response.data) {  
                let supervisionColor ='';
                if (element.supervision == 1) supervisionColor = 'darkblue';
                if (element.supervision == 2) supervisionColor = 'red';
                let estado ='';
                (element.supervision == 0)? estado = 'realizado': estado = 'supervisado';
                let supervisor = ''; 
                (element.idsupervisor>0)? supervisor = this.findSupervisor(element.idsupervisor):supervisor =  '';
                  console.log('@'+supervisor);
                  this.events.push({"id":element.id,"idplan":element.idplan,"title":element.nombre,"familia":element.familia,
                  "descripcion":element.descripcion,"start":element.fecha,"prevista":element.fecha_prevista,"tipo":element.tipo,
                  "elemento":element.elemento,"usuario":element.idusuario,"responsable":element.responsable,"color":"#33cc33","estado":estado,
                  "borderColor":supervisionColor,"textColor":supervisionColor,"idsupervisor":element.idsupervisor,
                  "supervisor":supervisor,"supervision":element.supervision,
                  "fecha_supervision":element.fecha_supervision,"detalles_supervision":element.detalles_supervision,"imagen":element.imagen,"doc":element.doc});
             }
            //  console.log("realizadost",this.events_realizados);
             this.events.concat(this.events_realizados);
             // console.log("events",this.events);
            }
        });
}
loadSupervisores(){
    let params = this.empresasService.seleccionada;
    let parametros2 = "&entidad=usuarios"+'&idempresa=' + params;
        this.servidor.getObjects(URLS.STD_ITEM, parametros2).subscribe(
          response => {
            this.usuarios = [];
            if (response.success && response.data) {
              //console.log(response.data)
              for (let element of response.data) {  
                  this.usuarios.push(new Usuario(
                    element.id,element.usuario,element.password,element.tipouser,element.email,element.idempresa
                  ));
             }
             //console.log(this.usuarios)
             this.setEventsMantenimientos();
            // this.localSupervisor = this.findSupervisor(this.empresasService.userId);
            }
        });
}

findSupervisor(id:number){
//console.log(id);
let index = this.usuarios.findIndex((user)=>user.id==id)
//console.log(this.usuarios[index]);
let user = this.usuarios[index].usuario;
//console.log(user);
return user;
}

checkPeriodo(periodicidad: string): string{
let valor:string;
let periodo = JSON.parse(periodicidad);
return periodo.repeticion;
}

setColor(fecha){
  let color: string;
  let hoy = Date.now();
  let fecha_event = Date.parse(fecha); 
      color="#F67E1F";
      if (fecha_event < hoy) color= "#E65A58";
  return color;
}


list(cal){
  // console.log('list');
  // console.log(cal);
  cal.changeView('listMonth')
}

handleEventClick(event){
        console.log(event);
       this.event = event.calEvent;

      if (event.calEvent.estado == 'pendiente'){
        this.estado="pendiente";
        this.planrealizado = new PlanRealizado(null,event.calEvent.idplan,event.calEvent.idfamilia,this.empresasService.seleccionada,event.calEvent.title, 
        event.calEvent.descripcion,new Date(event.calEvent.start),new Date(),event.calEvent.responsable,this.empresasService.userId,
        event.calEvent.idsupervisor,this.emptyDate,0,'',event.calEvent.supervisor);
        this.supervisor = event.calEvent.supervisor
        try{
        this.periodicidad = JSON.parse(event.calEvent.periodicidad);
        }
        catch (e){
          //console.log(e)
        }
        this.dialogVisible = true;
      }
      else{
        this.estado="realizado";
        if (event.calEvent.supervision > 0) this.estado = 'supervisado';
                this.planrealizado = new PlanRealizado(event.calEvent.id,event.calEvent.idplan,event.calEvent.idfamilia,
                this.empresasService.seleccionada,event.calEvent.title,event.calEvent.descripcion,
                new Date(event.calEvent.prevista),new Date(event.calEvent.start),event.calEvent.responsable,this.empresasService.userId,
                event.calEvent.idsupervisor,new Date(event.calEvent.fecha_supervision),
                event.calEvent.supervision,event.calEvent.detalles_supervision,event.calEvent.supervisor,
                event.calEvent.imagen,event.calEvent.doc);
                this.supervisor = event.calEvent.supervisor
        if (event.calEvent.supervision == 0) this.planrealizado.fecha_supervision = this.emptyDate;
        this.dialogVisible = true;
      }
}

    saveEvent() {

        let index = this.events.findIndex((event)=> event.idplan == this.planrealizado.idplan);
       console.log (index, this.planes[index],this.planrealizado)
        this.planes[index].fecha = this.nuevaFecha();
        this.actualizarPlan(this.planes[index],index);
        this.newPlanRealizado();
        this.dialogVisible = false;
    }

    supervisarEvent() {
        this.supervisarMantenimiento();
        this.dialogVisible = false;
    }


    cancelEvent() {
      this.dialogVisible = false;
    }

    nuevaFecha(){
      let hoy = new Date();
      let proximaFecha;
      switch (this.periodicidad.repeticion){
        case "diaria":
        proximaFecha = this.nextWeekDay();
        //console.log("diario",proximaFecha, this.dias[moment(proximaFecha).isoWeekday()-1])
        break;
        case "semanal":
        //console.log('semanal',this.nextWeekDay());
        //let semanas = this.periodicidad.frecuencia *7;
        proximaFecha = moment(this.planrealizado.fecha_prevista).add(this.periodicidad.frecuencia,"w");
        while (moment(proximaFecha).isSameOrBefore(moment())){
        this.planrealizado.fecha_prevista = proximaFecha;
        proximaFecha = moment(this.planrealizado.fecha_prevista).add(this.periodicidad.frecuencia,"w");
        }
        //proximaFecha = moment(this.planrealizado.fecha_prevista).add(this.periodicidad.frecuencia,"w");
        //console.log("semanal",proximaFecha, this.dias[moment(proximaFecha).isoWeekday()-1])
        break;
        case "mensual":
        if (this.periodicidad.tipo == "diames"){
            proximaFecha = moment(this.planrealizado.fecha_prevista).add(this.periodicidad.frecuencia,"M");
           // console.log("mensual dia mes",proximaFecha, this.dias[moment(proximaFecha).isoWeekday()-1])
        } else{
          proximaFecha = this.nextMonthDay();
        }

        break;
        case "anual":
        if (this.periodicidad.tipo == "diames"){
          let año = moment(this.planrealizado.fecha_prevista).get('year') + this.periodicidad.frecuencia;
        proximaFecha = moment().set({"year":año,"month":parseInt(this.periodicidad.mes)-1,"date":this.periodicidad.numdia});
        //console.log("anual dia mes",proximaFecha)
        } else{
          proximaFecha = this.nextYearDay();
        }
        break;
        case "por uso":
        proximaFecha = moment(new Date());
        break;
      }

      this.newdate = moment(proximaFecha).toDate();
      return this.newdate = new Date(Date.UTC(this.newdate.getFullYear(), this.newdate.getMonth(), this.newdate.getDate()))
}




nextWeekDay(fecha?:Date) {
  let hoy = new Date();
  if (fecha) hoy = fecha;
  let proximoDia:number =-1;
  let nextFecha;
  for(let currentDay= hoy.getDay();currentDay<6;currentDay++){
    if (this.periodicidad.dias[currentDay].checked == true){
      proximoDia = 7 + currentDay - (hoy.getDay()-1);
      break;
    }
  }
  if (proximoDia ==-1){
      for(let currentDay= 0;currentDay<hoy.getDay();currentDay++){
    if (this.periodicidad.dias[currentDay].checked == true){
      proximoDia = currentDay + 7 - (hoy.getDay()-1);
      break;
    }
  }
}
if(proximoDia >7) proximoDia =proximoDia-7;
nextFecha = moment().add(proximoDia,"days");
return nextFecha;
}

nextMonthDay(){
  let  proximafecha;
  let fecha_prevista = new Date(this.planrealizado.fecha_prevista);
  let mes = fecha_prevista.getMonth() +1 + this.periodicidad.frecuencia;
 // let week = 
// console.log(this.dias[moment(fecha_prevista).add(this.periodicidad.frecuencia,"M").startOf('month').isoWeekday()-1]);
// console.log("ultimo día sem",this.dias[moment(fecha_prevista).add(this.periodicidad.frecuencia,"M").endOf('month').isoWeekday()-1]);
if (this.periodicidad.numsemana ==5){
 let ultimodia =  moment(fecha_prevista).add(this.periodicidad.frecuencia,"M").endOf('month').isoWeekday() - this.periodicidad.nomdia;
  proximafecha = moment(fecha_prevista).add(this.periodicidad.frecuencia,"M").endOf('month').subtract(ultimodia,"days");
}else{
let primerdia = 7 - ((moment(fecha_prevista).add(this.periodicidad.frecuencia,"M").startOf('month').isoWeekday()) - this.periodicidad.nomdia)
if (primerdia >6) primerdia= primerdia-7;
 proximafecha = moment(fecha_prevista).add(this.periodicidad.frecuencia,"M").startOf('month').add(primerdia,"days").add(this.periodicidad.numsemana-1,"w");
}
return  proximafecha;
}
nextYearDay(){
  let proximafecha;
  let fecha_prevista = new Date(this.planrealizado.fecha_prevista);
  let mes = parseInt(this.periodicidad.mes) -1;
  fecha_prevista = moment(fecha_prevista).month(mes).add(this.periodicidad.frecuencia,'y').toDate();
  // console.log("test",fecha_prevista);

if (this.periodicidad.numsemana ==5){
 let ultimodia =  moment(fecha_prevista).endOf('month').isoWeekday() - this.periodicidad.nomdia;
 proximafecha = moment(fecha_prevista).endOf('month').subtract(ultimodia,"days");
}else{
let primerdia = 7 - ((moment(fecha_prevista).startOf('month').isoWeekday()) - this.periodicidad.nomdia)
if (primerdia >6) primerdia= primerdia-7;
 proximafecha = moment(fecha_prevista).startOf('month').add(primerdia,"days").add(this.periodicidad.numsemana-1,"w");
}
return proximafecha;
}

 actualizarPlan(plan: Planificacion, i: number) {

// console.log (this.tipoevento[i])
if (this.checkPeriodo(this.event.periodicidad) == 'por uso') {
  this.event.color = "#3333ff";
}else{
  this.event.color = "#F67E1F";
}

    // console.log ("actualizar:##",mantenimiento);
    //mantenimiento.periodicidad = this.mantenimientos[i].periodicidad;
    let parametros = '?id=' + plan.id+"&entidad=planificaciones";  
    this.servidor.putObject(URLS.STD_ITEM, parametros, plan).subscribe(
      response => {
        if (response.success) {
          // console.log("move...",this.events[i].start , this.mantenimientos[i].fecha,i);
          this.event.start = new Date(this.planes[i].fecha);
          this.events[i] = this.event; 
          // console.log(this.events[i].start);
        }
    });
  }

setSupervision(evento){
console.log(evento.value);
this.event.supervision = evento.value;
this.planrealizado.fecha_supervision = new Date();
}

 supervisarMantenimiento() {

  let index = this.events.findIndex((event)=> event.idelemento == this.planrealizado.idplan);
    let parametros = '?id=' + this.planrealizado.id+this.entidad;
    this.planrealizado.idempresa = this.empresasService.seleccionada;
    this.planrealizado.idsupervisor = this.empresasService.userId;
    //this.planrealizado.fecha_supervision = this.events
    this.servidor.putObject(URLS.STD_ITEM, parametros, this.planrealizado).subscribe(
      response => {
        if (response.success) {
               let supervisionColor ='';
                if (this.event.supervision == 1) supervisionColor = 'darkblue';
                if (this.event.supervision == 2) supervisionColor = 'red';
                let estado ='supervisado';
                let supervisor = this.findSupervisor(this.empresasService.userId);

                  this.event.estado = estado;
                  this.event.borderColor = supervisionColor;
                  this.event.textColor = supervisionColor;
                  this.event.idsupervisor = supervisor;
                  this.event.fecha_supervision = this.planrealizado.fecha_supervision;
                  this.event.detalles_supervision = this.planrealizado.detalles_supervision;
                  this.events[index] = this.event;
                  //this.event = null;
        this.nuevoPlanRealizado.emit(response.id);
        console.log('Supervision OK',index,this.event,this.events[index]);

        }
    });
  }

newPlanRealizado(){
    //let hoy = new Date();
    this.planrealizado.fecha = new Date(Date.UTC(this.planrealizado.fecha.getFullYear(), this.planrealizado.fecha.getMonth(), this.planrealizado.fecha.getDate()));
    this.planrealizado.idempresa = this.empresasService.seleccionada;
    //this.planrealizado.idsupervisor = 
    let param = this.entidad;
    let supervisor = '';
    (this.planrealizado.idsupervisor>0)? supervisor = this.findSupervisor(this.planrealizado.idsupervisor):supervisor =  '';
    this.servidor.postObject(URLS.STD_ITEM, this.planrealizado,param).subscribe(
      response => {
        if (response.success) {
          console.log('Mantenimiento updated');
          this.events.push({"idlimpiezaelemento":response.id,"idlimpiezazona":this.planrealizado.nombre,"title":this.planrealizado.nombre,
          "descripcion":this.planrealizado.descripcion,"start":this.planrealizado.fecha,"prevista":this.planrealizado.fecha_prevista,
          "usuario":this.planrealizado.idusuario,"responsable":this.planrealizado.responsable,
          "color":"#33cc33","estado":"realizado","idsupervisor":this.planrealizado.idsupervisor,"supervisor":this.planrealizado.supervisor,
          "supervision":0,
                  "fecha_supervision":this.emptyDate});
        this.nuevoPlanRealizado.emit(response.id);
        console.log('paso1',this.planrealizado.nombre);
      }
    },
    error=>console.log(error),
    ()=>{

      }
    );
}

}
