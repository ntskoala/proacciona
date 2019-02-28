import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { Servidor } from '../../services/servidor.service';
import { EmpresasService } from '../../services/empresas.service';
import { URLS } from '../../models/urls';
import { Empresa } from '../../models/empresa';

@Component({
  selector: 'nueva-empresa',
  templateUrl: './nueva-empresa.component.html',
  styleUrls: ['./empresas.css']
})

export class NuevaEmpresaComponent implements OnInit, OnChanges{
  @Input() empresas: Empresa[];
  public holdings: object[];
  // public empresa: Empresa = {nombre: '', logo: ''};
  public empresa: Empresa = new Empresa('','',null,0,null);
  public empresaActiva: Empresa;
  public userTipo:string;

public typesCompany:object[]=[{label:'StandAlone',value:0},{label:'MasterHolding',value:1},{label:'PartofHolding',value:2}];
  constructor(
    public servidor: Servidor, 
    public empresasService: EmpresasService,
    public translate: TranslateService) {
    if (this.empresasService.seleccionada>0){
    this.empresaActiva = new Empresa(this.empresasService.nombreEmpresa,this.empresasService.hayLogoEmpresa.toString(),this.empresasService.seleccionada,this.empresasService.holding,this.empresasService.idHolding);
    }else{
      this.empresaActiva = new Empresa('','',null,0,null);
    }
    this.empresasService.empresaSeleccionada.subscribe((empresa)=>{
      this.empresaActiva = empresa
    })
  }
  ngOnInit(){
    this.userTipo= sessionStorage.getItem('userTipo');
    console.log(this.empresaActiva);
    this.translate.get(this.typesCompany.map((tipo)=>{return tipo["label"]})).subscribe(
      (resultado)=>{
        console.log(resultado);
        this.typesCompany=[{label:resultado.StandAlone,value:0},{label:resultado.MasterHolding,value:1},{label:resultado.PartofHolding,value:2}];
      })
      this.constructorNovaEmpresa();
  }

constructorNovaEmpresa(){
  this.empresa.nombre='';
  this.empresa.logo='';
  this.empresa.id=null;
  if(this.userTipo=='Admin'){
    this.empresa.holding=2;
    this.empresa.idHolding=parseInt(sessionStorage.getItem('idHolding'));
    console.log('nuevaEmpresa:Admin',this.empresa)
  }
}

ngOnChanges(){
  this.empresas=this.empresas.filter((empresa)=>empresa.holding==1);
  this.holdings = this.empresas.map((company)=>{return {label:company.nombre,value:company.id}})
  console.log(this.empresas,this.holdings)
}

  nuevaEmpresa(empresa: Empresa) {
    console.log(empresa);
    if(this.userTipo=='Admin'){
    empresa.holding=this.empresa.holding;
    empresa.idHolding=this.empresa.idHolding;
    }
    this.servidor.postObject(URLS.EMPRESAS, empresa).subscribe(
      response => {
        // si tiene éxito
        if (response.success) {
          empresa.id = response.id;
          empresa.logo = '0';
          console.log(empresa);
          this.empresasService.empresaCreada(empresa);
          // limpiar form
            this.constructorNovaEmpresa();

        }
        // usuario erróneo
        else {
          alert('Empresa no creada');
        }
    });
  }

  updateActiva(empresa: Empresa){
    let parametros = '?idempresa=' + this.empresaActiva.id +"&entidad=empresas&id="+this.empresaActiva.id;
    empresa.idHolding=this.empresaActiva.idHolding;
    this.servidor.putObject(URLS.STD_ITEM,parametros,empresa, ).subscribe(
      response => {
        console.log(response);
    },
    error => {console.log(error)});
  }


}
