import { Component, OnInit, Output,EventEmitter } from '@angular/core';
import { EmpresasService } from '../services/empresas.service';

@Component({
  selector: 'menu',
  templateUrl: '../assets/html/menu.component.html',
  styleUrls:['../assets/css/menu.component.css']
})
export class MenuComponent implements OnInit{
@Output() selectedMenu: EventEmitter<string>= new EventEmitter<string>();


  constructor(private empresasService: EmpresasService) {}

  ngOnInit() {
  }

setSeleccion(opcionmenu){
this.selectedMenu.emit(opcionmenu);
}

}
