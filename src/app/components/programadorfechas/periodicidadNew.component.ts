import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
// import { DatepickerOptions, DateModel } from 'ng2-datepicker';
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
  selector: 'periodicidadNew',
  templateUrl: './periodicidadNew.component.html',
  styleUrls:['./periodicidad.css']
})

export class PeriodicidadNewComponent implements OnInit {
@Output() periodo:EventEmitter<string>= new EventEmitter<string>();
@Output() activo:EventEmitter<boolean>= new EventEmitter<boolean>();
@Input() miperiodo: string;
@Input() origen: string;
@Input() fechaPrevista: Date;
@Input() top: string;
public fecha:String;
public periodoactual: Periodicidad;
public repeticion:String;
public tipomes : string="diames";
public diames: number;
public diasemana: string;
public numsemana: string;
public writemes:String ="mes";
public writesemana:String="semana";
public cadames:number = 1;
public cadasemana:number =1;
public mes: number;
public alert:boolean=false;
public periodos: String[];// = ['diaria', 'semanal','mensual','anual','por uso'];
public meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
public numdias = [];
public dias = [{'nombre':'lunes','checked':true},{'nombre':'martes','checked':true},{'nombre':'miercoles','checked':true},{'nombre':'jueves','checked':true},{'nombre':'viernes','checked':true},{'nombre':'sabados','checked':false},{'nombre':'domingos','checked':false}];
public period: boolean=false;
//public moment: Moment;
  constructor(public servidor: Servidor,public empresasService: EmpresasService) {}

ngOnInit() {
//solo se carga el control si hay una maquina seleccionada, por eso no necesito controlar
//  this.setMantenimientos();
  console.log('##########',this.origen);
if (this.origen == 'limpieza' || this.origen == 'libre'){
    this.periodos = ['diaria', 'semanal','mensual','anual','por uso'];
}else{
     this.periodos = ['diaria', 'semanal','mensual','anual'];
}
if (this.fechaPrevista)
this.iniciaFechas();

this.iniciaPeriodo();

  this.repeticion = "diaria";
  for (let i = 1; i<31;i++){
      this.numdias.push(i);
  }
}

ngOnChanges(){
    console.log('view Periodicidad Ok',this.miperiodo);
    if (this.fechaPrevista){
        this.iniciaFechas();
        this.iniciaPeriodo();
        this.period=true;
}
// if (this.top) this.topper=this.top
}

iniciaFechas(){
    this.fecha = moment(this.fechaPrevista).format('DD-MM-YYYY');
    this.diasemana = moment(this.fechaPrevista).isoWeekday().toString();
    this.diames = moment(this.fechaPrevista).date();
}
iniciaPeriodo(){
    if (!this.miperiodo || this.miperiodo=='true'){
        this.alert=true;
    this.periodoactual = new Periodicidad("diaria",this.dias,1,"diames",this.diames,"1",1,"")
    }else{
        this.periodoactual = JSON.parse(this.miperiodo);
    }
}
seleccion(){
    this.period = !this.period;
    if (this.period){
        this.activo.emit(true);
    }
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
  this.alert = false;
  this.periodo.emit(JSON.stringify(this.periodoactual));
  return false;
}
notok(){
    this.period = false;
    this.activo.emit(false);
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