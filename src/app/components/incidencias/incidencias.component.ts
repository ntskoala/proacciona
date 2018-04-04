import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';

import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from 'ng2-translate';
import { DataTable, Column } from 'primeng/primeng';
import { Table } from 'primeng/table';
import {Calendar} from 'primeng/primeng';

import { EmpresasService } from '../../services/empresas.service';
import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { Empresa } from '../../models/empresa';
import { Incidencia } from '../../models/incidencia';
import { Modal } from '../../models/modal';
import {MatSelect,MatSnackBar} from '@angular/material';


//  import { LimpiezaZona } from '../../models/limpiezazona';
//   import { LimpiezaElemento } from '../../models/limpiezaelemento';
// import { LimpiezaProducto } from '../../models/limpiezaproducto';
// import { Protocolo } from '../../models/limpiezaprotocolo';


import * as moment from 'moment';
@Component({
  selector: 'app-incidencias',
  templateUrl: './incidencias.component.html',
  styleUrls: ['./incidencias.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class IncidenciasComponent implements OnInit {

  @ViewChild('sidenavCalendar') snCalendar: any;
public myTop;
public myLeft;
public ayuda;
public incidencias: Incidencia[];
public nuevaIncidenciaFromIncidencias: Incidencia;
// public limpieza: LimpiezaZona;
// public elementosLimpieza: LimpiezaElemento[];
// public misProdusctosLimpieza: LimpiezaProducto[];
// public misProtocolosLimpieza: Protocolo[];
 public calendario: boolean = false;
// public productosLimpieza: boolean = false;
// public limpiezas: LimpiezaZona[];
// public nuevaLimpiezaR: number;
// public migrandoEstat: boolean= false;
 public permiso:boolean=false;
// public productos:boolean=false;
// public protocolos:boolean=false;
public estadoSideNav:string="cerrado";
public subMenu:string=null;

  constructor(public servidor: Servidor, public empresasService: EmpresasService
    , public translate: TranslateService, private messageService: MessageService) { }

  ngOnInit() {
    this.ayuda=true;
   this.myTop =document.getElementById("botonIncidencia").offsetTop;
   this.myLeft=document.getElementById("botonIncidencia").offsetLeft+document.getElementById("botonIncidencia").offsetWidth;
  }
  // setStyles(){
  //   let styles = {
  //   'position':'relative',
  //   'top':this.myTop+'px',
  //   'left':this.myLeft+'px',
  //   'color':'#fff',
  //   };
  //   return styles;
  // }
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
              // case "productos":
              //   this.productos=true;
              //   break;
              // case "protocolos":
              //   this.protocolos=true;
              // break;
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
              // case "productos":
              //   this.productos=true;
              //   break;
              // case "protocolos":
              //   this.protocolos=true;
              //   break;
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
    // this.productos=false;
    // this.protocolos = false;
     resolve('ok')
      });
  }
  cerrarSideNav(){
    this.snCalendar.toggle();
    this.closeSideNav();
      this.subMenu = null;
  }
  nuevaIncidenciaCreada(evento){
    console.log(evento);
    this.nuevaIncidenciaFromIncidencias = evento;

  }
  cargaIncidencias(incidencias: Incidencia[]){
    this.incidencias= incidencias;

  }
}