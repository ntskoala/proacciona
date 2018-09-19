import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute, ParamMap  } from '@angular/router';


import { EmpresasService } from '../services/empresas.service';

@Component({
  selector: 'gestion-informes',
  templateUrl: '../assets/html/gestion-informes.component.html'
})
export class GestionInformesComponent implements OnInit{

  tabs = [true, null, null, null]
  tabActivo: number = 0;

  constructor(public empresasService: EmpresasService,private route: ActivatedRoute) {}

  ngOnInit() {
    console.log(this.route.params["_value"]["modulo"],this.route.params["_value"]["id"])


        // if (this.route.params["_value"]["modulo"] == "Controles"){
        //     this.cambiarTab(0);
        // }else{
        //   this.cambiarTab(1);
        // }
        switch(this.route.params["_value"]["modulo"]){
          case "Controles":
          this.cambiarTab(0);
          break;
          case "Checklists":
          this.cambiarTab(1);
          break;
          default:
          this.cambiarTab(0);
          break;

        }
  }

  cambiarTab(tab: number) {
    this.tabActivo = tab;
    // Quitar true al tab anterior
    this.tabs[this.tabs.indexOf(true)] = null;
    // Poner true en el nuevo tab
    this.tabs[tab] = true;
  }

}
