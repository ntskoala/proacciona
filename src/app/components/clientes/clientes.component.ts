import { Component, OnInit, Input } from '@angular/core';

import { EmpresasService } from '../../services/empresas.service';
import { Cliente } from '../../models/clientes';
//import { Producto } from '../../models/productos';

@Component({
  selector: 'clientes',
  templateUrl: './clientes.component.html',
  styleUrls:['./clientes.css']
})
export class ClientesComponent implements OnInit {
public cliente: Cliente;
public clientes: Cliente[];

  constructor(public empresasService: EmpresasService) {}

  ngOnInit() {

  }
cambiarTab(){}

seleccionCliente($event){
  console.log('##',$event);
  this.cliente = $event;
}




}