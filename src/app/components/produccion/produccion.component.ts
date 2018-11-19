import { Component, OnInit, Input, ViewChild } from '@angular/core';

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
  @ViewChild('sidenavCalendar') snCalendar: any;

public orden: ProduccionOrden;
public calendario: boolean = false;
public ordenes: ProduccionOrden[];
public traspaso: boolean;
public productos: boolean;
public almacenes: boolean;
public alergenos: boolean;
public subMenu:string=null;

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
// editProductos(){
// this.productos = !this.productos;
// }
// editAlmacenes(){
// this.almacenes = !this.almacenes;
// }


cambioMenu(opcion: string){


  this.snCalendar.toggle().then(
  (valor)=>{
    console.log ('$$$$',valor,this.subMenu, opcion)
    if (valor=="open")
      {
        console.log ('abriendo.-..')
      this.closeSideNav().then(
        (resultado)=>{
          switch (opcion){
            case "productos":
              this.productos=true;
              break;
            case "almacenes":
              this.almacenes=true;
              break;
            case "alergenos":
              this.alergenos=true;
            break;
          }
           this.subMenu = opcion;   
        });
      }
      
     if (valor=="close"){
        console.log ('cerrando.-..')
        //console.log ('$$$',this.subMenu, opcion)
        this.closeSideNav().then(
        (resultado)=>{
        if (this.subMenu != opcion){
          console.log ('$$',this.subMenu, opcion)
          switch (opcion){
            case "productos":
              this.productos=true;
              break;
            case "almacenes":
              this.almacenes=true;
              break;
            case "alergenos":
              this.alergenos=true;
              break;
          }
            this.subMenu = opcion;
            this.snCalendar.toggle();
        }else{
          this.subMenu=null;
        }
        });
        }
  });

}
closeSideNav(){
  return new Promise((resolve, reject) => {
  console.log('close sideNav')
  //this.snCalendar.close();
 
  this.productos=false;
  this.almacenes=false;
  this.alergenos = false;
   resolve('ok')
    });
}

cerrarSideNav(){
  this.snCalendar.toggle();
  this.closeSideNav();
    this.subMenu = null;
}



}