import { Component, OnInit, ViewEncapsulation } from '@angular/core';


import * as moment from 'moment/moment';

import { Servidor } from '../../../services/servidor.service';
import { URLS } from '../../../models/urls';
import { EmpresasService } from '../../../services/empresas.service';



@Component({
  selector: 'app-dashrealizados',
  templateUrl: './dashrealizados.component.html',
  styleUrls: ['./dashrealizados.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DashrealizadosComponent implements OnInit {
  public resultados:any[];
  public controles: number[];
  public checklists: number[];
  public limpiezas: number[];
  public mantenimientos: number[];
  public  data: any;
  public  msgs:any[];
  public  labels:string[];
  public fecha;
  public calculando: boolean=false;
  constructor(public servidor: Servidor,public empresasService: EmpresasService) { }

  ngOnInit() {
    this.loadResultados();
  }

  loadResultados(periodo?:number){
    if (!periodo) periodo = 7;
    let fecha=moment().subtract(periodo,'days').format('YYYY-MM-DD');
    this.fecha = moment().subtract(periodo,'days');
        let parametros = '&idempresa=' + this.empresasService.seleccionada+'&modo=realizados&fecha='+fecha;
            this.servidor.getObjects(URLS.DASHCONTROLES, parametros).subscribe(
              response => {

                if (response.success && response.data) {
                  this.resultados = [];
                  for (let element of response.data) {
                    this.resultados.push({
                        "fecha":moment(element.fecha).format('DD-MM-YYYY'),
                        "tipo":element.tipo,
                        "cantidad":element.total});
                      // switch(element.tipo){
                      //   case "control":
                      //   this.controles = element.total;
                      //   break;
                      //   case "checklist":
                      //   this.checklists = element.total;
                      //   break;
                      //   case "limpieza":
                      //   this.limpiezas = element.total;
                      //   break;                        
                      //   case "mantenimiento":
                      //   this.mantenimientos = element.total;
                      //   break;                                                
                      //}
                 }
                 this.fillData();
                }
            });
    }

    fillData(){
      let fechaAnterior='00-00-0000';
      let index = 0;
      this.labels=[];
      this.controles=[];
      this.checklists=[];
      this.limpiezas=[];
      this.mantenimientos=[];
      do {
        this.labels.push(moment(this.fecha).format('DD-MM-YYYY'));
        index =  this.resultados.findIndex((control)=>control.fecha == moment(this.fecha).format('DD-MM-YYYY') && control.tipo == 'control');
        if (index >= 0){
        this.controles.push(this.resultados[index].cantidad);
        }else{
          this.controles.push(0);
        }
        index =  this.resultados.findIndex((control)=>control.fecha == moment(this.fecha).format('DD-MM-YYYY') && control.tipo == 'checklist');
        if (index >= 0){
        this.checklists.push(this.resultados[index].cantidad);
        }else{
          this.checklists.push(0);
        }
        index =  this.resultados.findIndex((control)=>control.fecha == moment(this.fecha).format('DD-MM-YYYY') && control.tipo == 'limpieza');
        if (index >= 0){
        this.limpiezas.push(this.resultados[index].cantidad);
        }else{
          this.limpiezas.push(0);
        }
        index =  this.resultados.findIndex((control)=>control.fecha == moment(this.fecha).format('DD-MM-YYYY') && control.tipo == 'mantenimientos');
        if (index >= 0){
        this.mantenimientos.push(this.resultados[index].cantidad);
        }else{
          this.mantenimientos.push(0);
        }
        this.fecha = moment(this.fecha).add(1,'days');
      }
      while (moment(this.fecha)< moment().subtract(1,'days'));
      console.log ('controles',this.controles);
          // this.logs.forEach((log)=>{
          //     if (log.fecha != fechaAnterior){
          //         fechaAnterior =log.fecha;
          //         this.labels.push(log.fecha);
          //         this.logins.push(1);
          //         this.acciones.push(1);
          //         posicion++;
          //     }else{
          //         this.putData(posicion-1,log);
      
          //     }
          // });
          // console.log('Data',this.labels,this.logins);
          this.setData();
      }


    setData(){
      this.data = {
          //labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
          labels: this.labels,
          datasets: [
              {
                  label: 'controles',
                  data: this.controles,
                  fill: false,
                  borderColor: '#4bc0c0'
              }
              ,
              {
                  label: 'checklists',
                  data: this.checklists,
                  fill: false,
                  borderColor: '#565656'
              }
              ,
              {
                  label: 'limpiezas',
                  data: this.limpiezas,
                  fill: false,
                  borderColor: 'orange'
              }
              ,
              {
                  label: 'mantenimientos',
                  data: this.mantenimientos,
                  fill: false,
                  borderColor: 'darkblue'
              }
          ]
      }
      this.calculando = false;
  }
  }
