import { Component, OnInit, Input } from '@angular/core';


import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { Empresa } from '../../models/empresa';
 import { Maquina } from '../../models/maquina';
 import { CalendarioMantenimiento } from '../../models/calendariomantenimiento';
 import { MantenimientoRealizado } from '../../models/mantenimientorealizado';

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
                  this.events.push({"idmantenimiento":element.id,"idmaquina":element.idmaquina,"title":element.maquina + " " + element.nombre,"start":element.fecha,"tipo":element.tipo,"usuario":element.idusuario,"responsable":element.responsable,"tipo2":"preventivo","color":color});   
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
  console.log(event)
        this.mantenimiento = new MantenimientoRealizado(event.calEvent.idmantenimiento,event.calEvent.idmaquina,event.calEvent.title,event.calEvent.title,'',event.calEvent.start,new Date(),)
        //this.event.title = e.calEvent.title;
        
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
        console.log(this.mantenimiento)
        this.dialogVisible = false;
    }
    cancelEvent() {
      this.dialogVisible = false;
    }

    nuevaFecha(){

    }
}
