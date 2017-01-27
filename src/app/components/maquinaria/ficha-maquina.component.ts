import { Component, OnInit, Input } from '@angular/core';


import { EmpresasService } from '../../services/empresas.service';
import { Empresa } from '../../models/empresa';
 import { Maquina } from '../../models/maquina';
 
@Component({
  selector: 'ficha-maquina',
  templateUrl: './ficha-maquina.component.html'
})
export class FichaMaquinaComponent implements OnInit {
@Input() maquina:Maquina;

  constructor(private empresasService: EmpresasService) {}

  ngOnInit() {

  }
cambiarTab(){}

}