import { Component, OnInit, Input } from '@angular/core';
import {Moment} from 'moment';
import * as moment from 'moment/moment';

import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { Empresa } from '../../models/empresa';
 import { Maquina } from '../../models/maquina';
 import { CalendarioMantenimiento } from '../../models/calendariomantenimiento';
 import { MantenimientoRealizado } from '../../models/mantenimientorealizado';
 import { Periodicidad } from '../../models/periodicidad';

@Component({
  selector: 'calendarios',
  templateUrl: './calendarios.component.html',
  styleUrls: ['./calendarios.css']
})
export class CalendariosComponent implements OnInit {
public maquina: Maquina;
@Input() maquinas: Maquina[];
public calendario: CalendarioMantenimiento[];
public meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','diciembre'];
public dias = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
public cols:number = 7;
//public events = [{"title": "All Day Event","start": "2017-02-04","color":"#fbc02d"}];
public events :any[] =[];
public headerCalendar: any;
public es:any;
public buttonText:any;
public dialogVisible: boolean = false;
public mantenimiento: MantenimientoRealizado;
public date = new Date();
public periodicidad: Periodicidad;
public moment: Moment;
  constructor(private servidor: Servidor,private empresasService: EmpresasService) {}





  ngOnInit() {
      this.setEventsMantenimientos();
      this.headerCalendar = {left: 'prev,next today',center: 'title',right: 'month,basicWeek,basicDay,listMonth,listYear'};
       this.es = {
            monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
                'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            dayNames: ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'],
            buttonText: {today:'hoy',month:'mes',week:'semana',day:'dia',list:'lista',listMonth:"lista mensual",listYear:"lista anual"},
            dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
            allDayText: "Todo el día",
            columnFormat: "dddd",
            firstDay: 1
        };   
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
                  this.events.push({"idmantenimiento":element.id,"idmaquina":element.idmaquina,"title":element.maquina + " " + element.nombre,"start":element.fecha,"tipo":element.tipo,"usuario":element.idusuario,"responsable":element.responsable,"tipo2":"preventivo","periodicidad":element.periodicidad,"color":color});   
              }
            }
        });
  }
setColor(tipo:string,fecha){
  let color: string;
  let hoy = Date.now();
  let fecha_event = Date.parse(fecha); 
  switch (tipo){
    case "mantenimiento":
      color="#F67E1F";
      break;
    case "calibracion":
      color="#673AB7";
      break;
  }
  if (fecha_event < hoy) color= "red";
  return color;
}

list(cal){
  console.log('list');
  console.log(cal);
  cal.changeView('listMonth')
}

handleEventClick(event){
  
        this.mantenimiento = new MantenimientoRealizado(event.calEvent.idmantenimiento,event.calEvent.idmaquina,event.calEvent.title,event.calEvent.title,'',new Date(event.calEvent.start),new Date(),event.calEvent.tipo,'','',event.calEvent.tipo2,'',this.empresasService.userId,event.calEvent.responsable);
        //this.event.title = e.calEvent.title;
        this.periodicidad = JSON.parse(event.calEvent.periodicidad);
        // let start = e.calEvent.start;
        // let end = e.calEvent.end;
        // if(e.view.name === 'month') {
        //     start.stripTime();
        // }
        
        // if(end) {
        //     end.stripTime();
        //     this.event.end = end.format();
        // }

        // this.event.id = e.calEvent.id;
        // this.event.start = start.format();
        // this.event.allDay = e.calEvent.allDay;
        this.dialogVisible = true;
}

    saveEvent() {
        //update
        this.nuevaFecha();

        this.dialogVisible = false;

    // this.servidor.postObject(URLS.MANTENIMIENTOS_REALIZADOS, this.mantenimiento).subscribe(
    //   response => {
    //     if (response.success) {
    //         let index= this.events.findIndex((elem)=> elem.idmantenimiento == this.mantenimiento.idmantenimiento);
    //         this.events.splice(index,1);
    //     }
    // });



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
        console.log("diario",proximaFecha, this.dias[moment(proximaFecha).isoWeekday()-1])
        break;
        case "semanal":
        //console.log('semanal',this.nextWeekDay());
        //let semanas = this.periodicidad.frecuencia *7;
        proximaFecha = moment(this.mantenimiento.fecha_prevista).add(this.periodicidad.frecuencia,"w").toDate();
        console.log("semanal",proximaFecha, this.dias[moment(proximaFecha).isoWeekday()-1])
        break;
        case "mensual":
        if (this.periodicidad.tipo == "diames"){
            proximaFecha = moment(this.mantenimiento.fecha_prevista).add(this.periodicidad.frecuencia,"M").calendar();
            console.log("mensual dia mes",proximaFecha, this.dias[moment(proximaFecha).isoWeekday()-1])
        } else{
          proximaFecha = this.nextMonthDay();
        }

        break;
        case "anual":
         this.periodicidad.tipo == "diames" ? proximaFecha = moment(this.mantenimiento.fecha_prevista).add(this.periodicidad.frecuencia,"y").toDate(): proximaFecha = this.nextYearDay();
        console.log("anual dia mes",proximaFecha, this.dias[moment(proximaFecha).isoWeekday()-1])
        break;
      }
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
nextFecha = moment().add(proximoDia,"days").toDate();
return nextFecha;
}

nextMonthDay(){
  let fecha_prevista = new Date(this.mantenimiento.fecha_prevista);
  let mes = fecha_prevista.getMonth() +1 + this.periodicidad.frecuencia;
 // let week = 
console.log(this.dias[moment(fecha_prevista).add(this.periodicidad.frecuencia,"M").startOf('month').isoWeekday()-1]);
console.log("ultimo día sem",this.dias[moment(fecha_prevista).add(this.periodicidad.frecuencia,"M").endOf('month').isoWeekday()-1]);
if (this.periodicidad.numsemana ==5){
 let ultimodia =  moment(fecha_prevista).add(this.periodicidad.frecuencia,"M").endOf('month').isoWeekday() - this.periodicidad.nomdia;
 console.log("next fecha prevista",moment(fecha_prevista).add(this.periodicidad.frecuencia,"M").endOf('month').subtract(ultimodia,"days").calendar());
}else{
let primerdia = 7 - ((moment(fecha_prevista).add(this.periodicidad.frecuencia,"M").startOf('month').isoWeekday()) - this.periodicidad.nomdia)
if (primerdia >6) primerdia= primerdia-7;
console.log("next fecha prevista",moment(fecha_prevista).add(this.periodicidad.frecuencia,"M").startOf('month').add(primerdia,"days").add(this.periodicidad.numsemana-1,"w").calendar());
}

}
nextYearDay(){

}

weekOfMonth(){

}

}
