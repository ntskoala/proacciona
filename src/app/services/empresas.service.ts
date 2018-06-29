import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';


import { Empresa } from '../models/empresa';

@Injectable()
export class EmpresasService {
  // variables
  idioma: string = 'cat';
  seleccionada: number = 0;
  administrador: boolean = false;
  userId: number =0;
  userName: string="";
  userTipo: string="";
  empresaActiva: number =0;
  exportar: boolean;
  showTooltips: boolean = true;
  showAlerts:boolean = true;
  login:boolean=false;
  nombreEmpresa:string='';
  //fichas_maquinaria: boolean;
//  empresa: Empresa;

  // fuente del observable
  public empresaSeleccionadaFuente = new Subject<Empresa>();
  private nuevaEmpresaFuente = new Subject<Empresa>();
  public opcionesFuente = new Subject<boolean>();
  
  // streaming del observable
  empresaSeleccionada = this.empresaSeleccionadaFuente.asObservable();
  nuevaEmpresa = this.nuevaEmpresaFuente.asObservable();
  //exportar_informes = this.exportar_informesFuente.asObservable();

  seleccionarEmpresa(empresa: Empresa) {
      console.log("####EMPRESA SELECCIONADA:",empresa);
      this.seleccionada = empresa.id;
      this.nombreEmpresa = empresa.nombre;
//      this.empresa = empresa;
      this.empresaSeleccionadaFuente.next(empresa);
      this.empresaActiva = empresa.id;
  }

  empresaCreada(empresa: Empresa) {
      this.nuevaEmpresaFuente.next(empresa);
  }

setOpciones(valor: boolean){
  this.opcionesFuente.next(valor);
  this.exportar = valor;
}
check_Opcion() {
     //   return this.exportar_informes.asObservable();     
    }
}
