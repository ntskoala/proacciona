import { Component, OnInit, Input, ViewChild } from '@angular/core';

import { EmpresasService } from '../../services/empresas.service';

import { Proveedor } from '../../models/proveedor';
//import { Producto } from '../../models/productos';

@Component({
  selector: 'proveedores',
  templateUrl: './proveedores.component.html',
  styleUrls:['./proveedores.component.css']
})
export class ProveedoresComponent implements OnInit {
  @ViewChild('sidenavCalendar') snCalendar: any;
public proveedor: Proveedor;
public calendario: boolean = false;
public proveedores: Proveedor[];
public familias:boolean = false;
public alergenos:boolean = false;
public subMenu:string=null;
public cambioProds:boolean;
  constructor(public empresasService: EmpresasService) {}

  ngOnInit() {

  }
cambiarTab(){}

seleccionProveedor($event){
  console.log('##',$event);
  this.proveedor = $event;
}

cambioEnProductos(eventFired:boolean){
this.cambioProds = !this.cambioProds;
}


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
            case "familias":
              this.familias=true;
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
            case "familias":
              this.familias=true;
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
 
  this.familias=false;
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