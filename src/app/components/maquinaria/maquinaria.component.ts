import { Component, OnInit, Input,Output, EventEmitter, ViewChild, ElementRef  } from '@angular/core';


import { EmpresasService } from '../../services/empresas.service';
import { Empresa } from '../../models/empresa';
 import { Maquina } from '../../models/maquina';

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
public nuevoMantenimientoR: number;
public incidencia: any;
public permiso:boolean=false;
public alerta:boolean=false;
public estadoSideNav:string="cerrado";
public subMenu:string=null;

  constructor(public empresasService: EmpresasService) {}

  ngOnInit() {
    this.incidencia = {'origen':'maquinaria','idOrigen':null}

  }
cambiarTab(){}

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
              case "lubricante":
                this.lubricante=true;
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
              case "lubricante":
                this.lubricante=true;
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
    this.lubricante=false;
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
}
