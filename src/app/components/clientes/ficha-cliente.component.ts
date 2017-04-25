import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { EmpresasService } from '../../services/empresas.service';
import { Servidor } from '../../services/servidor.service';
import { Empresa } from '../../models/empresa';
import { Cliente } from '../../models/clientes';
import { Modal } from '../../models/modal';
import { URLS } from '../../models/urls';

@Component({
  selector: 'ficha-cliente',
  templateUrl: './ficha-cliente.component.html',
  styleUrls:['./clientes.css']
})
export class FichaClienteComponent implements OnInit {
//*** STANDARD VAR
@Input() cliente: Cliente;
@Output() itemSeleccionado: EventEmitter<Cliente> = new EventEmitter<Cliente>();
public itemActivo: number;
public items: Cliente[]=[];//Array de Items para el desplegable;
public  nuevoItem: Cliente = new Cliente('',0);
public item1:Cliente = new Cliente('Selecciona',0);
public  modal: Modal = new Modal();
public  modificaItem: boolean;
public  nuevoNombre:string;

//*** ESPECIFIC VAR */

  constructor(public empresasService: EmpresasService, public servidor: Servidor) {}

  ngOnInit() {

  }
cambiarTab(){}

updateItem(cliente: Cliente){
 cliente.id =this.cliente.id;
 cliente.idEmpresa = this.empresasService.seleccionada;
let param = "&entidad=clientes";
let parametros = '?id=' + cliente.id+param;     
    this.servidor.putObject(URLS.STD_ITEM,parametros, cliente).subscribe(
      response => {
        if (response.success) {
          console.log("updated");
          //let index = this.items.findIndex((elem) =>elem.id == this.itemActivo);
          //this.items[index].nombre = this.nuevoNombre;
          //this.listaZonas.emit(this.limpiezas);
          //this.modificaItem = false;
        }
    });
}

}