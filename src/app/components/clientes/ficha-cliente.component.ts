import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { EmpresasService } from '../../services/empresas.service';
import { Servidor } from '../../services/servidor.service';
import { Empresa } from '../../models/empresa';
import { Proveedor } from '../../models/proveedor';
import { Modal } from '../../models/modal';
import { URLS } from '../../models/urls';

@Component({
  selector: 'ficha-cliente',
  templateUrl: './ficha-cliente.component.html',
  styleUrls:['./clientes.css']
})
export class FichaClienteComponent implements OnInit {
//*** STANDARD VAR
@Input() proveedor: Proveedor;
@Output() itemSeleccionado: EventEmitter<Proveedor> = new EventEmitter<Proveedor>();
public itemActivo: number;
public items: Proveedor[]=[];//Array de Items para el desplegable;
public  nuevoItem: Proveedor = new Proveedor('',0);
public item1:Proveedor = new Proveedor('Selecciona',0);
public  modal: Modal = new Modal();
public  modificaItem: boolean;
public  nuevoNombre:string;

//*** ESPECIFIC VAR */

  constructor(private empresasService: EmpresasService, private servidor: Servidor) {}

  ngOnInit() {

  }
cambiarTab(){}

updateItem(proveedor: Proveedor){
 proveedor.id =this.proveedor.id;
 proveedor.idEmpresa = this.empresasService.seleccionada;
let param = "&entidad=proveedores";
let parametros = '?id=' + proveedor.id+param;     
    this.servidor.putObject(URLS.STD_ITEM,parametros, proveedor).subscribe(
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