import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import * as moment from 'moment/moment';

import { Servidor } from '../../../services/servidor.service';
import { URLS } from '../../../models/urls';
import { EmpresasService } from '../../../services/empresas.service';
import { Usuario } from '../../../models/usuario';


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
  usuarios: Usuario[] = [];
  public panels: boolean[] = [];
  public altura:string;
public calculando: boolean=false;
public dias:number;
  constructor(public servidor: Servidor,public empresasService: EmpresasService) { }

  ngOnInit() {
      this.loadUsers();
  }

// fillData(){
// let fechaAnterior='00-00-0000';
// let posicion = 0;
// this.labels=[];
// this.logins=[];
// this.acciones=[];


//     this.logs.forEach((log)=>{
//         if (log.fecha != fechaAnterior){
//             fechaAnterior =log.fecha;
//             this.labels.push(log.fecha);
//             this.logins.push(1);
//             this.acciones.push(1);
//             posicion++;
//         }else{
//             this.putData(posicion-1,log);

//         }
//     });
//     console.log('Data',this.labels,this.logins);
//     this.setData();
// }

// putData(posicion,log){
//     switch (log.tabla){
//     case "login":
//     this.logins[posicion]++;
//     break;
//     default:
//     this.acciones[posicion]++;
//     break;
//     //case "Resultados_Control":

//     }  
// }

loadUsers(){
    this.calculando = true;
    let parametros = '&idempresa=' + this.empresasService.seleccionada;
    // llamada al servidor para conseguir los usuarios
    this.servidor.getObjects(URLS.USUARIOS, parametros).subscribe(
      response => {
        this.usuarios = [];
        if (response.success && response.data) {
          let orden=0;
          for (let element of response.data) {
            if (element.orden == 0){
              orden++;
              }else{orden=parseInt(element.orden);}
            this.usuarios.push(new Usuario(element.id, element.usuario, element.password,
              element.tipouser, element.email, element.idempresa,0+orden,element.superuser));
              this.panels.push(false);
          }
          this.loadLogs();
          this.altura = 120 + this.usuarios.length*48 + 'px';
        }
    });
}
loadLogs(periodo?:number){
  
    if (!periodo) periodo = 7;
    this.dias=periodo;
    let fecha_fin=moment().format('YYYY-MM-DD');
    let fecha_inicio=moment().subtract(periodo,'days').format('YYYY-MM-DD');
    let fecha_field="fecha";
    let fields = "&fields=fecha,idusuario,tabla,accion,plataforma";
    let filter= "&filterdates=true"+"&fecha_inicio="+fecha_inicio+"&fecha_fin="+fecha_fin+"&fecha_field="+fecha_field;
    let order = "&order=id ASC";
        let parametros = '&idempresa=' + this.empresasService.seleccionada+"&fechainicio="+fecha_inicio;
            this.servidor.getObjects(URLS.RESUMEN_ACCIONES_LOGS, parametros).subscribe(
              response => {
                this.logs = [];
                if (response.success && response.data) {
                  for (let element of response.data) { 
                      this.logs.push({
                    "fecha":moment(element.fecha).format('DD-MM-YYYY'),
                      "idusuario":element.idusuario,
                      "tabla":element.tabla,
                      "accion":element.accion,
                      "plataforma":element.plataforma,
                        "total":element.total});
                }
                 console.log('Logs',this.logs);
                }
                this.calculando = false;
            });
    }

    closePanel(panel){
      this.panels[panel]=false;
      console.log(this.panels.find((item)=>item==true))
      if (this.panels.find((item)=>item==true)){
        this.altura =   this.addAltura('-',panel)
      }else{
        this.altura = 120 + this.usuarios.length*48 + 'px';
      }
    }
    
    openPanel(panel){
      this.panels[panel]=true;
      this.altura = this.addAltura('+',panel)
    }

    addAltura(operador,panel){
      let altura = parseInt(this.altura.substr(0,this.altura.length-2));
      console.log(this.altura,altura);
      let valor = (this.logs.filter((log)=>log["idusuario"]==this.usuarios[panel].id).length) *48;
      if(operador == '+'){
         altura += valor}
         else{
           altura -= valor;
         }
      console.log(this.logs.filter((log)=>log["idusuario"]==this.usuarios[panel].id).length,altura)
      return altura+'px';
    }
    

// loadLogs(periodo?:number){
//     if (!periodo) periodo = 7;
//     let fecha_fin=moment().format('YYYY-MM-DD');
//     let fecha_inicio=moment().subtract(periodo,'days').format('YYYY-MM-DD');
//     let fecha_field="fecha";
//     let fields = "&fields=fecha,idusuario,tabla,accion,plataforma";
//     let filter= "&filterdates=true"+"&fecha_inicio="+fecha_inicio+"&fecha_fin="+fecha_fin+"&fecha_field="+fecha_field;
//     let order = "&order=id ASC";
//         let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=logs"+filter+order+fields;
//             this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
//               response => {
//                 this.logs = [];
//                 if (response.success && response.data) {
//                   for (let element of response.data) { 
//                       if (element.tabla == 'ResultadosControl' || 
//                       element.tabla == 'resultadoschecklist' || 
//                       element.tabla == 'limpieza_realizada' || 
//                       element.tabla == 'mantenimientos_realizados' || 
//                       element.tabla == 'login' || 
//                       element.tabla == 'incidencias'){ 
//                       this.logs.push({
//                     "fecha":moment(element.fecha).format('DD-MM-YYYY'),
//                       "idusuario":element.idusuario,
//                       "tabla":element.tabla,
//                       "accion":element.accion,
//                       "plataforma":element.plataforma});
//                  }
//                 }
//                  console.log('Logs',this.logs);
//                 }
//                 this.calculando = false;
//             });
//     }


//   selectData(event) {
//     this.msgs = [];
//     this.msgs.push({severity: 'info', summary: 'Data Selected', 'detail': this.data.datasets[event.element._datasetIndex].data[event.element._index]});
// }
// setData(){
//     this.data = {
//         //labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
//         labels: this.labels,
//         datasets: [
//             {
//                 label: 'logins',
//                 data: this.logins,
//                 fill: false,
//                 borderColor: '#4bc0c0'
//             }
//             ,
//             {
//                 label: 'acciones',
//                 data: this.acciones,
//                 fill: false,
//                 borderColor: '#565656'
//             }
//         ]
//     }
   
// }

// closePanel(panel){
//     this.panels[panel]=false;
//     console.log(this.panels.find((item)=>item==true))
//     if (this.panels.find((item)=>item==true)){
//       this.altura = "100%"
//     }else{
//     this.altura = ""
//     }
//   }
  
//   openPanel(panel){
//     this.panels[panel]=true;
//     this.altura = "100%"
//   }
}


