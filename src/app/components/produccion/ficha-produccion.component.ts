import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';

import { EmpresasService } from '../../services/empresas.service';
import { Servidor } from '../../services/servidor.service';
import { Empresa } from '../../models/empresa';
import { ProduccionOrden } from '../../models/produccionorden';
import { Modal } from '../../models/modal';
import { URLS } from '../../models/urls';
import { Almacen } from '../../models/almacenes';
import { ProductoPropio } from '../../models/productopropio';

@Component({
  selector: 'ficha-produccion',
  templateUrl: './ficha-produccion.component.html',
  styleUrls:['./produccion.css']
})
export class FichaProduccionComponent implements OnInit, OnChanges {
//*** STANDARD VAR
@Input() orden: ProduccionOrden;
@Output() itemSeleccionado: EventEmitter<ProduccionOrden> = new EventEmitter<ProduccionOrden>();




//*** ESPECIFIC VAR */
private es:any;
private trazabilidad: boolean;
private almacenesDestino: Almacen[];
public productos: ProductoPropio[]=[];
public medidas: string[]=['Kg.','g.','l.','ml.','unidades'];
  constructor(private empresasService: EmpresasService, private servidor: Servidor) {}

  ngOnInit() {
    this.getProductos();
    this.getAlmacenes();
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

  }
  
cambiarTab(){}

updateItem(orden: ProduccionOrden){
 orden.id =this.orden.id;
 orden.idempresa = this.empresasService.seleccionada;
let param = "&entidad=produccion_orden";
let parametros = '?id=' + orden.id+param;     
    this.servidor.putObject(URLS.STD_ITEM,parametros, orden).subscribe(
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

getAlmacenes() {
    
    let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=almacenes";

        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            //this.itemActivo = 0;
            // Vaciar la lista actual
            this.almacenesDestino = [];
            this.almacenesDestino.push(new Almacen(0,0,'Selecciona',0,0,0));
            if (response.success == 'true' && response.data) {
              for (let element of response.data) {
                this.almacenesDestino.push(new Almacen(element.id,element.idempresa,element.nombre,element.capacidad,element.estado,element.idproduccionordenactual,element.level));
              }
             // this.listaZonas.emit(this.limpiezas);
            }
        });
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
setIdProductoPropio(id: number){
  let i = this.productos.findIndex((prod) => prod.id==id)
  if (i>=0) this.orden.nombre = this.productos[i].nombre;
}

seleccionarDestino(valor){
  this.orden.idalmacen = this.almacenesDestino[valor].id;
}

trazabilidadAtras(){
this.trazabilidad= !this.trazabilidad;
}
trazabilidadAdelante(){
this.trazabilidad= !this.trazabilidad;
}
}