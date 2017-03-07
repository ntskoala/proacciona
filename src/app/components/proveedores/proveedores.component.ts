import { Component, OnInit, Input } from '@angular/core';

import { EmpresasService } from '../../services/empresas.service';
import { Proveedor } from '../../models/proveedor';
//import { Producto } from '../../models/productos';

@Component({
  selector: 'proveedores',
  templateUrl: './proveedores.component.html',
  styleUrls:['./proveedores.component.css']
})
export class ProveedoresComponent implements OnInit {
public proveedor: Proveedor;
public calendario: boolean = false;
public proveedores: Proveedor[];

  constructor(private empresasService: EmpresasService) {}

  ngOnInit() {

  }
cambiarTab(){}

seleccionProveedor($event){
  console.log('##',$event);
  this.proveedor = $event;
}




}