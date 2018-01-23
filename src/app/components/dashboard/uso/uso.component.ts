import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import * as moment from 'moment/moment';

import { Servidor } from '../../../services/servidor.service';
import { URLS } from '../../../models/urls';
import { EmpresasService } from '../../../services/empresas.service';


@Component({
  selector: 'app-uso',
  templateUrl: './uso.component.html',
  styleUrls: ['./uso.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class UsoComponent implements OnInit {
  data: any;
  msgs:any[];
  logs: any[];
  logins:number[];
  acciones:number[];
  labels:string[];
public calculando: boolean=false;
  constructor(public servidor: Servidor,public empresasService: EmpresasService) { }

  ngOnInit() {
this.loadLogs();
  }

fillData(){
let fechaAnterior='00-00-0000';
let posicion = 0;
this.labels=[];
this.logins=[];
this.acciones=[];
    this.logs.forEach((log)=>{
        if (log.fecha != fechaAnterior){
            fechaAnterior =log.fecha;
            this.labels.push(log.fecha);
            this.logins.push(1);
            this.acciones.push(1);
            posicion++;
        }else{
            this.putData(posicion-1,log);

        }
    });
    console.log('Data',this.labels,this.logins);
    this.setData();
}

putData(posicion,log){
    switch (log.tabla){
    case "login":
    this.logins[posicion]++;
    break;
    default:
    this.acciones[posicion]++;
    break;
    //case "Resultados_Control":

    }  
}


loadLogs(periodo?:number){
    this.calculando = true;
    if (!periodo) periodo = 7;
    let fecha_fin=moment().format('YYYY-MM-DD');
    let fecha_inicio=moment().subtract(periodo,'days').format('YYYY-MM-DD');
    let fecha_field="fecha";
    let filter= "&filterdates=true"+"&fecha_inicio="+fecha_inicio+"&fecha_fin="+fecha_fin+"&fecha_field="+fecha_field;
    let order = "&order=id DESC";
        let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=logs"+filter+order;
            this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
              response => {
                this.logs = [];
                if (response.success && response.data) {
                  for (let element of response.data) {  
                      this.logs.push({
                    "fecha":moment(element.fecha).format('DD-MM-YYYY'),
                      "idusuario":element.idusuario,
                      "tabla":element.tabla,
                      "accion":element.accion,
                      "plataforma":element.plataforma});
                 }
                 this.fillData();
                 console.log('Logs',this.logs);
                }
            });
    }


  selectData(event) {
    this.msgs = [];
    this.msgs.push({severity: 'info', summary: 'Data Selected', 'detail': this.data.datasets[event.element._datasetIndex].data[event.element._index]});
}
setData(){
    this.data = {
        //labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        labels: this.labels,
        datasets: [
            {
                label: 'logins',
                data: this.logins,
                fill: false,
                borderColor: '#4bc0c0'
            }
            ,
            {
                label: 'acciones',
                data: this.acciones,
                fill: false,
                borderColor: '#565656'
            }
        ]
    }
    this.calculando = false;
}
}


