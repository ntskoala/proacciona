import { Component, OnInit, Input, ViewChild} from '@angular/core';
import { Router,ActivatedRoute, ParamMap  } from '@angular/router';

import { EmpresasService } from '../../services/empresas.service';
import { Empresa } from '../../models/empresa';
 import { LimpiezaZona } from '../../models/limpiezazona';
  import { LimpiezaElemento } from '../../models/limpiezaelemento';
import { LimpiezaProducto } from '../../models/limpiezaproducto';
import { Protocolo } from '../../models/limpiezaprotocolo';

@Component({
  selector: 'limpieza',
  templateUrl: './limpieza.component.html',
  styleUrls:['./limpieza.component.css']
})
export class LimpiezaComponent implements OnInit {
  @ViewChild('sidenavCalendar') snCalendar: any;
public incidencia:any;
public limpieza: LimpiezaZona;
public elementosLimpieza: LimpiezaElemento[];
public misProdusctosLimpieza: LimpiezaProducto[];
public misProtocolosLimpieza: Protocolo[];
public calendario: boolean = false;
public productosLimpieza: boolean = false;
public limpiezas: LimpiezaZona[];
public nuevaLimpiezaR: number;
public migrandoEstat: boolean= false;
public permiso:boolean=false;
public productos:boolean=false;
public protocolos:boolean=false;
public estadoSideNav:string="cerrado";
public subMenu:string=null;
public selectedTab: number=null;
public idlimpiezaURL:number=null;
  constructor(public empresasService: EmpresasService,public router: Router,private route: ActivatedRoute) {}

  ngOnInit() {
    this.incidencia = {'origen':'limpieza_zona','idOrigen':null}
    let x=0;
    console.log(this.route.params["_value"]["modulo"],this.route.params["_value"]["id"])

        if (this.route.params["_value"]["modulo"] == "limpieza_realizada"){
          if (this.route.params["_value"]["idOrigenasociado"]){
            let event = {'id':this.route.params["_value"]["idOrigenasociado"]}
            this.seleccionZona(event);
            this.idlimpiezaURL = this.route.params["_value"]["idOrigenasociado"];
            this.selectedTab = 1;
          }
        }else{
          this.idlimpiezaURL=null;
          this.seleccionZona(null);
          this.selectedTab = 0;
        }

  }


seleccionZona($event){
  console.log($event);
  this.limpieza = $event;
  //this.incidencia = {'origen':'limpieza_zona','idOrigen':this.limpieza.id}
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
setProductos(productosLimpiezaRecibidos){
  this.misProdusctosLimpieza = productosLimpiezaRecibidos;
}
setProtocolos(protocolosLimpiezaRecibidos){
  this.misProtocolosLimpieza = protocolosLimpiezaRecibidos;
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
    console.log ('$$$$',valor,this.subMenu, opcion)
    if (valor=="open")
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
            case "protocolos":
              this.protocolos=true;
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
            case "calendario":
              this.calendario=true;
              break;
            case "permiso":
              this.permiso=true;
              break;
            case "productos":
              this.productos=true;
              break;
            case "protocolos":
              this.protocolos=true;
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
  this.protocolos = false;
   resolve('ok')
    });
}
cerrarSideNav(){
  this.snCalendar.toggle();
  this.closeSideNav();
    this.subMenu = null;
}


}
