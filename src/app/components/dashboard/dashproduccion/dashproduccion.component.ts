import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-dashproduccion',
  templateUrl: './dashproduccion.component.html',
  styleUrls: ['./dashproduccion.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DashproduccionComponent implements OnInit {
public calculando:boolean=false;
  constructor() { }

  ngOnInit() {
  }

  loadResultados(dias:number){

  }
}
