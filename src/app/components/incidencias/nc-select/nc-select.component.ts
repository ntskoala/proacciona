import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';



@Component({
  selector: 'app-nc-select',
  templateUrl: './nc-select.component.html',
  styleUrls: ['./nc-select.component.css']
})
export class NcSelectComponent implements OnInit, OnChanges {
@Output() cambio: EventEmitter<number>= new EventEmitter<number>();
@Input() valor:number;
public estadosMoConformidad:object[]=[];
public selected: number;
  constructor() { }

  ngOnInit() {
    this.estadosMoConformidad = [{'nombre':'No activado','valor':0},{'nombre':'Activado','valor':1},{'nombre':'Resuelto','valor':2}]
  }
ngOnChanges(){

}

onChange(evento){
console.log(evento);
this.cambio.emit(evento.value);
}

}
