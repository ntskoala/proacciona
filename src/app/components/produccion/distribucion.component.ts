import { Component, OnInit, Input, OnChanges } from '@angular/core';
//import {SelectItem} from 'primeng/primeng';
import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { ProveedorLoteProducto } from '../../models/proveedorlote';
import { ProduccionOrden } from '../../models/produccionorden';
import { ProductoPropio } from '../../models/productopropio';
import { Distribucion } from '../../models/distribucion';
import { Cliente } from '../../models/clientes';
import { Modal } from '../../models/modal';


export class alerg{
  constructor(
    public id:number,
    public nombre:string
  ){}
}

@Component({
  selector: 'distribucion',
  templateUrl: './distribucion.component.html',
  styleUrls:['produccion.css']
})

export class DistribucionComponent implements OnInit, OnChanges{
@Input() orden: ProduccionOrden;
//@Input() cliente: Cliente;
public nuevoItem: Distribucion = new Distribucion(0,0,0,0,0,'',new Date(),new Date(),'',0,'','');
//public addnewItem: ProveedorLoteProducto = new ProveedorLoteProducto('','','','',0,0);;
public items: Distribucion[];
public productos: ProductoPropio[]=[];
public clientes: Cliente[]=[];
public medidas: string[]=['Kg.','g.','l.','ml.','unidades'];
public guardar = [];
public idBorrar;
public url=[];
public verdoc: boolean = false;
public foto:string;

public baseurl = URLS.DOCS + this.empresasService.seleccionada + '/clientes_distribucion/';
public modal: Modal = new Modal();
public modal2: Modal;
entidad:string="&entidad=clientes_distribucion";
field:string="&field=idordenproduccion&idItem=";//campo de relación con tabla padre
public es;

  constructor(public servidor: Servidor,public empresasService: EmpresasService) {}

  ngOnInit() {
      this.getClientes();
      this.getProductos();
      this.setItems();
                 this.es = {
            monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
                'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            dayNames: ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'],
            dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
            dayNamesMin: ["Do","Lu","Ma","Mi","Ju","Vi","Sa"],
            firstDayOfWeek: 1
        }; 
  }
  ngOnChanges(){
    console.log("onChange");
      this.setItems();
      this.nuevoItem.numlote = this.orden.numlote;
      if (this.orden.fecha_caducidad.toString() != 'Invalid Date') this.nuevoItem.fecha_caducidad = this.orden.fecha_caducidad;
  }





  setItems(){
     console.log('setting items...')
      let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+this.field+this.orden.id; 
        this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
          response => {
            this.items = [];
            if (response.success && response.data) {
              for (let element of response.data) { 
                  this.items.push(new Distribucion(element.id,element.idempresa,element.idcliente,element.idproductopropio,element.idordenProduccion,element.numlote,new Date(element.fecha),new Date(element.fecha_caducidad),element.responsable,element.cantidad,element.tipo_medida,element.alergenos));
             }
            }
        },
        error=>console.log(error),
        ()=>{}
        );
  }

getProductos(){
         let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=productos"; 
        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            this.productos = [];
            if (response.success && response.data) {
              for (let element of response.data) { 
                  this.productos.push(new ProductoPropio(element.nombre,element.descripcion,element.alergenos,element.doc,element.id,element.idempresa));
             }
            }
        },
        error=>console.log(error),
        ()=>{}
        ); 
}

// getProd(){
//   if (this.orden.idproductopropio){
//   let i= this.productos.findIndex((prod)=> prod.id==this.orden.idproductopropio);
//   }
// }
getClientes(){
         let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=clientes"; 
        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            this.clientes = [];
            if (response.success && response.data) {
              for (let element of response.data) { 
                  this.clientes.push(new Cliente(element.nombre,element.idempresa,element.contacto,element.telf,element.email,element.id));
             }
            }
        },
        error=>console.log(error),
        ()=>{this.setItems()}
        ); 
}
  newItem() {
    
    let param = this.entidad+this.field+this.orden.id;
    this.nuevoItem.idempresa = this.empresasService.seleccionada;
    this.nuevoItem.idordenproduccion = this.orden.id;
    this.nuevoItem.idproductopropio = this.orden.idproductopropio;
    this.nuevoItem.id = 0;
     this.orden.remanente -= this.nuevoItem.cantidad;
    //this.addnewItem = this.nuevoItem;
    this.servidor.postObject(URLS.STD_ITEM, this.nuevoItem,param).subscribe(
      response => {
        if (response.success) {
          this.items.push(this.nuevoItem);
          this.items[this.items.length-1].id= response.id;
          this.saveRemanente();
        }
    },
    error =>console.log(error),
    () =>this.setItems()   
    );

   this.nuevoItem =  new Distribucion(0,0,0,0,0,this.orden.numlote,new Date(),new Date(),'',0,'','');
  }



    itemEdited(idItem: number, fecha?: any) {
    this.guardar[idItem] = true;
    //console.log (fecha.toString());
  }

 saveItem(item: ProveedorLoteProducto,i: number) {
    this.guardar[item.id] = false;
    let parametros = '?id=' + item.id+this.entidad;    
    this.servidor.putObject(URLS.STD_ITEM, parametros, item).subscribe(
      response => {
        if (response.success) {
        }
    });
  }

saveRemanente(){
  let item: ProduccionOrden = this.orden;
    let parametros = '?id=' + item.id+"&entidad=produccion_orden";    
    this.servidor.putObject(URLS.STD_ITEM, parametros, item).subscribe(
      response => {
        if (response.success) {
        }
    });
}

checkBorrar(idBorrar: number) {
    // Guardar el id del control a borrar
    this.idBorrar = idBorrar;
    // Crea el modal
    this.modal.titulo = 'proveedores.borrarEntregaProductoT';
    this.modal.subtitulo = 'proveedores.borrarEntregaProductoST';
    this.modal.eliminar = true;
    this.modal.visible = true;
}
  cerrarModal(event: boolean) {
    this.modal.visible = false;
    if (event) {
      let parametros = '?id=' + this.idBorrar+this.entidad;
      this.servidor.deleteObject(URLS.STD_ITEM, parametros).subscribe(
        response => {
          if (response.success) {
            let controlBorrar = this.items.find(prod => prod.id == this.idBorrar);
            let indice = this.items.indexOf(controlBorrar);
            this.items.splice(indice, 1);
          }
      });
    }
  }







}
