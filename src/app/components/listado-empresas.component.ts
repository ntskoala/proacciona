import { Component, OnInit, Output,EventEmitter,ViewChild,ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { Servidor } from '../services/servidor.service';
import { EmpresasService } from '../services/empresas.service';
import { PermisosService } from '../services/permisos.service';
import { URLS } from '../models/urls';
import { Empresa } from '../models/empresa';
import {MatSelect} from '@angular/material';
 
@Component({
  selector: 'listado-empresas',
  templateUrl: '../assets/html/listado-empresas.component.html'
})

export class ListadoEmpresasComponent implements OnInit {
  @ViewChild('choicer') Choicer: ElementRef;
  @Output() empresaseleccionada: EventEmitter<Empresa>=new EventEmitter<Empresa>();
  subscription: Subscription;
  empresas: Empresa[] = [];
  empresasNoActivas:Empresa[] = [];
  //empresa: Empresa = new Empresa('Seleccionar empresa', '0',0);
  formdata: FormData = new FormData();

  constructor(public servidor: Servidor, public empresasService: EmpresasService, public permisos: PermisosService) {}

  ngOnInit() {
    // Subscripción a la creación de nuevas empresa
    this.subscription = this.empresasService.nuevaEmpresa.subscribe(
      //empresa => this.empresas.push(empresa)
    );
    // Conseguir la lista de empresas
    this.servidor.getObjects(URLS.EMPRESAS, '').subscribe(
      response => {
        console.log(response)
        if (response.success) {
          //this.empresas.push(this.empresa);
          for (let element of response.data) {
            if (element.activa == 1){
            this.empresas.push(new Empresa(
              element.nombre,
              element.logo,
              element.id
            ))
          }else{
            this.empresasNoActivas.push(new Empresa(
              element.nombre,
              element.logo,
              element.id
            ))
          }
          }
        }
    },
    (error)=>console.log(error),
    ()=>{
      this.expand();
    }
    
    );
  }

  selecciona(evento: object){
    let empresa = evento["items"][0].id;
  //  this.empresasService.seleccionarEmpresa(this.empresas.find(emp => emp.id == idEmpresa));
  let emp = this.empresas.find(emp => emp.id == empresa);
  if (!emp) emp = this.empresasNoActivas.find(emp => emp.id == empresa);
  this.empresaseleccionada.emit(emp);
  this.setPermisos(empresa);
  this.unExpand();
}



setActiva(evento:object){
  console.log('Activando',evento["items"][0].id);
  let idEmpresa;
  let activa = 1;
  for (let x=0;x<evento["items"].length;x++){
    idEmpresa = evento["items"][x].id;
    this.updateActiva(idEmpresa,activa)      
  }
}

setNoActiva(evento:object){
  console.log('Desactivando',evento);
  let idEmpresa;
  let activa = 0;
    for (let x=0;x<evento["items"].length;x++){
      idEmpresa = evento["items"][x].id;
      this.updateActiva(idEmpresa,activa)      
    }
}

updateActiva(idEmpresa: number, activa:number){
  let parametros = '?idempresa=' + idEmpresa +"&entidad=empresas&id="+idEmpresa;
  let empresa = {"activa":activa};
  this.servidor.putObject(URLS.STD_ITEM,parametros,empresa, ).subscribe(
    response => {
      console.log(response);
  },
  error => {console.log(error)});
}

setPermisos(idempresa){
 console.log(idempresa);
        let parametros = '&idempresa=' + idempresa; 
        this.servidor.getObjects(URLS.OPCIONES_EMPRESA, parametros).subscribe(
          response => {
            
            if (response.success && response.data) {
              this.permisos.resetPermisos();
              for (let element of response.data) {
                  this.permisos.setOpciones(true,element.idopcion,'list-empresas');
                //this.guardar[element.id] = false;
              }
              
              this.permisos.modulosFuente.next('listado-empresas');
            }
        },
        error => {console.log(error)});
}

expand(){
//setTimeout(()=>{this.Choicer.open();},200)
//this.Choicer.nativeElement.size=15;
}
unExpand(){
  //this.Choicer.nativeElement.size=1;
}

}
