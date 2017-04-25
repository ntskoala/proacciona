import { Component, OnInit, Input } from '@angular/core';


import { EmpresasService } from '../../services/empresas.service';
import { Empresa } from '../../models/empresa';
 import { Maquina } from '../../models/maquina';

@Component({
  selector: 'maquinaria',
  templateUrl: './maquinaria.component.html',
  styleUrls:['./maquinaria.component.css']
})
export class MaquinariaComponent implements OnInit {
public maquina: Maquina;
public calendario: boolean = false;
public lubricante: boolean = false;
public maquinas: Maquina[];
  constructor(public empresasService: EmpresasService) {}

  ngOnInit() {

  }
cambiarTab(){}

seleccionMaquina($event){
  console.log($event);
  this.maquina = $event;
}

loadMaquinas($event){
this.maquinas = $event;
}

calendarios(){
  this.lubricante = false;
  this.calendario = !this.calendario;
}
lubricantes(){
  this.calendario = false;
  this.lubricante = !this.lubricante;
}
}
