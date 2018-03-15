import { Component, Input, OnInit,OnChanges, Output,EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { EmpresasService } from '../../services/empresas.service';
import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { Empresa } from '../../models/empresa';
import { LimpiezaZona } from '../../models/limpiezazona';
import { Modal } from '../../models/modal';
import {MatSelect} from '@angular/material';
@Component({
  selector: 'listado-limpieza',
  templateUrl: './listado-limpieza.component.html',
  styleUrls:['./listado-limpieza.css']
})
export class ListadoLimpiezasComponent implements OnInit, OnChanges {
  //@ViewChild('choicer') Choicer: ElementRef;
  @ViewChild('choicer') Choicer: MatSelect;
  @Output() zonaSeleccionada: EventEmitter<LimpiezaZona>=new EventEmitter<LimpiezaZona>();
  @Output() listaZonas: EventEmitter<LimpiezaZona[]>=new EventEmitter<LimpiezaZona[]>();
  @Output() migrando: EventEmitter<boolean>=new EventEmitter<boolean>();
  @Input() idSelected: number;
  public myItem: number = null;
  
  public subscription: Subscription;
  public limpiezaActiva: number = 0;
  public limpieza1: LimpiezaZona = new LimpiezaZona(0,0, 'Seleccionar zona');
  public limpiezas: LimpiezaZona[] = [];
  public novaLimpieza: LimpiezaZona;// = new LimpiezaZona(0,0,'');
  public modal: Modal = new Modal();
  public modificaZona: boolean;
  public nuevoNombre:string;
  public open:boolean;
  public import: boolean=false;
  public valorLimpieza:number;
  constructor(public servidor: Servidor, public empresasService: EmpresasService) {}

ngOnInit(){
  console.log('select limpiezaZona init',this.idSelected)
  
 // this.subscription = this.empresasService.empresaSeleccionada.subscribe(x => this.loadChecklistList(x));
 if (this.empresasService.seleccionada) this.loadLimpiezas(this.empresasService.seleccionada.toString());

}
ngOnChanges(){
  console.log('select limpiezaZona changes',this.idSelected)
  if (this.idSelected >0){
    
    this.unExpand();
    
    
    this.Choicer.disabled = true;
    // console.log('select limpiezaZona changes',this.limpiezas)
    // let event = this.limpiezas.findIndex((limpieza)=>limpieza.id==this.idSelected);
    // console.log('select limpiezaZona changes',event)
    // this.seleccionarZona(event);
  }else{
    if (this.empresasService.seleccionada) this.loadLimpiezas(this.empresasService.seleccionada.toString());
  }
}

    loadLimpiezas(emp: Empresa | string) {
    let params = typeof(emp) == "string" ? emp : emp.id
    let parametros = '&idempresa=' + params+"&entidad=limpieza_zona&order=nombre";
        //let parametros = '&idempresa=' + seleccionada.id;
        // Llamada al servidor para conseguir las checklists
        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            // Ocultar mostrar control checklists
            this.limpiezaActiva = 0;
            // Vaciar la lista actual
            this.limpiezas = [];
            this.limpiezas.push(this.limpieza1);
            if (response.success == 'true' && response.data) {
              for (let element of response.data) {
                this.limpiezas.push(new LimpiezaZona(element.id,element.idempresa,element.nombre, element.descripcion));
              }
            }
          },
              (error) => {console.log(error)},
              ()=>{
              this.listaZonas.emit(this.limpiezas);
               //this.expand(this.Choicer.nativeElement);
               if (this.idSelected>0) {
                this.valorLimpieza = this.limpiezas.findIndex((limpieza)=>limpieza.id == this.idSelected);                 
                }else{
                  this.Choicer.disabled = false;
                  this.expand()
                }             
              }
        );
   }

seleccionarZona(event:any | number){
  console.log(event);
  this.myItem = typeof(event) == "number" ? event : event.value;
  
  this.zonaSeleccionada.emit(this.limpiezas[this.myItem]);
  this.limpiezaActiva = this.limpiezas[this.myItem].id;
  this.unExpand();
}

seleccionaSiguiente(){
  let indice = this.limpiezas.findIndex((maquina)=>maquina.id==this.limpiezaActiva);
  console.log(indice,this.limpiezaActiva);
  if (indice < this.limpiezas.length) {
    indice++;
    this.seleccionarZona(indice);
    this.Choicer.writeValue(indice);
  }
}
  seleccionaAnterior(){
    let indice = this.limpiezas.findIndex((maquina)=>maquina.id==this.limpiezaActiva);
    if (indice > 0) {
      indice--;
      this.seleccionarZona(indice);
      this.Choicer.writeValue(indice);
    }
}

// ngOnChanges(changes:SimpleChange) {}

nuevaZona(zona: LimpiezaZona){
zona.idempresa = this.empresasService.seleccionada;
zona.nombre = this.nuevoNombre;
zona.idempresa = this.empresasService.seleccionada;
let param = "&entidad=limpieza_zona";
    this.servidor.postObject(URLS.STD_ITEM, zona,param).subscribe(
      response => {
        if (response.success) {
          zona.id = response.id;
          this.limpiezas.push(zona);
          this.novaLimpieza = null;
        }
    });
}

modificar(){
  let zona = new LimpiezaZona(this.limpiezaActiva,this.empresasService.seleccionada,this.nuevoNombre,'');
let param = "&entidad=limpieza_zona";
let parametros = '?id=' + this.limpiezaActiva+param;     
    this.servidor.putObject(URLS.STD_ITEM,parametros, zona).subscribe(
      response => {
        if (response.success) {
          console.log("updated");
          let index = this.limpiezas.findIndex((elem) =>elem.id == this.limpiezaActiva);
          this.limpiezas[index].nombre = this.nuevoNombre;
          this.listaZonas.emit(this.limpiezas);
          this.modificaZona = false;
        }
    });
}



  cerrarModal(event: boolean) {
    this.modal.visible = false;
    if (event) {
      let parametros = '?id=' + this.limpiezaActiva+'&entidad=limpieza_zona';
      this.servidor.deleteObject(URLS.STD_ITEM, parametros).subscribe(
        response => {
          if (response.success) {
            let indice = this.limpiezas.findIndex((limpieza) => limpieza.id == this.limpiezaActiva);
           // let indice = this.mantenimientos.indexOf(controlBorrar);
            this.limpiezas.splice(indice, 1);
            this.limpiezaActiva = 0;
            this.zonaSeleccionada.emit(this.limpiezas[0]);
            this.expand();
          }
      });
    }
  }
eliminaZona(){
      this.modal.titulo = 'borrarControlT';
    this.modal.subtitulo = 'borrarControlST';
    this.modal.eliminar = true;
    this.modal.visible = true;
}

// modificarZona(){
// this.modificaZona = !this.modificaZona;
// }

modificarItem(){
  this.nuevoNombre = this.limpiezas[this.limpiezas.findIndex((limpieza)=>limpieza.id==this.limpiezaActiva)].nombre;
(this.novaLimpieza)? this.novaLimpieza = null :this.modificaZona = !this.modificaZona;
}

addItem(){
  this.nuevoNombre='';
  this.modificaZona=false;
  this.novaLimpieza = new LimpiezaZona(0,0,'');
}

importChecklists(valor){
  this.import = !this.import;
  if (valor  == 'cerrar'){
      this.loadLimpiezas(this.empresasService.seleccionada.toString());
      this.migrando.emit(false);
  }
  if (valor  == 'abrir'){
    if(this.limpiezaActiva > 0){
      let event = new Object({value:0})
      this.seleccionarZona(event);
    }
      this.migrando.emit(true);
      
  }  
}

expand(){
setTimeout(()=>{this.Choicer.open();},200)
}
unExpand(){
  this.Choicer.close();
}
}
