import { Component, OnInit,OnChanges, ViewEncapsulation } from '@angular/core';
import { Router ,ActivatedRoute, ParamMap  } from '@angular/router';


import * as moment from 'moment/moment';

import { Servidor } from '../../../services/servidor.service';
import { URLS } from '../../../models/urls';
import { EmpresasService } from '../../../services/empresas.service';
import { Control } from '../../../models/control';
import { ResultadoControl } from '../../../models/resultadocontrol';


@Component({
  selector: 'app-dashrealizados',
  templateUrl: './dashrealizados.component.html',
  styleUrls: ['./dashrealizados.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DashrealizadosComponent implements OnInit, OnChanges {
  public resultados:any[];
  public controles: Control[];
  public resultadoscontrol: ResultadoControl[] = [];
  // public checklists: number[];
  // public limpiezas: number[];
  // public mantenimientos: number[];
  public  data: any;
  public  msgs:any[];
  public  labels:string[];
  public fecha:any={'inicio':null,'fin':null};
  public calculando: boolean=false;
  public columnas: object[] = [];
  public columnOptions: any[];
  public tabla: Object[] = [];
  public tabla2: Object[] = [];
  public days:number;
  public verGrafico:boolean=false;
  constructor(public servidor: Servidor,public empresasService: EmpresasService,
    public router: Router,
    public route: ActivatedRoute) { }

  ngOnInit() {
    this.loadControles('1');
    if(this.empresasService.menu=='empresas'){
    this.empresasService.empresaSeleccionada.subscribe(
      (emp)=>{
        console.log(emp,this.empresasService.menu);
        if(emp && this.empresasService.menu=='empresas'){
          this.loadControles('2');
        }
      })
    }
  }

ngOnChanges(){
}

  loadControles(origen) {
    console.log(origen,this.empresasService.menu);
    let parametros = '&idempresa=' + this.empresasService.seleccionada; 
    this.servidor.getObjects(URLS.CONTROLES, parametros).subscribe(
      response => {
        this.controles = [];
        this.columnas = [];
        this.tabla = [];
        if (response.success && response.data) {
          for (let element of response.data) {
              let fecha;
              if (moment.isDate(new Date(element.fecha_)) && element.fecha_ != "0000-00-00"){
                fecha = new Date(element.fecha_)
              }else{
                fecha = null;
              }
            this.controles.push(new Control(element.id, element.nombre, element.pla, element.valorminimo,
              element.valormaximo, element.objetivo, element.tolerancia, element.critico, element.periodicidad,
              element.tipoperiodo, element.idempresa,element.periodicidad2,fecha,element.orden
            ));
            // this.columnas.push({field:element.nombre,header:element.nombre});
            this.columnas.push(element.nombre);
          }
        }
    },
    (error)=> console.log(error),
    ()=>{
      this.days =7;
      this.loadResultados(7);
    });
  }

  setColOptions(){
   let colores=['red','blue','orange','black','aqua','blueviolet','burlywood','cadetblue','chartreuse','cornsilk','darkcyan','gold','lightgrey','olivedrab','pink','royalblue','tan']
   this.labels = [];
   for(let i = this.days; i > 0; i--) {
   this.labels.push(moment().subtract(i,'d').format('YYYY-MM-DD'));
   }
       //this.cols =this.columnas;
        this.columnOptions = [];
        for(let i = 0; i < this.columnas.length; i++) {
          let data = this.tabla.filter((item)=>{return item["nombre"]==this.columnas[i]});
           // this.columnOptions.push({label: this.columnas[i]['header'], value: this.columnas[i]});
           this.columnOptions.push({
            label: this.columnas[i],
            data: this.setOptionData(data),
            fill: false,
            borderColor: colores[i]
        });
        }
        console.log(this.columnOptions);
        this.setData();
} 

setOptionData(data){
  
  let resultado;
  resultado= [];
  this.labels.forEach((fecha)=>{
    let indice = data.findIndex((elem)=>elem.fecha==fecha)
    if (indice>-1){
      resultado.push(data[indice].valor)
    }else{
      resultado.push(0)
    }
    
  })
  
  return resultado;
}
loadResultados(days:number){
  console.log(days,this.empresasService.menu);
  this.days=days;
  this.calculando = true;
  this.fecha['inicio']= new Date(moment().subtract(days,'d').format('YYYY-MM-DD')); //moment().subtract(7,'d').date();
  this.fecha['fin']= new Date();//moment().date();
  this.filtrarFechas(this.fecha)
}
filtrarFechas(fecha) {
  // console.log (fecha.inicio.formatted,fecha.fin.formatted);
   console.log (moment(fecha.inicio).format('YYYY-MM-DD'),moment(fecha.fin).format('YYYY-MM-DD'));
   let parametros = '&idempresa=' + this.empresasService.seleccionada +
   //  '&fechainicio=' + fecha.inicio.formatted + '&fechafin=' + fecha.fin.formatted;
     '&fechainicio=' + moment(fecha.inicio).format('YYYY-MM-DD') + '&fechafin=' + moment(fecha.fin).format('YYYY-MM-DD');
   this.servidor.getObjects(URLS.RESULTADOS_CONTROL, parametros).subscribe(
     response => {
       this.resultadoscontrol = [];
       this.tabla = [];
       if (response.success && response.data) {
         for (let element of response.data) {
           let fecha = new Date(element.fecha);

             this.resultadoscontrol.push(new ResultadoControl(element.idr, element.idcontrol,element.usuario,
               parseFloat(element.resultado), moment(element.fecha).toDate(), element.foto));
         }
       }
       for (let element of this.resultadoscontrol) {
         for (let control of this.controles) {
           if (control.id == element.idcontrol) {
             let resultado = new Object;
             resultado['id'] = element.idr;
             resultado['usuario'] = element.usuario;
             //resultado['fecha'] = this.formatFecha(element.fecha);
             resultado['fecha'] = moment(element.fecha).format('YYYY-MM-DD');
             resultado['nombre']= control.nombre;
             resultado['valor']= element.resultado;
             resultado[control.nombre] = element.resultado;
             if (element.foto == 'true') {
               resultado['foto'] = true;
             }

             this.tabla.push(resultado);
           }
         }
         
       }
   },
   (error)=>console.log(error),
   ()=>{
     this.tabla2 = this.tabla
     this.setColOptions();
    }
   );
 }



 setData(){
      this.data = {
          //labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
          //labels: this.labels,
          labels: this.labels,
          datasets: this.columnOptions
      }
      this.calculando = false;
      console.log(this.data)
  }

  selectData(event) {
    this.msgs = [];
    this.msgs.push({severity: 'info', summary: 'Data Selected', 'detail': this.data.datasets[event.element._datasetIndex].data[event.element._index]});
    // console.log(this.tabla,event.element._datasetIndex,event.element._index,this.labels[event.element._index])
    console.log(this.columnas[event.element._datasetIndex],this.labels[event.element._index])
   let idOrigen = (this.tabla[this.tabla.findIndex((item)=>item["nombre"] == this.columnas[event.element._datasetIndex] && item["fecha"] == this.labels[event.element._index])])["id"];

   let url = 'empresas/'+ this.empresasService.seleccionada + '/Controles/0/'+idOrigen
   this.router.navigate([url]);
}

  // loadResultados(periodo?:number){
  //   if (!periodo) periodo = 7;
  //   let fecha=moment().subtract(periodo,'days').format('YYYY-MM-DD');
  //   this.fecha = moment().subtract(periodo,'days');
  //       let parametros = '&idempresa=' + this.empresasService.seleccionada+'&modo=realizados&fecha='+fecha;
  //           this.servidor.getObjects(URLS.DASHCONTROLES, parametros).subscribe(
  //             response => {

  //               if (response.success && response.data) {
  //                 this.resultados = [];
  //                 for (let element of response.data) {
  //                   this.resultados.push({
  //                       "fecha":moment(element.fecha).format('DD-MM-YYYY'),
  //                       "tipo":element.tipo,
  //                       "cantidad":element.total});

  //                }
  //                this.fillData();
  //               }
  //           });
  //   }

  //   fillData(){
  //     let fechaAnterior='00-00-0000';
  //     let index = 0;
  //     this.labels=[];
  //     this.controles=[];
  //     this.checklists=[];
  //     this.limpiezas=[];
  //     this.mantenimientos=[];
  //     do {
  //       this.labels.push(moment(this.fecha).format('DD-MM-YYYY'));
  //       index =  this.resultados.findIndex((control)=>control.fecha == moment(this.fecha).format('DD-MM-YYYY') && control.tipo == 'control');
  //       if (index >= 0){
  //       this.controles.push(this.resultados[index].cantidad);
  //       }else{
  //         this.controles.push(0);
  //       }
  //       index =  this.resultados.findIndex((control)=>control.fecha == moment(this.fecha).format('DD-MM-YYYY') && control.tipo == 'checklist');
  //       if (index >= 0){
  //       this.checklists.push(this.resultados[index].cantidad);
  //       }else{
  //         this.checklists.push(0);
  //       }
  //       index =  this.resultados.findIndex((control)=>control.fecha == moment(this.fecha).format('DD-MM-YYYY') && control.tipo == 'limpieza');
  //       if (index >= 0){
  //       this.limpiezas.push(this.resultados[index].cantidad);
  //       }else{
  //         this.limpiezas.push(0);
  //       }
  //       index =  this.resultados.findIndex((control)=>control.fecha == moment(this.fecha).format('DD-MM-YYYY') && control.tipo == 'mantenimientos');
  //       if (index >= 0){
  //       this.mantenimientos.push(this.resultados[index].cantidad);
  //       }else{
  //         this.mantenimientos.push(0);
  //       }
  //       this.fecha = moment(this.fecha).add(1,'days');
  //     }
  //     while (moment(this.fecha)< moment().subtract(1,'days'));
  //     console.log ('controles',this.controles);

  //         this.setData();
  //     }
  //   setData(){
  //     this.data = {
  //         //labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  //         labels: this.labels,
  //         datasets: [
  //             {
  //                 label: 'controles',
  //                 data: this.controles,
  //                 fill: false,
  //                 borderColor: '#4bc0c0'
  //             }
  //             ,
  //             {
  //                 label: 'checklists',
  //                 data: this.checklists,
  //                 fill: false,
  //                 borderColor: '#565656'
  //             }
  //             ,
  //             {
  //                 label: 'limpiezas',
  //                 data: this.limpiezas,
  //                 fill: false,
  //                 borderColor: 'orange'
  //             }
  //             ,
  //             {
  //                 label: 'mantenimientos',
  //                 data: this.mantenimientos,
  //                 fill: false,
  //                 borderColor: 'darkblue'
  //             }
  //         ]
  //     }
  //     this.calculando = false;
  // }

  open(){
    console.log('ver Gráfico')
    this.verGrafico=true;
  }
  close(){
    this.verGrafico=false;
  }
  }
