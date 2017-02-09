import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { DatePickerOptions, DateModel } from 'ng2-datepicker';
//import {Moment} from 'moment';
import * as moment from 'moment/moment';

import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { Empresa } from '../../models/empresa';
import { MantenimientosMaquina } from '../../models/mantenimientosmaquina';
 import { Maquina } from '../../models/maquina';
 import { Periodicidad } from '../../models/periodicidad';
 import { Modal } from '../../models/modal';
@Component({
  selector: 'periodicidad',
  templateUrl: './periodicidad.component.html',
  styleUrls:['./periodicidad.css']
})

export class PeriodicidadComponent implements OnInit {
@Output() periodo:EventEmitter<string>= new EventEmitter<string>();
@Input() miperiodo: string;
@Input() fechaPrevista: Date;
private fecha:String;
private periodoactual: Periodicidad;
private repeticion:String;
private tipomes : string="diames";
private diames: number;
private diasemana: string;
private numsemana: string;
private writemes:String ="mes";
private writesemana:String="semana";
private cadames:number = 1;
private cadasemana:number =1;
private mes: number;
private alert:boolean=false;
private periodos: String[] = ['diaria', 'semanal','mensual','anual'];
public meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','diciembre'];
public numdias = [];
public dias = [{'nombre':'lunes','checked':true},{'nombre':'martes','checked':true},{'nombre':'miercoles','checked':true},{'nombre':'jueves','checked':true},{'nombre':'viernes','checked':true},{'nombre':'sabados','checked':false},{'nombre':'domingos','checked':false}];
private period: boolean=false;
//public moment: Moment;
  constructor(private servidor: Servidor,private empresasService: EmpresasService) {}

  ngOnInit() {
    //solo se carga el control si hay una maquina seleccionada, por eso no necesito controlar
  //  this.setMantenimientos();
if (this.fechaPrevista){
  this.fecha = moment(this.fechaPrevista).format('DD-MM-YYYY');
  this.diasemana = this.dias[moment(this.fechaPrevista).isoWeekday()-1].nombre;
  this.diames = moment(this.fechaPrevista).date();
}
  if (!this.miperiodo){
      this.alert=true;
  this.periodoactual = new Periodicidad("diaria",this.dias,1,"diames",1,"lunes",1,"")
  }else{
      this.periodoactual = JSON.parse(this.miperiodo);
  }
  this.repeticion = "diaria";
  for (let i = 1; i<31;i++){
      this.numdias.push(i);
  }
    }

ngOnChanges(){
    if (this.fechaPrevista){
  this.fecha = moment(this.fechaPrevista).format('DD-MM-YYYY');
  this.diasemana = this.dias[moment(this.fechaPrevista).isoWeekday()-1].nombre;
  this.diames = moment(this.fechaPrevista).date();
}
}
seleccion(){
    this.period = !this.period
}

cambio(valor) {
    console.log(valor);
    this.periodoactual.repeticion=valor;
    if (valor == "diaria") {
        for (let i = 0; i < 5; i++) {
            this.periodoactual.dias[i].checked = true;
        }
    }
    else {
        for (let i = 0; i < 6; i++) {
            this.periodoactual.dias[i].checked = false;
        }
    }
    if (valor=="mensual" || valor=="anual") this.setMes(1);
}
ok(){
    this.period = false;
  //  console.log(this.periodoactual);
  //  console.log(JSON.stringify(this.periodoactual));
  this.periodo.emit(JSON.stringify(this.periodoactual));
  return false;
}
notok(){
    this.period = false;
    return false;
}
setSemana(valor){
    console.log(valor);
 valor == 1? this.writesemana = "semana": this.writesemana = "semanas";   
}
setMes(valor){
    if (this.periodoactual.repeticion == "mensual"){
   this.periodoactual.frecuencia == 1? this.writemes = "mes": this.writemes = "meses";
    }
    if (this.periodoactual.repeticion == "anual"){
        this.periodoactual.frecuencia == 1? this.writemes = "año": this.writemes = "años";
    }
}
}