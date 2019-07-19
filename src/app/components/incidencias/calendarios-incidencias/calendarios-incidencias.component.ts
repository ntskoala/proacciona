import { Component, OnInit, Input,Output, EventEmitter,ViewEncapsulation, ViewChild } from '@angular/core';
import {Moment} from 'moment';
import * as moment from 'moment/moment';
import {Schedule} from 'primeng/primeng';

import { Servidor } from '../../../services/servidor.service';
import { URLS,optionsFullCalendar } from '../../../models/urls';
import { EmpresasService } from '../../../services/empresas.service';
import { Empresa } from '../../../models/empresa';
 import { Incidencia } from '../../../models/incidencia';
  import { Usuario } from '../../../models/usuario';
 import { CalendarioLimpieza } from '../../../models/calendarlimpieza';
 import { LimpiezaRealizada } from '../../../models/limpiezarealizada';
   import { LimpiezaElemento } from '../../../models/limpiezaelemento';
//  import { MantenimientosMaquina } from '../../models/mantenimientosmaquina';

 import { Periodicidad } from '../../../models/periodicidad';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-calendarios-incidencias',
  templateUrl: './calendarios-incidencias.component.html',
  styleUrls: ['./calendarios-incidencias.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CalendariosIncidenciasComponent implements OnInit {
  public incidencia: Incidencia;
  public estados: any[];
  @ViewChild('#calendar') calendario: Schedule;
  @Input() incidencias: Incidencia[];
  @Output() incidenciaActualizada:EventEmitter<Incidencia>= new EventEmitter<Incidencia>();
  //public calendario: CalendarioLimpieza[];
  public meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','diciembre'];
  public dias = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
  public cols:number = 7;
  //public events = [{"title": "All Day Event","start": "2017-02-04","color":"#fbc02d"}];
  public events :any[] =[];
  public currentEvent:any;
  public events_realizados :any[] =[];
  public eventsSoucers:any;
  public headerCalendar: any;
  public es:any;
  public cat:any;
  public locale:string;
  public buttonText:any;
  public dialogVisible: boolean = false;

  public moment: Moment;
  public eventRender:any;
  public usuarios:Usuario[];
  public responsables:any[];
  public tipoevento:string[]=[];
  public event:any;
  public estado;
  public opcionesFullCalendar:any=optionsFullCalendar;
  //public localSupervisor: string;
  public supervisor: string;
  public entidad:string="&entidad=incidencias";
  public supervisar:object[]=[{"value":0,"label":"porSupervisar"},{"value":1,"label":"correcto"},{"value":2,"label":"incorrecto"}];
    constructor(public servidor: Servidor,public empresasService: EmpresasService) {}
  
  
    ngOnInit() {
        //this.setEventsMantenimientos();
        this.loadSupervisores();
        this.headerCalendar = {left: 'prev,next today',center: 'title',right: 'month,basicWeek,basicDay,listMonth,listYear'};  
        this.empresasService.idioma == "cat"?this.locale="ca":this.locale="es";
        this.estados = [{'label':'sin definir','value':-1},{'label':'no aplica','value':0},{'label':'abierto','value':1},{'label':'cerrado','value':2}] 
        //this.eventRender= function(){alert(';test')}
  }
    setEvents(){
        let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad;
            this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
            response => {
              //this.calendario = [];
              if (response.success && response.data) {
                for (let element of response.data) {
                  let fecha;
                  let color = this.setColor(element.estado)
                  
                   let responsable = ''; 
                   let responsable_seguimiento = ''; 
                   let responsable_cierre = ''; 
                  (element.responsable>0)? responsable = this.findSupervisor(element.responsable):responsable =  '';
                  (element.responsable_seguimiento>0)? responsable_seguimiento = this.findSupervisor(element.responsable_seguimiento):responsable_seguimiento =  '';
                  (element.responsable_cierre>0)? responsable_cierre = this.findSupervisor(element.responsable_cierre):responsable_cierre =  '';
                  
                    this.events.push({"idelemento":element.id,"title":element.incidencia,"start":element.fecha,
                    "origen":element.origen,"idOrigen":element.idOrigen,"origenasociado":element.origenasociado,"idOrigenasociado":element.idOrigenasociado,
                    "responsable":element.responsable,"color":color,
                    "descripcion":element.descripcion,"estado":element.estado,"solucion":element.solucion,
                    "responsable_cierre":element.responsable_cierre,"fecha_cierre":element.fecha_cierre});
                }
                  console.log(this.events);          
              }
          },
          (error) => console.log(error),
          ()=> {});
    }

    loadSupervisores(){
      let params = this.empresasService.seleccionada;
      let parametros2 = "&entidad=usuarios"+'&idempresa=' + params;
          this.servidor.getObjects(URLS.STD_ITEM, parametros2).subscribe(
            response => {
              this.usuarios = [];
              this.responsables=[];
              if (response.success && response.data) {
                console.log(response.data)
                for (let element of response.data) {  
                    // this.usuarios.push(new Usuario(
                    //   element.id,element.usuario,element.password,element.tipouser,element.email,element.idempresa
                    // ));
                    this.responsables.push({'label':element.usuario,'value':element.id});
               }
              // console.log(this.usuarios)
               this.setEvents();
              // this.localSupervisor = this.findSupervisor(this.empresasService.userId);
              }
          });
  }



  findSupervisor(id:number){
    //console.log(id);
    let index = this.usuarios.findIndex((user)=>user.id==id)
    //console.log(this.usuarios[index]);
    let user = '';
    if (index >-1){
    user = this.usuarios[index].usuario;
    }
    //console.log(user);
    return user;
    }  

  
  checkPeriodo(periodicidad: string): string{
  let valor:string;
  let periodo = JSON.parse(periodicidad);
  return periodo.repeticion;
  }
  
  setColor(estado){
    let color: string;
    switch(estado){
      case "-1":
      color="#673ab7";
      break;     
      case "0":
      color="#cccccc";
      break;
      case "1":
      color= "#E65A58";
      break;
      case "2":
      color= "#33cc33";
      break;
    }
    return color;
  }
  
  
  list(cal){
    // console.log('list');
    // console.log(cal);
    cal.changeView('listMonth')
  }
  
  handleEventClick(event){
          // console.log(event);
          // console.log(event.jsEvent.currentTarget);
          // console.log(event.jsEvent.currentTarget.style.backgroundColor);
          // event.jsEvent.currentTarget.style.backgroundColor = "#33cc33"
           event.jsEvent.currentTarget.text = "edited";
          // event.jsEvent.currentTarget.textContent = "test";
          this.currentEvent = event;
         this.event = event.calEvent;
         let fecha:Date;
         let fechaCierre:Date;
         if (moment(event.calEvent.start).isValid()) fecha = moment(new Date(event.calEvent.start)).utc().toDate();              
         if (moment(event.calEvent.fecha_cierre).isValid()) fechaCierre = moment(new Date(event.calEvent.fecha_cierre)).utc().toDate();
        // if (event.calEvent.estado == 'pendiente'){
        //   this.estado="pendiente";
          this.incidencia = new Incidencia(event.calEvent.idelemento,this.empresasService.seleccionada,event.calEvent.title,
            event.calEvent.responsable,fecha,event.calEvent.responsable_cierre,fechaCierre,
            event.calEvent.solucion,
            event.calEvent.nc,event.calEvent.origen,event.calEvent.idorigen,event.calEvent.origenasociado,event.calEvent.idOrigenasociado,
            event.calEvent.foto,event.calEvent.descripcion,event.calEvent.estado);

          // this.limpiezarealizada = new LimpiezaRealizada(event.calEvent.idelemento,event.calEvent.idzona,event.calEvent.title,
          // event.calEvent.descripcion,new Date(event.calEvent.start),new Date(),event.calEvent.tipo,this.empresasService.userId,
          // event.calEvent.responsable,0,this.empresasService.seleccionada,event.calEvent.idsupervisor);
          // this.supervisor = event.calEvent.supervisor
          // try{
          // this.periodicidad = JSON.parse(event.calEvent.periodicidad);
          // }
          // catch (e){
          //   //console.log(e)
          // }
          this.dialogVisible = true;
        // }
        // else{
        //   this.estado="realizado";
        //   if (event.calEvent.supervision > 0) this.estado = 'supervisado';
        //           this.limpiezarealizada = new LimpiezaRealizada(event.calEvent.idelemento,event.calEvent.idzona,event.calEvent.title,
        //           event.calEvent.descripcion,new Date(event.calEvent.prevista),new Date(event.calEvent.start),event.calEvent.tipo,
        //           this.empresasService.userId,event.calEvent.responsable,event.calEvent.idlimpiezaelemento,this.empresasService.seleccionada,event.calEvent.idsupervisor,
        //           new Date(event.calEvent.fecha_supervision),event.calEvent.supervision,event.calEvent.detalles_supervision);
        //           this.supervisor = event.calEvent.supervisor
        //   if (event.calEvent.supervision == 0) this.limpiezarealizada.fecha_supervision = new Date();
        //   this.dialogVisible = true;
        // }
  }
  
      saveEvent(cal: Schedule) {
  
          //let index = this.events.findIndex((event)=> event.idelemento == this.incidencia.id);
          // console.log (index, this.mantenimientos[index],this.limpiezarealizada)
          // this.mantenimientos[index].fecha = this.nuevaFecha();
          
          this.saveItem(this.incidencia);
          this.updateLocalCalendarEvent(this.incidencia,cal);
          this.dialogVisible = false;
          
      }
  
      saveItem(item: Incidencia) {
          let parametros = '?id=' + item.id+this.entidad;    
          item.fecha = new Date(Date.UTC(item.fecha.getFullYear(), item.fecha.getMonth(), item.fecha.getDate(), item.fecha.getHours(), item.fecha.getMinutes()));
          if (moment(item.fecha_cierre).isValid() && !isNullOrUndefined(item.fecha_cierre)){
            console.log(moment(item.fecha_cierre).isValid(),item.fecha_cierre,moment(item.fecha_cierre))
          item.fecha_cierre  = new Date(Date.UTC(item.fecha_cierre.getFullYear(), item.fecha_cierre.getMonth(), item.fecha_cierre.getDate(), item.fecha_cierre.getHours(), item.fecha_cierre.getMinutes()));
          
          }
          console.log(item);

          this.servidor.putObject(URLS.STD_ITEM, parametros, item).subscribe(
            response => {
              if (response.success) {
                console.log('item updated');
                this.incidenciaActualizada.emit(item);
              }
          });
        }
  
  updateLocalCalendarEvent(item: Incidencia,cal: Schedule){
    let index= cal.events.findIndex((elem)=>elem.idelemento==item.id);
    let color= this.setColor(item.estado.toString());
    console.log(index,this.events,item)
    cal.events[index]["title"]=item.incidencia;
    cal.events[index]["start"]=item.fecha;
    cal.events[index]["responsable"]=item.responsable;
    cal.events[index]["descripcion"]=item.descripcion;
    cal.events[index]["estado"]=item.estado;
    cal.events[index]["solucion"]=item.solucion;
    cal.events[index]["responsable_cierre"]=item.responsable_cierre;
    cal.events[index]["fecha_cierre"]=item.fecha_cierre;
    cal.events[index]["color"]=color;
    cal.events = cal.events.slice();
    console.log(color, cal.events[index]);
    console.log(this.currentEvent);
    // this.currentEvent.jsEvent.currentTarget.style.backgroundColor = color;
    // this.currentEvent.jsEvent.currentTarget.textContent = item.incidencia;
    this.currentEvent.jsEvent.target.style.backgroundColor = color;
    this.currentEvent.jsEvent.target.textContent = item.incidencia;
    cal.eventRender;
  }

      cancelEvent() {
        this.dialogVisible = false;
      }
  
    
  }
  