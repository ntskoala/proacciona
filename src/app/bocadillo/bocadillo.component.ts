import { Component, OnInit,OnChanges, Input,Output, EventEmitter } from '@angular/core';
import * as moment from 'moment/moment';


@Component({
  selector: 'bocadillo',
  templateUrl: './bocadillo.component.html',
  styleUrls:['./bocadillo.css']
})

export class BocadilloComponent implements OnInit,OnChanges{
@Input() element:any;
@Output() estado:EventEmitter<string>=new EventEmitter<string>();
public top;
public left;
constructor() {}

ngOnInit(){
    console.log('***',this.element)
    this.top=this.element.y;
    this.left=this.element.x;
}
ngOnChanges(){
  console.log('***',this.element)
  this.top=this.element.y;
  this.left=this.element.x; 
}
close(){
  this.estado.emit('ok');
}
}