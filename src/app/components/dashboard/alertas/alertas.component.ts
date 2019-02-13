import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import * as moment from 'moment/moment';

import { Servidor } from '../../../services/servidor.service';
import { URLS } from '../../../models/urls';
import { EmpresasService } from '../../../services/empresas.service';


@Component({
  selector: 'app-alertasControles',
  templateUrl: './alertas.component.html',
  styleUrls: ['./alertas.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AlertasControlesComponent implements OnInit {
public alertas:any[];
public controles = [];
public checklists = [];
public limpiezas = [];
public mantenimientos = [];
public items =[];
public panels: boolean[] = [false,false,false,false];
public altura:string='';
  constructor(public servidor: Servidor,public empresasService: EmpresasService) { }

  ngOnInit() {
    this.loadAlertas();
    this.empresasService.empresaSeleccionada.subscribe(
      (emp)=>{
        console.log(emp);
        if(emp){
          this.loadAlertas();
        }
      })
  }

  loadAlertas(periodo?:string){
        let parametros = '&idempresa=' + this.empresasService.seleccionada;
            this.servidor.getObjects(URLS.DASHCONTROLES, parametros).subscribe(
              response => {
                this.alertas = [];
                this.controles = [];
                this.checklists = [];
                this.limpiezas = [];
                this.mantenimientos = [];
                if (response.success && response.data) {
                  for (let element of response.data) {
                    let isbeforedate = moment(element.fecha).isBefore(new Date(),'day');
                      this.alertas.push({
                      "nombre":element.nombre,
                      "fecha": moment(element.fecha).format('DD-MM-YYYY'),
                      "tipo":element.tipo});
                      switch(element.tipo){
                        case "control":
                        this.controles.push({"nombre":element.nombre,"fecha": moment(element.fecha).format('DD-MM-YYYY'),"isbeforedate":isbeforedate,"tipo":element.tipo});
                        break;
                        case "checklist":
                        this.checklists.push({"nombre":element.nombre,"fecha": moment(element.fecha).format('DD-MM-YYYY'),"isbeforedate":isbeforedate,"tipo":element.tipo});
                        break;
                        case "limpieza":
                        this.limpiezas.push({"nombre":element.nombre + ' ' + element.zona,"fecha": moment(element.fecha).format('DD-MM-YYYY'),"isbeforedate":isbeforedate,"tipo":element.tipo});
                        break;                        
                        case "mantenimiento":
                        this.mantenimientos.push({"nombre":element.nombre + ' ' + element.maquina,"fecha": moment(element.fecha).format('DD-MM-YYYY'),"isbeforedate":isbeforedate,"tipo":element.tipo});
                        break; 
                        case "calibracion":
                        this.mantenimientos.push({"nombre":element.nombre + ' ' + element.maquina,"fecha": moment(element.fecha).format('DD-MM-YYYY'),"isbeforedate":isbeforedate,"tipo":element.tipo});
                        break;                                                
                      }
                 }
                 console.log('Logs',this.alertas);
                }
            });
    }


    closePanel(panel){
      this.panels[panel]=false;
      console.log(this.panels.find((item)=>item==true))
      if (this.panels.find((item)=>item==true)){
        this.altura = "100%"
      }else{
      this.altura = ""
      }
    }
    
    openPanel(panel){
      this.panels[panel]=true;
      this.altura = "100%";
    }

    open(data){
      this.items=data;
    }
    close(){
      this.items=[]
    }
}
