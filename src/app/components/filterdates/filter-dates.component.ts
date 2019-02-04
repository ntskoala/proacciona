import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';

//import {Moment} from 'moment';
import * as moment from 'moment/moment';
import { cal } from '../../models/urls';

@Component({
  selector: 'filter-dates',
  templateUrl: './filter-dates.component.html',
  //styleUrls:['./periodicidad.css']
})

export class FilterDatesComponent implements OnInit {
@Output() onDates:EventEmitter<Object>= new EventEmitter<Object>();
public es: any;
public fechas:Object={fecha_inicio:new Date(),fecha_fin:new Date()};

  constructor() {}

  ngOnInit() {
    this.es=cal;
    }

ngOnChanges(){
}


seleccion(accion:string){
    if (accion =='ok'){
        this.fechas['fecha_inicio'] = moment(this.fechas['fecha_inicio']).format('YYYY-MM-DD').toString();
        this.fechas['fecha_fin'] = moment(this.fechas['fecha_fin']).format('YYYY-MM-DD').toString();
    this.onDates.emit(this.fechas);
    }else{
        this.onDates.emit('void');
    }
}


}