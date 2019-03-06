import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { Router,ActivatedRoute, ParamMap  } from '@angular/router';
import { Servidor } from '../services/servidor.service';

import { EmpresasService } from '../services/empresas.service';

@Component({
  selector: 'gestion-informes',
  templateUrl: '../assets/html/gestion-informes.component.html',
  styleUrls: ['../assets/html/gestion-informes.component.css']
})
export class GestionInformesComponent implements OnInit, OnChanges{
@Input() selectedMenu:string;
  tabs = [true, null, null, null]
  tabActivo: number = null;

  constructor(
    public empresasService: EmpresasService,
    public servidor: Servidor, 
    private route: ActivatedRoute) {}

  ngOnInit() {
    console.log(this.route.params["_value"]["modulo"],this.route.params["_value"]["id"])
  }

ngOnChanges(){
  this.tabActivo=null;
  console.log('*******GESTION INFORMES***********')
  console.log('*******GESTION INFORMES***********',this.selectedMenu,this.tabActivo);
  if (this.selectedMenu=='informes'){
  switch(this.route.params["_value"]["modulo"]){
    case "Controles":
    this.cambiarTab(0);
    break;
    case "Checklists":
    this.cambiarTab(1);
    break;
    default:
    this.cambiarTab(2);
    break;
  }
}
console.log('*******GESTION INFORMES***********',this.selectedMenu,this.tabActivo);
}

  cambiarTab(tab: number) {
    this.tabActivo = tab;
    // Quitar true al tab anterior
    this.tabs[this.tabs.indexOf(true)] = null;
    // Poner true en el nuevo tab
    this.tabs[tab] = true;
  }

  // enviar(){
  //   let url ='https://script.google.com/a/proacciona.es/macros/s/AKfycbzumyP_ybsAfEC_I0xww2Pz5XPOJim-51zCoEnFBhjl/dev?idempresa='+this.empresasService.seleccionada;
  //   this.servidor.getSimple(url,'').subscribe(
  //     (respuesta)=>{console.log(respuesta)},
  //     (error)=>{console.log(error)},
  //     ()=>{
  //       console.log('Fin');
  //     }
  //   );
  // }
}
