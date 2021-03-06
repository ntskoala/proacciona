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
    if(this.empresasService.menu=='empresas'){
    this.empresasService.empresaSeleccionada.subscribe(
      (emp)=>{
        console.log(emp);
        if(emp && this.empresasService.menu=='empresas'){
          
          this.loadAlertas();
          
        }
      })
    }
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
                          if (this.getPeriodicidad(element.periodicidad2) != "por uso")
                        this.controles.push({"nombre":element.nombre,"fecha": moment(element.fecha).format('DD-MM-YYYY'),"isbeforedate":isbeforedate,"tipo":element.tipo,"periodicidad":this.getPeriodicidad(element.periodicidad2)});
                        break;
                        case "checklist":
                            if (this.getPeriodicidad(element.periodicidad2) != "por uso")
                        this.checklists.push({"nombre":element.nombre,"fecha": moment(element.fecha).format('DD-MM-YYYY'),"isbeforedate":isbeforedate,"tipo":element.tipo,"periodicidad":this.getPeriodicidad(element.periodicidad2)});
                        break;
                        case "limpieza":
                            if (this.getPeriodicidad(element.periodicidad) != "por uso")
                        this.limpiezas.push({"nombre":element.nombre + ' ' + element.zona,"fecha": moment(element.fecha).format('DD-MM-YYYY'),"isbeforedate":isbeforedate,"tipo":element.tipo,"periodicidad":this.getPeriodicidad(element.periodicidad)});
                        break;                        
                        case "mantenimiento":
                            if (this.getPeriodicidad(element.periodicidad) != "por uso")
                        this.mantenimientos.push({"nombre":element.nombre + ' ' + element.maquina,"fecha": moment(element.fecha).format('DD-MM-YYYY'),"isbeforedate":isbeforedate,"tipo":element.tipo,"periodicidad":this.getPeriodicidad(element.periodicidad)});
                        break; 
                        case "calibracion":
                            if (this.getPeriodicidad(element.periodicidad) != "por uso")
                        this.mantenimientos.push({"nombre":element.nombre + ' ' + element.maquina,"fecha": moment(element.fecha).format('DD-MM-YYYY'),"isbeforedate":isbeforedate,"tipo":element.tipo,"periodicidad":this.getPeriodicidad(element.periodicidad)});
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
      console.log(data)
      this.items=data;
      window.scrollTo(0, 0);
    }
    close(){
      this.items=[]
    }

getPeriodicidad(periodicidad){
  let repeticion='';
if (periodicidad){
  try{
    repeticion= JSON.parse(periodicidad).repeticion
  }
  catch(e){
    console.log('error',e)
  }
}
return repeticion;
}

}
