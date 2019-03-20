import { Component, OnInit, Output,EventEmitter,ViewChild,ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { Servidor } from '../../services/servidor.service';
import { EmpresasService } from '../../services/empresas.service';
import { PermisosService } from '../../services/permisos.service';
import { URLS } from '../../models/urls';
import { Empresa } from '../../models/empresa';
import {MatSelect} from '@angular/material';
import { p } from '@angular/core/src/render3';
 
@Component({
  selector: 'listado-empresas',
  templateUrl: './listado-empresas.component.html',
  styleUrls: ['./empresas.css']
})

export class ListadoEmpresasComponent implements OnInit {
  @ViewChild('choicer') Choicer: ElementRef;
  @Output() empresaseleccionada: EventEmitter<Empresa>=new EventEmitter<Empresa>();
  @Output() onLoadEmpresas: EventEmitter<Empresa[]>=new EventEmitter<Empresa[]>();
  subscription: Subscription;
  empresas: Empresa[] = [];
  empresasNoActivas:Empresa[] = [];
  //empresa: Empresa = new Empresa('Seleccionar empresa', '0',0);
  formdata: FormData = new FormData();

  constructor(public servidor: Servidor, public empresasService: EmpresasService, public permisos: PermisosService) {}

  ngOnInit() {
    // Subscripción a la creación de nuevas empresa
    this.subscription = this.empresasService.nuevaEmpresa.subscribe(
      (empresaCreada) => {
        this.empresas.push(empresaCreada);

        this.empresas = this.empresas.slice();
        console.log('empresa creada',this.empresas);
      }
    );
    // Conseguir la lista de empresas
    let param=''
    console.log('INIT EMPRESAS',this.empresasService.userTipo,this.empresasService.empresaActiva,this.empresasService.holding);
    if (this.empresasService.userTipo=='Admin'){

      if(this.empresasService.holding==1){
        param="&id="+this.empresasService.empresaActiva+"&holding="+this.empresasService.empresaActiva;
      }
      if(this.empresasService.holding==2){
        param="&id="+this.empresasService.idHolding+"&holding="+this.empresasService.idHolding
      }

    }
    console.log(param);
    this.servidor.getObjects(URLS.EMPRESAS, param).subscribe(
      response => {
        console.log(response)
        if (response.success) {
          //this.empresas.push(this.empresa);
          for (let element of response.data) {
            if (element.activa == 1){
            this.empresas.push(new Empresa(
              element.nombre,
              element.logo,
              element.id,
              element.holding,
              element.idHolding
            ))
          }else{
            this.empresasNoActivas.push(new Empresa(
              element.nombre,
              element.logo,
              element.id,
              element.holding,
              element.idHolding
            ))
          }
          }
        }
    },
    (error)=>console.log(error),
    ()=>{
      this.checkSelectedHolding();
      this.onLoadEmpresas.emit(this.empresas);
      this.expand();
    }
    
    );
  }
  checkSelectedHolding(){
    if (this.empresasService.holding===null && this.empresasService.seleccionada>0){
      let event= {'items':[{'id':this.empresasService.seleccionada}]};
      this.selecciona(event);
    }
    
    if (parseInt(sessionStorage.getItem('idEmpresa'))>0){
      let indice = this.empresas.findIndex((empresa)=>empresa.id==parseInt(sessionStorage.getItem('idEmpresa')));
      if (indice>-1){
        if(this.empresas[indice].nombre!=sessionStorage.getItem('nombreEmpresa')){
          this.empresasService.seleccionarEmpresa(this.empresas[indice]);
        }
      }
    }   
  }

  selecciona(evento: object){
    let empresa = evento["items"][0].id;
    let nombreHolding=null;
  //  this.empresasService.seleccionarEmpresa(this.empresas.find(emp => emp.id == idEmpresa));
  let emp = this.empresas.find(emp => emp.id == empresa);
  if (!emp) emp = this.empresasNoActivas.find(emp => emp.id == empresa);
  if (emp.holding==1) nombreHolding=emp.nombre;
  if (emp.holding==2)  {
    let indexHolding = this.empresas.findIndex(hold => hold.id == emp.idHolding);
    if(indexHolding>-1)
    nombreHolding= this.empresas[indexHolding].nombre;
  }
  this.empresasService.nombreHolding=nombreHolding;
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
