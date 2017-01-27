import { Component, OnInit } from '@angular/core';


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
  constructor(private empresasService: EmpresasService) {}

  ngOnInit() {

  }
cambiarTab(){}

seleccionMaquina($event){
  console.log($event);
  this.maquina = $event;
}
}
