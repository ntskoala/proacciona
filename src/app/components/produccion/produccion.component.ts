import { Component, OnInit, Input } from '@angular/core';

import { EmpresasService } from '../../services/empresas.service';
import { PermisosService } from '../../services/permisos.service';
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
public traspaso: boolean;
public productos: boolean;
public almacenes: boolean;

  constructor(public empresasService: EmpresasService, public permisosService:PermisosService) {}

  ngOnInit() {
  }
cambiarTab(){}

seleccionOrden($event){
  console.log('##',$event);
  this.orden = $event;
}
traspasar(){
this.traspaso = !this.traspaso;
}
editProductos(){
this.productos = !this.productos;
}
editAlmacenes(){
this.almacenes = !this.almacenes;
}
}