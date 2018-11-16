import { Component, OnInit, Input,Output, EventEmitter } from '@angular/core';
import {Moment} from 'moment';
import * as moment from 'moment/moment';

import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { Empresa } from '../../models/empresa';
 import { Maquina } from '../../models/maquina';
 import { CalendarioMantenimiento } from '../../models/calendariomantenimiento';
 import { MantenimientoRealizado } from '../../models/mantenimientorealizado';
  import { MantenimientosMaquina } from '../../models/mantenimientosmaquina';
  import { CalibracionesMaquina } from '../../models/calibracionesmaquina';
 import { Periodicidad } from '../../models/periodicidad';

@Component({
  selector: 'calendarios',
  templateUrl: './calendarios.component.html',
  styleUrls: ['./calendarios.css']
})
export class CalendariosComponent implements OnInit {
public maquina: Maquina;
@Input() maquinas: Maquina[];
@Output() newMantenimientoRealizadoEmit:EventEmitter<number>= new EventEmitter<number>();
public calendario: CalendarioMantenimiento[];
public meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','diciembre'];
public dias = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
public cols:number = 7;
//public events = [{"title": "All Day Event","start": "2017-02-04","color":"#fbc02d"}];
public events :any[] =[];
public events_realizados :any[] =[];
public eventsSoucers:any;
public headerCalendar: any;
//public es:any;
//public cat:any;
public locale:string;
public buttonText:any;
public dialogVisible: boolean = false;
public mantenimientorealizado: MantenimientoRealizado;
public newdate = new Date();
public periodicidad: Periodicidad;
public moment: Moment;
public mantenimientos: MantenimientosMaquina[]=[];
public calibraciones: CalibracionesMaquina[]=[];
public tipoevento:string[]=[];
public event:any;
public estado;
  constructor(public servidor: Servidor,public empresasService: EmpresasService) {}





  ngOnInit() {
      this.setEventsMantenimientos();
      this.headerCalendar = {left: 'prev,next today',center: 'title',right: 'month,basicWeek,basicDay,listMonth,listYear'};
      this.empresasService.idioma == "cat"?this.locale="ca":this.locale="es";
}
  setEventsMantenimientos(){
    //let params = this.maquina.id;
    //let parametros = '&idmaquina=' + params;
      let parametros = '&idempresa=' + this.empresasService.seleccionada; 
        this.servidor.getObjects(URLS.CALENDARIOS, parametros).subscribe(
          response => {
            this.calendario = [];
            if (response.success && response.data) {
              for (let element of response.data) {
                this.calendario.push(new CalendarioMantenimiento(element.maquina, element.ubicacion, element.nombre, element.tipo, element.periodicidad,
                  element.tipoperiodo));
                  let color = this.setColor(element.tipo_m,element.fecha)
                  this.events.push({"idmantenimiento":element.id,"idmaquina":element.idmaquina,"title":element.nombre + " " + element.maquina,"start":element.fecha,"tipo":element.tipo,"usuario":element.idusuario,"responsable":element.responsable,"tipo2":"preventivo","periodicidad":element.periodicidad,"color":color,"tipoevento":element.tipo_m,"estado":"pendiente"});  
                   this.mantenimientos.push(new MantenimientosMaquina(element.id, element.idmaquina, element.nombre,new Date(element.fecha), element.tipo, element.periodicidad,
                  element.tipoperiodo, element.doc,element.usuario,element.responsable));
              }
            }
        },
        (error) => console.log(error),
        ()=> this.loadRealizados());
  }
loadRealizados(){
///****** INSEERT MANTENIMIENTOS REALIZADOS */
///****** INSEERT MANTENIMIENTOS REALIZADOS */
    let params = this.empresasService.seleccionada;
    let parametros2 = '&tipomantenimiento=preventivo&idempresa=' + params;
    //  let parametros = '&idempresa=' + this.empresasService.seleccionada; 
        this.servidor.getObjects(URLS.MANTENIMIENTOS_REALIZADOS, parametros2).subscribe(
          response => {
            this.events_realizados = [];
            if (response.success && response.data) {
              for (let element of response.data) {  
                  let color2 = this.setColor2(element.tipo_evento);
                  this.events.push({"idmantenimiento":element.idmantenimiento,"idmaquina":element.idmaquina,"title":element.mantenimiento,"descripcion":element.descripcion,"start":element.fecha,"tipo":element.tipo,"elemento":element.elemento,"causas":element.causas,"tipo2":element.tipo2,"usuario":element.idusuario,"responsable":element.responsable,"color":color2,"tipoevento":element.tipo_evento,"estado":"realizado"});
             }
             console.log("realizadost",this.events_realizados);
             this.events.concat(this.events_realizados);
             console.log("events",this.events);
            }
        });

}


setColor(tipo:string,fecha){
  let color: string;
  let hoy = Date.now();
  let fecha_event = Date.parse(fecha); 
  switch (tipo){
    case "mantenimiento":
    this.tipoevento.push("mantenimientos");
      color="#F67E1F";
      if (fecha_event < hoy) color= "#E65A58";
      break;
    case "calibracion":
    this.tipoevento.push("calibraciones");
      color="#673AB7";
      if (fecha_event < hoy) color= "red";
      break;
  }
  return color;
}
setColor2(tipo:string){
  let color: string;
  switch (tipo){
    case "mantenimiento":
    //this.tipoevento.push("mantenimientos");
      color="#33cc33";
      break;
    case "calibracion":
    //this.tipoevento.push("calibraciones");
      color="#88ee88";
      break;
  }
  return color;
}
list(cal){
  console.log('list');
  console.log(cal);
  cal.changeView('listMonth')
}

handleEventClick(event){
      // console.log(event);
       this.event = event.calEvent;
      // let start = event.calEvent.start;
      // start.stripTime();
      // console.log(start.stripTime());
       //this.event.start = new Date("2017-02-14");
      // console.log(start.format());
      if (event.calEvent.estado == 'pendiente'){
        this.estado="pendiente";
        this.mantenimientorealizado = new MantenimientoRealizado(event.calEvent.idmantenimiento,event.calEvent.idmaquina,event.calEvent.title,event.calEvent.title,'',new Date(event.calEvent.start),new Date(),event.calEvent.tipo,'','',event.calEvent.tipo2,'',this.empresasService.userId,event.calEvent.responsable,0,event.calEvent.tipoevento);
        this.periodicidad = JSON.parse(event.calEvent.periodicidad);
        this.dialogVisible = true;
      }else{
        this.estado="realizado";
                this.mantenimientorealizado = new MantenimientoRealizado(event.calEvent.idmantenimiento,event.calEvent.idmaquina,event.calEvent.title,event.calEvent.title,'',new Date(event.calEvent.start),new Date(),event.calEvent.tipo,event.calEvent.elemento,event.calEvent.causas,event.calEvent.tipo2,'',this.empresasService.userId,event.calEvent.responsable,0,event.calEvent.tipoevento);
        //this.periodicidad = JSON.parse(event.calEvent.periodicidad);
        this.dialogVisible = true;
      }


        //this.events[2].start = moment(this.events[2].start).add(1,"d");
//        console.log(this.events);
//         this.events[2] = this.event;

}

    saveEvent() {
        //update
        //this.nuevaFecha();
        let index = this.events.findIndex((event)=> (event.idmantenimiento == this.mantenimientorealizado.idmantenimiento) && (event.tipoevento == this.mantenimientorealizado.tipo_evento));
        console.log (index, this.mantenimientos[index],this.mantenimientorealizado)
        this.mantenimientos[index].fecha = this.nuevaFecha();
        this.actualizarMantenimiento(this.mantenimientos[index],index);
        this.newMantenimientoRealizado();
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
        proximaFecha = moment(this.mantenimientorealizado.fecha_prevista).add(this.periodicidad.frecuencia,"w");
        //console.log("semanal",proximaFecha, this.dias[moment(proximaFecha).isoWeekday()-1])
        break;
        case "mensual":
        if (this.periodicidad.tipo == "diames"){
            proximaFecha = moment(this.mantenimientorealizado.fecha_prevista).add(this.periodicidad.frecuencia,"M");
           // console.log("mensual dia mes",proximaFecha, this.dias[moment(proximaFecha).isoWeekday()-1])
        } else{
          proximaFecha = this.nextMonthDay();
        }

        break;
        case "anual":
        if (this.periodicidad.tipo == "diames"){
          let año = moment(this.mantenimientorealizado.fecha_prevista).get('year') + this.periodicidad.frecuencia;
        proximaFecha = moment().set({"year":año,"month":parseInt(this.periodicidad.mes)-1,"date":this.periodicidad.numdia});
        //console.log("anual dia mes",proximaFecha)
        } else{
          proximaFecha = this.nextYearDay();
        }
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
  let fecha_prevista = new Date(this.mantenimientorealizado.fecha_prevista);
  let mes = fecha_prevista.getMonth() +1 + this.periodicidad.frecuencia;
 // let week = 
console.log(this.dias[moment(fecha_prevista).add(this.periodicidad.frecuencia,"M").startOf('month').isoWeekday()-1]);
console.log("ultimo día sem",this.dias[moment(fecha_prevista).add(this.periodicidad.frecuencia,"M").endOf('month').isoWeekday()-1]);
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
  let fecha_prevista = new Date(this.mantenimientorealizado.fecha_prevista);
  let mes = parseInt(this.periodicidad.mes) -1;
  fecha_prevista = moment(fecha_prevista).month(mes).add(this.periodicidad.frecuencia,'y').toDate();
  console.log("test",fecha_prevista);

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

 actualizarMantenimiento(mantenimiento: MantenimientosMaquina, i: number) {
let url;
console.log (this.tipoevento[i])
if (this.tipoevento[i] == "mantenimientos"){
url = URLS.MANTENIMIENTOS;
this.event.color = "#F67E1F";
}else{
url = URLS.CALIBRACIONES;
this.event.color = "#673AB7";
}
    console.log ("actualizar:",url," ##",mantenimiento);
    //mantenimiento.periodicidad = this.mantenimientos[i].periodicidad;
    let parametros = '?id=' + mantenimiento.id;  
    this.servidor.putObject(url, parametros, mantenimiento).subscribe(
      response => {
        if (response.success) {
          console.log("move...",this.events[i].start , this.mantenimientos[i].fecha,i);
          this.event.start = new Date(this.mantenimientos[i].fecha);
          this.events[i] = this.event; 
          console.log(this.events[i].start);
        }
    });

  }

newMantenimientoRealizado(){
    //let hoy = new Date();
    this.mantenimientorealizado.fecha = new Date(Date.UTC(this.mantenimientorealizado.fecha.getFullYear(), this.mantenimientorealizado.fecha.getMonth(), this.mantenimientorealizado.fecha.getDate()));
    this.mantenimientorealizado.idempresa = this.empresasService.seleccionada;
    this.servidor.postObject(URLS.MANTENIMIENTOS_REALIZADOS, this.mantenimientorealizado).subscribe(
      response => {
        if (response.success) {
          console.log('Mantenimiento updated');
          this.events.push({"idmantenimiento":response.id,"idmaquina":this.mantenimientorealizado.idmaquina,"title":this.mantenimientorealizado.maquina,"descripcion":this.mantenimientorealizado.descripcion,"start":this.mantenimientorealizado.fecha,"tipo":this.mantenimientorealizado.tipo,"elemento":this.mantenimientorealizado.elemento,"causas":this.mantenimientorealizado.causas,"tipo2":this.mantenimientorealizado.tipo2,"usuario":this.mantenimientorealizado.idusuario,"responsable":this.mantenimientorealizado.responsable,"color":this.setColor2(this.mantenimientorealizado.tipo_evento),"tipoevento":this.mantenimientorealizado.tipo_evento,"estado":"realizado"});
          
        this.newMantenimientoRealizadoEmit.emit(response.id);
        //console.log('paso1',this.limpiezarealizada.nombre);
      }
    },
    error=>console.log(error),
    ()=>{
      
      
      }
    );

}

}
