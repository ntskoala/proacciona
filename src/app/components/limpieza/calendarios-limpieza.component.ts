import { Component, OnInit, Input,Output, EventEmitter } from '@angular/core';
import {Moment} from 'moment';
import * as moment from 'moment/moment';

import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { Empresa } from '../../models/empresa';
 import { Maquina } from '../../models/maquina';
 import { CalendarioLimpieza } from '../../models/calendarlimpieza';
 import { LimpiezaRealizada } from '../../models/limpiezarealizada';
   import { LimpiezaElemento } from '../../models/limpiezaelemento';
//  import { MantenimientosMaquina } from '../../models/mantenimientosmaquina';

 import { Periodicidad } from '../../models/periodicidad';

@Component({
  selector: 'calendarios-limpieza',
  templateUrl: './calendarios-limpieza.component.html',
  styleUrls: ['./calendarios.css']
})
export class CalendariosLimpiezaComponent implements OnInit {
public maquina: Maquina;
@Input() maquinas: Maquina[];
@Output() newLimpiezaRealizada:EventEmitter<number>= new EventEmitter<number>();
public calendario: CalendarioLimpieza[];
public meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','diciembre'];
public dias = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
public cols:number = 7;
//public events = [{"title": "All Day Event","start": "2017-02-04","color":"#fbc02d"}];
public events :any[] =[];
public events_realizados :any[] =[];
public eventsSoucers:any;
public headerCalendar: any;
public es:any;
public cat:any;
public buttonText:any;
public dialogVisible: boolean = false;
public limpiezarealizada: LimpiezaRealizada;
public newdate = new Date();
public periodicidad: Periodicidad;
public moment: Moment;
public mantenimientos: LimpiezaElemento[]=[];

public tipoevento:string[]=[];
public event:any;
public estado;
entidad:string="&entidad=limpieza_realizada";
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
        if (this.empresasService.idioma == "cat"){
       this.es = {
            monthNames: ['Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny', 'Juliol',
                'Agost', 'Septembre', 'Octubre', 'Novembre', 'Decembre'],
            dayNames: ['diumenge','Dilluns','Dimarts','Dimecres','Dijous','Divendres','Disabte'],
            buttonText: {today:'avui',month:'mes',week:'setmana',day:'dia',list:'llista',listMonth:"llista mensual",listYear:"llista anual"},
            dayNamesShort: ['Diu', 'Dil', 'Dim', 'Dim', 'Dij', 'Div', 'Dis'],
            allDayText: "Tot el día",
            columnFormat: "dddd",
            firstDay: 1
        };
        }
}
  setEventsMantenimientos(){
    //let params = this.maquina.id;
    //let parametros = '&idmaquina=' + params;
      let parametros = '&idempresa=' + this.empresasService.seleccionada; 
        this.servidor.getObjects(URLS.CALENDARIOSLIMPIEZA, parametros).subscribe(
          response => {
            this.calendario = [];
            if (response.success && response.data) {
              for (let element of response.data) {
                this.calendario.push(new CalendarioLimpieza(element.zona, element.nombre, element.tipo, element.periodicidad));
                  let color = this.setColor(element.fecha)
                  this.events.push({"idelemento":element.id,"idzona":element.idlimpiezazona,"title":element.zona + " " + element.nombre,"start":element.fecha,"tipo":element.tipo,"usuario":element.idusuario,"responsable":element.responsable,"periodicidad":element.periodicidad,"color":color,"estado":"pendiente"});  
                   this.mantenimientos.push(new LimpiezaElemento(element.id, element.idlimpiezazona, element.nombre,new Date(element.fecha), element.tipo, element.periodicidad,
                  element.productos,element.protocol,element.protocolo,element.usuario,element.responsable));
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
    let parametros2 = '&idempresa=' + params+this.entidad;
    //  let parametros = '&idempresa=' + this.empresasService.seleccionada; 
        this.servidor.getObjects(URLS.STD_ITEM, parametros2).subscribe(
          response => {
            this.events_realizados = [];
            if (response.success && response.data) {
              for (let element of response.data) {  
                  
                  this.events.push({"idlimpiezaelemento":element.id,"idlimpiezazona":element.limpiezazona,"title":element.nombre,"descripcion":element.descripcion,"start":element.fecha,"prevista":element.fecha_prevista,"tipo":element.tipo,"elemento":element.elemento,"usuario":element.idusuario,"responsable":element.responsable,"color":"#33cc33","estado":"realizado"});
             }
            //  console.log("realizadost",this.events_realizados);
             this.events.concat(this.events_realizados);
            //  console.log("events",this.events);
            }
        });

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
      //  console.log(event);
       this.event = event.calEvent;

      if (event.calEvent.estado == 'pendiente'){
        this.estado="pendiente";
        this.limpiezarealizada = new LimpiezaRealizada(event.calEvent.idelemento,event.calEvent.idzona,event.calEvent.title,'',new Date(event.calEvent.start),new Date(),event.calEvent.tipo,this.empresasService.userId,event.calEvent.responsable,0,this.empresasService.seleccionada);
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
                this.limpiezarealizada = new LimpiezaRealizada(event.calEvent.idelemento,event.calEvent.idzona,event.calEvent.title,event.calEvent.descripcion,new Date(event.calEvent.prevista),new Date(event.calEvent.start),event.calEvent.tipo,this.empresasService.userId,event.calEvent.responsable,0,this.empresasService.seleccionada);
        this.dialogVisible = true;
      }
}

    saveEvent() {

        let index = this.events.findIndex((event)=> event.idelemento == this.limpiezarealizada.idelemento);
        // console.log (index, this.mantenimientos[index],this.limpiezarealizada)
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
        proximaFecha = moment(this.limpiezarealizada.fecha_prevista).add(this.periodicidad.frecuencia,"w");
        //console.log("semanal",proximaFecha, this.dias[moment(proximaFecha).isoWeekday()-1])
        break;
        case "mensual":
        if (this.periodicidad.tipo == "diames"){
            proximaFecha = moment(this.limpiezarealizada.fecha_prevista).add(this.periodicidad.frecuencia,"M");
           // console.log("mensual dia mes",proximaFecha, this.dias[moment(proximaFecha).isoWeekday()-1])
        } else{
          proximaFecha = this.nextMonthDay();
        }

        break;
        case "anual":
        if (this.periodicidad.tipo == "diames"){
          let año = moment(this.limpiezarealizada.fecha_prevista).get('year') + this.periodicidad.frecuencia;
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
  let fecha_prevista = new Date(this.limpiezarealizada.fecha_prevista);
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
  let fecha_prevista = new Date(this.limpiezarealizada.fecha_prevista);
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

 actualizarMantenimiento(mantenimiento: LimpiezaElemento, i: number) {

// console.log (this.tipoevento[i])

this.event.color = "#F67E1F";

    // console.log ("actualizar:##",mantenimiento);
    //mantenimiento.periodicidad = this.mantenimientos[i].periodicidad;
    let parametros = '?id=' + mantenimiento.id+"&entidad=limpieza_elemento";  
    this.servidor.putObject(URLS.STD_SUBITEM, parametros, mantenimiento).subscribe(
      response => {
        if (response.success) {
          // console.log("move...",this.events[i].start , this.mantenimientos[i].fecha,i);
          this.event.start = new Date(this.mantenimientos[i].fecha);
          this.events[i] = this.event; 
          // console.log(this.events[i].start);
        }
    });
  }

newMantenimientoRealizado(){
    //let hoy = new Date();
    this.limpiezarealizada.fecha = new Date(Date.UTC(this.limpiezarealizada.fecha.getFullYear(), this.limpiezarealizada.fecha.getMonth(), this.limpiezarealizada.fecha.getDate()));
    this.limpiezarealizada.idempresa = this.empresasService.seleccionada;
    let param = this.entidad;
    this.servidor.postObject(URLS.STD_ITEM, this.limpiezarealizada,param).subscribe(
      response => {
        if (response.success) {
          // console.log('Mantenimiento updated');
          this.events.push({"idlimpiezaelemento":response.id,"idlimpiezazona":this.limpiezarealizada.nombre,"title":this.limpiezarealizada.nombre,"descripcion":this.limpiezarealizada.descripcion,"start":this.limpiezarealizada.fecha,"prevista":this.limpiezarealizada.fecha_prevista,"tipo":this.limpiezarealizada.tipo,"usuario":this.limpiezarealizada.idusuario,"responsable":this.limpiezarealizada.responsable,"color":"#33cc33","estado":"realizado"});
        this.newLimpiezaRealizada.emit(response.id);
        console.log('paso1',this.limpiezarealizada.nombre);
      }
    },
    error=>console.log(error),
    ()=>{
      
      
      }
    );
}

}