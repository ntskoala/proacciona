import { Component, OnInit, Input } from '@angular/core';


import { EmpresasService } from '../../services/empresas.service';
import { Empresa } from '../../models/empresa';
 import { LimpiezaZona } from '../../models/limpiezazona';

@Component({
  selector: 'limpieza',
  templateUrl: './limpieza.component.html',
  styleUrls:['./limpieza.component.css']
})
export class LimpiezaComponent implements OnInit {
public limpieza: LimpiezaZona;
public calendario: boolean = false;
public productosLimpieza: boolean = false;
public limpiezas: LimpiezaZona[];
  constructor(private empresasService: EmpresasService) {}

  ngOnInit() {

  }
cambiarTab(){}

seleccionZona($event){
  console.log($event);
  this.limpieza = $event;
}

loadZonas($event){
this.limpiezas = $event;
}

calendarios(){
  this.productosLimpieza = false;
  this.calendario = !this.calendario;
}
verProductosLimpieza(){
  this.calendario = false;
  this.productosLimpieza = !this.productosLimpieza;
}
}
