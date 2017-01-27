import { Component, OnInit, Output,EventEmitter } from '@angular/core';
import { EmpresasService } from '../services/empresas.service';

@Component({
  selector: 'alertas',
  templateUrl: '../assets/html/alertas.component.html',
  styleUrls:['../assets/css/alertas.component.css']
})
export class AlertasComponent implements OnInit{
//@Output() selectedMenu: EventEmitter<string>= new EventEmitter<string>();


  constructor(private empresasService: EmpresasService) {}

  ngOnInit() {
  }

setSeleccion(opcionmenu){
//this.selectedMenu.emit(opcionmenu);
}

}
