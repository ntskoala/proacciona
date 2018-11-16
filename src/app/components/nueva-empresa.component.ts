import { Component } from '@angular/core';

import { Servidor } from '../services/servidor.service';
import { EmpresasService } from '../services/empresas.service';
import { URLS } from '../models/urls';
import { Empresa } from '../models/empresa';

@Component({
  selector: 'nueva-empresa',
  templateUrl: '../assets/html/nueva-empresa.component.html'
})

export class NuevaEmpresaComponent {

  constructor(public servidor: Servidor, public empresasService: EmpresasService) {
    this.empresaActiva = new Empresa(this.empresasService.nombreEmpresa,this.empresasService.hayLogoEmpresa.toString(),this.empresasService.seleccionada);
    this.empresasService.empresaSeleccionada.subscribe((empresa)=>{
      this.empresaActiva = empresa
    })
  }
  
  public empresa: Empresa = {nombre: '', logo: ''};
  public empresaActiva: Empresa;

  nuevaEmpresa(empresa: Empresa) {
    this.servidor.postObject(URLS.EMPRESAS, empresa).subscribe(
      response => {
        // si tiene éxito
        if (response.success) {
          empresa.id = response.id;
          empresa.logo = '0';
          this.empresasService.empresaCreada(empresa);
          // limpiar form
          this.empresa = {nombre: '', logo: ''};
        }
        // usuario erróneo
        else {
          alert('Empresa no creada');
        }
    });
  }

  updateActiva(empresa: Empresa){
    let parametros = '?idempresa=' + this.empresaActiva.id +"&entidad=empresas&id="+this.empresaActiva.id;
    this.servidor.putObject(URLS.STD_ITEM,parametros,empresa, ).subscribe(
      response => {
        console.log(response);
    },
    error => {console.log(error)});
  }
}
