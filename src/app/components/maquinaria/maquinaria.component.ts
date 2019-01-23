import { Component, OnInit, Input,Output, EventEmitter, ViewChild, ElementRef  } from '@angular/core';
import { Router,ActivatedRoute, ParamMap  } from '@angular/router';


import { EmpresasService } from '../../services/empresas.service';
import { Empresa } from '../../models/empresa';
 import { Maquina } from '../../models/maquina';
 import { MantenimientosMaquina } from '../../models/mantenimientosmaquina';

@Component({
  selector: 'maquinaria',
  templateUrl: './maquinaria.component.html',
  styleUrls:['./maquinaria.component.css']
})
export class MaquinariaComponent implements OnInit {
  @ViewChild('sidenavCalendar') snCalendar: any;
public maquina: Maquina;
public calendario: boolean = false;
public lubricante: boolean = false;
public maquinas: Maquina[];
public mantenimientosMaquina: MantenimientosMaquina[];
public calibracionesMaquina: MantenimientosMaquina[];
public nuevoMantenimientoR: number;
public incidencia: any;
public permiso:boolean=false;
public alerta:boolean=false;
public estadoSideNav:string="cerrado";
public subMenu:string=null;
public selectedTab: number=null;
public idmaquinaURL:number=null;
public piezas:any;
public inventarioPiezas:boolean;
  constructor(public empresasService: EmpresasService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.incidencia = {'origen':'maquinaria','idOrigen':null}
    let params = this.route.params["_value"]
    if ((params["modulo"] == "mantenimientos_realizados" || params["modulo"] == "mantenimientos_relizados") && this.route.params["_value"]["idOrigenasociado"]){
      
        let event = {'id':this.route.params["_value"]["idOrigenasociado"]}
        this.seleccionZona(event);
        this.idmaquinaURL = this.route.params["_value"]["idOrigenasociado"];
        this.selectedTab = 2;
      
    }else{
      this.idmaquinaURL=null;
      this.seleccionZona(null);
      this.selectedTab = 0;
    }
  }
  seleccionZona($event){
    console.log($event);
    this.maquina = $event;
    //this.incidencia = {'origen':'limpieza_zona','idOrigen':this.limpieza.id}
  }
cambiarTab(){}

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
              case "lubricante":
                this.lubricante=true;
                break;
                case "inventarioPiezas":
                this.inventarioPiezas=true;
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
              case "lubricante":
                this.lubricante=true;
                break;
                case "inventarioPiezas":
                this.inventarioPiezas=true;
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
    this.lubricante=false;
    this.inventarioPiezas=false;
     resolve('ok')
      });
  }
  cerrarSideNav(){
    this.snCalendar.toggle();
    this.closeSideNav();
      this.subMenu = null;
  }




seleccionMaquina($event){
  console.log($event);
  this.maquina = $event;
  this.incidencia = {'origen':'maquinaria','idOrigen':this.maquina.id};
}

loadMaquinas($event){
this.maquinas = $event;
}

setElementosMantenimiento(mantenimientosRecibidos){
  this.mantenimientosMaquina = mantenimientosRecibidos;
}
setElementosCalibracion(calibracionesRecibidas){
  this.calibracionesMaquina = calibracionesRecibidas;
}

calendarios(){
  this.lubricante = false;
  this.calendario = !this.calendario;
}
lubricantes(){
  this.calendario = false;
  this.lubricante = !this.lubricante;
}

nuevoMantenimientoRealizado(evento){
this.nuevoMantenimientoR = evento;
}

setPiezas(piezas){
  this.piezas=piezas
}
}
