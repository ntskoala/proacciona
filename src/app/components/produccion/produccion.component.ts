import { Component, OnInit, Input } from '@angular/core';

import { EmpresasService } from '../../services/empresas.service';
import { ProduccionOrden } from '../../models/produccionorden';
//import { Producto } from '../../models/productos';

@Component({
  selector: 'produccion',
  templateUrl: './produccion.component.html',
  styleUrls:['./produccion.css']
})
export class ProduccionComponent implements OnInit {
public orden: ProduccionOrden;
public calendario: boolean = false;
public ordenes: ProduccionOrden[];

  constructor(private empresasService: EmpresasService) {}

  ngOnInit() {
  }
cambiarTab(){}

seleccionOrden($event){
  console.log('##',$event);
  this.orden = $event;
}

}