import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';


import { Empresa } from '../models/empresa';
import * as moment from 'moment';

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
  hayLogoEmpresa:number;
  nombreEmpresa:string='';
  holding:number=null;
  idHolding:number=null;
  currentStartDate:string=moment().startOf('year').subtract(1,"y").format("YYYY-MM-DD");
  //fichas_maquinaria: boolean;
//  empresa: Empresa;

  // fuente del observable
  public alergenos= new Subject<any>();

  public empresaSeleccionadaFuente = new Subject<Empresa>();
  private nuevaEmpresaFuente = new Subject<Empresa>();
  public opcionesFuente = new Subject<boolean>();
  public menu:string=null;
  public nombreHolding = null;
  // streaming del observable
  empresaSeleccionada = this.empresaSeleccionadaFuente.asObservable();
  nuevaEmpresa = this.nuevaEmpresaFuente.asObservable();
  //exportar_informes = this.exportar_informesFuente.asObservable();

  seleccionarEmpresa(empresa: Empresa) {
      console.log("####EMPRESA SELECCIONADA:",empresa);
      this.seleccionada = empresa.id;
      this.nombreEmpresa = empresa.nombre;
      this.holding= empresa.holding;
      this.idHolding= null;
      if (empresa.holding==1)this.idHolding= empresa.id;
      if (empresa.holding==2)this.idHolding= empresa.idHolding;
      sessionStorage.setItem('idEmpresa',empresa.id.toString());
      sessionStorage.setItem('nombreEmpresa',empresa.nombre);
//      this.empresa = empresa;
      this.empresaSeleccionadaFuente.next(empresa);
      this.empresaActiva = empresa.id;
      this.hayLogoEmpresa = parseInt(empresa.logo);
  }

  empresaCreada(empresaNova: Empresa) {
      this.nuevaEmpresaFuente.next(empresaNova);
  }

setOpciones(valor: boolean){
  this.opcionesFuente.next(valor);
  this.exportar = valor;
}
check_Opcion() {
     //   return this.exportar_informes.asObservable();     
}

setAlergenos(alergenos){
  console.log('SETTING ALERGENOS',alergenos);
  this.alergenos.next(alergenos);
}

}
