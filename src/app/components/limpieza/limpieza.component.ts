import { Component, OnInit, Input, ViewChild} from '@angular/core';


import { EmpresasService } from '../../services/empresas.service';
import { Empresa } from '../../models/empresa';
 import { LimpiezaZona } from '../../models/limpiezazona';
  import { LimpiezaElemento } from '../../models/limpiezaelemento';

@Component({
  selector: 'limpieza',
  templateUrl: './limpieza.component.html',
  styleUrls:['./limpieza.component.css']
})
export class LimpiezaComponent implements OnInit {
  @ViewChild('sidenavCalendar') snCalendar: any;

public limpieza: LimpiezaZona;
public elementosLimpieza: LimpiezaElemento[];
public calendario: boolean = false;
public productosLimpieza: boolean = false;
public limpiezas: LimpiezaZona[];
public nuevaLimpiezaR: number;
public migrandoEstat: boolean= false;
public permiso:boolean=false;
public productos:boolean=false;
public estadoSideNav:string="cerrado";
public subMenu:string=null;
  constructor(public empresasService: EmpresasService) {}

  ngOnInit() {

  }
cambiarTab(){}

seleccionZona($event){
  //console.log($event);
  this.limpieza = $event;
}

loadZonas($event){
this.limpiezas = $event;
}

calendarios(){
  this.productosLimpieza = false;
  this.calendario = !this.calendario;
}
verProductosLimpieza(){
  this.calendario = false;
  this.productosLimpieza = !this.productosLimpieza;
}

nuevaLimpiezaRealizada(event){
  this.nuevaLimpiezaR = event;

}

setElementosLimpieza(elementosLimpiezaRecibidos){
  this.elementosLimpieza=elementosLimpiezaRecibidos;
}

actulizaPermisos(permisos){
console.log(permisos);
}


migrando(event){
this.migrandoEstat = event;

}

cambioMenu(opcion: string){


  this.snCalendar.toggle().then(
  (valor)=>{
    console.log ('$$$$',valor.type,this.subMenu, opcion)
    if (valor.type=="open")
      {
        console.log ('abriendo.-..')
      this.closeSideNav().then(
        (resultado)=>{
          switch (opcion){
            case "calendario":
              this.calendario=true;
              break;
            case "permiso":
              this.permiso=true;
              break;
            case "productos":
              this.productos=true;
              break;
          }
           this.subMenu = opcion;   
        });
      }
      
     if (valor.type=="close"){
        console.log ('cerrando.-..')
        //console.log ('$$$',this.subMenu, opcion)
        this.closeSideNav().then(
        (resultado)=>{
        if (this.subMenu != opcion){
          console.log ('$$',this.subMenu, opcion)
          switch (opcion){
            case "calendario":
              this.calendario=true;
              break;
            case "permiso":
              this.permiso=true;
              break;
            case "productos":
              this.productos=true;
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
  this.calendario=false;
  this.permiso=false;
  this.productos=false;
   resolve('ok')
    });
}
cerrarSideNav(){
  this.snCalendar.toggle();
  this.closeSideNav();
    this.subMenu = null;
}


}
