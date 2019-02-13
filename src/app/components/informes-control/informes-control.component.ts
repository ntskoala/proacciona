import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Router,ActivatedRoute, ParamMap  } from '@angular/router';

import { TranslateService} from '@ngx-translate/core';
import {MessageService} from 'primeng/components/common/messageservice';

import { Servidor } from '../../services/servidor.service';
import { EmpresasService } from '../../services/empresas.service';
import { PermisosService } from '../../services/permisos.service';
// import { EmpresasComponent } from '../empresas/empresas.component';
import { RouterCanvasComponent } from '../routerCanvas.component';

import { URLS,cal } from '../../models/urls';
import { ResultadoControl } from '../../models/resultadocontrol';
import { Modal } from '../../models/modal';

import * as moment from 'moment';
import {SelectItem} from 'primeng/primeng';
//import { Promise } from 'q';

@Component({
  selector: 'app-informes-control',
  templateUrl: './informes-control.component.html',
  styleUrls: ['./informes-control.component.css']
})
export class InformesControlComponent implements OnInit {
  @ViewChild('table') table: ElementRef;
  public subscription: Subscription;
  public columnOptions: SelectItem[];
  public controles: any[] = [];
  public selectedItem: any;
  public resultadoscontrol: ResultadoControl[] = [];
  public cols=[];
  public columnas: object[] = [];
  public tabla: Object[] = [];
  public tabla2: Object[] = [];
  //fecha: Object ={};// = {"inicio":"2016-12-09","fin":"2016-12-12"};
  public fecha: Object = {inicio:new Date(moment().subtract(7,'d').format('YYYY-MM-DD')),fin:new Date()};
  public modal: boolean = false;
  public fotoSrc: string;
  public exportar_informes: boolean =false;
  public exportando:boolean=false;
  public informeData:any;
  public es;
  public brands: string[]=['>','<','='];
  public foto;
  public idBorrar;
  public  modalW: Modal = new Modal();

  constructor(
    public servidor: Servidor, 
    public empresasService: EmpresasService, 
    public routerCanvasComponent: RouterCanvasComponent, 
    public permisos: PermisosService,
    private route: ActivatedRoute,
    public translateService: TranslateService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    //this.newChart();
    // Conseguir controles
    console.log(this.route.params["_value"]["modulo"],this.route.params["_value"]["id"]);
    this.getControles();
    this.subscription = this.empresasService.empresaSeleccionada.subscribe(x => this.getControles());
    this.subscription = this.empresasService.opcionesFuente.subscribe(x => this.exportar_informes = x);
 
      this.es=cal;
  }

  getControles() {
    let parametros = '&idempresa=' + this.empresasService.seleccionada; 
    this.servidor.getObjects(URLS.CONTROLES, parametros).subscribe(
      response => {
        this.controles = [];
        this.columnas = [];
        this.tabla = [];
        if (response.success && response.data) {
          for (let element of response.data) {
            this.controles.push({id: element.id, nombre: element.nombre, minimo: element.valorminimo,
              maximo: element.valormaximo, tolerancia: element.tolerancia, critico: element.critico});
            this.columnas.push({field:element.nombre,header:element.nombre});
          }
        }
    },
    (error)=> console.log(error),
    ()=>{
      this.setColOptions();
      //this.fecha['inicio']= new Date('2017-01-01'); //moment().subtract(7,'d').date();
      this.fecha['inicio']= new Date(moment().subtract(7,'d').format('YYYY-MM-DD')); //moment().subtract(7,'d').date();
      this.fecha['fin']= new Date();//moment().date();
      if (this.route.params["_value"]["modulo"] == "Controles" && this.route.params["_value"]["id"] > 0){
        this.getDateInicio();
     }else{
      this.filtrarFechas(this.fecha);

     }
    });
  }



setColOptions(){
    //this.cols =this.columnas;
        this.columnOptions = [];
        for(let i = 0; i < this.columnas.length; i++) {
            this.columnOptions.push({label: this.columnas[i]['header'], value: this.columnas[i]});
        }
} 

getDateInicio(){
  let parametros = '&idempresa=' + this.empresasService.seleccionada+'&entidad=ResultadosControl&field=id&idItem='+this.route.params["_value"]["id"]; 
  this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
    response => {
      if (response.success && response.data) {
        for (let element of response.data) {
          this.fecha['inicio']= new Date(moment(element.fecha).format('YYYY-MM-DD')); //moment().subtract(7,'d').date();
          this.filtrarFechas(this.fecha);
        }
      }
  },
  error=>{console.log('Error getting control',error)});

}

  filtrarFechas(fecha) {
   // console.log (fecha.inicio.formatted,fecha.fin.formatted);
    console.log (moment(fecha.inicio).format('YYYY-MM-DD'),moment(fecha.fin).format('YYYY-MM-DD'));
    let parametros;
    if (this.route.params["_value"]["modulo"] == "Controles" && this.route.params["_value"]["id"] > 0){
     parametros = '&idempresa=' + this.empresasService.seleccionada +
      '&fechainicio=' + moment(fecha.inicio).format('YYYY-MM-DD') + '&fechafin=' + moment(fecha.fin).format('YYYY-MM-DD');
  }else{
     parametros = '&idempresa=' + this.empresasService.seleccionada +
    '&fechainicio=' + moment(fecha.inicio).format('YYYY-MM-DD') + '&fechafin=' + moment(fecha.fin).format('YYYY-MM-DD');
  }

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
              resultado['fecha'] = moment(element.fecha).format('DD/MM/YYYY HH:mm');
              resultado['nombre']= control.nombre;
              resultado['valor']= element.resultado;
              resultado[control.nombre] = element.resultado;
              if (element.foto == 'true') {
                resultado['foto'] = true;
              }
              if (resultado[control.nombre] !== '') {
                if (control.minimo !== null && resultado[control.nombre] < control.minimo) {
                  resultado[control.nombre + 'mensaje'] = '<min';
                }
                if (control.maximo !== null && resultado[control.nombre] > control.maximo) {
                  resultado[control.nombre + 'mensaje'] = '>max';
                }
                if (control.tolerancia !== null && resultado[control.nombre] > control.tolerancia) {
                  resultado[control.nombre + 'mensaje'] = '>tol';
                }
                if (control.critico !== null && resultado[control.nombre] > control.critico) {
                  resultado[control.nombre + 'mensaje'] = '>cri';
                }
                if (resultado[control.nombre + 'mensaje']) resultado['error'] = true;
                
              }
              this.tabla.push(resultado);
              if (element.idr == this.route.params["_value"]["id"]) this.selectedItem = resultado;
            }
          }
          
        }
    },
    (error)=>console.log(error),
    ()=>{this.tabla2 = this.tabla}
    );
  }

  ventanaFoto(idResultado: number) {
    // this.fotoSrc = URLS.FOTOS + this.empresasService.seleccionada + '/control' + idResultado + '.jpg'
    // this.modal = true;
    this.foto = URLS.FOTOS + this.empresasService.seleccionada + '/control' + idResultado + '.jpg';
  }

  cerrarFoto() {
    this.modal = false;
  }


  setAlerta(concept:string){
    let concepto;
    this.translateService.get(concept).subscribe((valor)=>concepto=valor)  
    this.messageService.clear();this.messageService.add(
      {severity:'warn', 
      summary:'Info', 
      detail: concepto
      }
    );
  }

  checkBorrar(idBorrar: number) {
    console.log('borrar');
    // Guardar el id del control a borrar
    this.idBorrar = idBorrar;
    // Crea el modal
    this.modalW.titulo = 'maquinas.borrarMantenimientoR';
    this.modalW.subtitulo = 'borrarControlT';
    this.modalW.eliminar = true;
    this.modalW.visible = true;
  }

  cerrarModal(event: boolean) {
    this.modalW.visible = false;
    if (event) {
      let parametros = '?id=' + this.idBorrar+"&entidad=ResultadosControl";
      this.servidor.deleteObject(URLS.STD_SUBITEM, parametros).subscribe(
        response => {
          if (response.success) {
            let indice = this.tabla.findIndex((item)=>item["id"]==this.idBorrar);
            this.tabla.splice(indice, 1);
            this.tabla = this.tabla.slice();
            this.setAlerta('alertas.borrar');
          }
      });
    }
  }





scroll(){
  console.log("dateclicked");
  this.routerCanvasComponent.scrolldown();
}

excelOld(fecha){
  console.log("send to excel");
  var csvData = this.ConvertToCSV(this.columnas, this.tabla);
    var a = document.createElement("a");
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);
   // var blob = new Blob([csvData], { type: 'text/csv' });
   // var url= window.URL.createObjectURL(blob);
//    a.href = url;
    
    a.download = 'InformeControles_del'+fecha.inicio.formatted+"_al_"+fecha.fin.formatted+'.csv';
    a.click();
}
logTabla(){
console.log(this.tabla);
}

async downloads(){
    let informeData = await this.ConvertToCSV(this.columnas, this.tabla);
     let url ='https://script.google.com/a/proacciona.es/macros/s/AKfycbzIpotMyRcSxISIMvMLWN0-boPG8drRZ9wD8IQO5eQ/dev?idEmpresa='+this.empresasService.seleccionada+"&informes=controles";
    let params = {'tabla':this.tabla};
  }

  async excel2(){
    this.exportando=true;
    this.informeData = await this.ConvertToCSV(this.columnas, this.tabla);
  }
  informeRecibido(resultado){
    console.log('informe recibido:',resultado);
    if (resultado){
      setTimeout(()=>{this.exportando=false},1500)
    }else{
      this.exportando=false;
    }
  }


ConvertToCSV(controles,objArray){
var cabecera =  typeof controles != 'object' ? JSON.parse(controles) : controles;
var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
console.log(cabecera,array)
let informeCabecera=[];
let informeRows=[];
let comentarios = [];
            var str = '';
            var row = "";
            row += "Usuario;Foto;Fecha;"
            for (var i = 0; i < cabecera.length; i++) {
              row += cabecera[i]["header"] + ';';
            }
            row = row.slice(0, -1);
            //append Label row with line break
            //str += row + '\r\n';
            informeCabecera = row.split(";");
            str='';
            for (var i = 0; i < array.length; i++) {
              let fotoUrl = ''
              let comentario='';
              if (array[i].foto){
                //+ '/control' + idResultado + '.jpg';
                //fotoUrl = '=hyperlink("'+URLS.FOTOS + this.empresasService.seleccionada + '/control'+ array[i].id + '.jpg";"foto")';
                fotoUrl =URLS.FOTOS + this.empresasService.seleccionada + '/control'+ array[i].id + '.jpg'
             }                            
                var line =array[i].usuario+";"+ fotoUrl+";"+array[i].fecha +";";
                //var line =array[i].usuario+";"+array[i].fecha +";";
                //var line =array[i].usuario+";"+array[i].fecha + ";";

              for (var x = 0; x < cabecera.length; x++) {
                let columna = cabecera[x]["header"];
                //let resultado = array[i][cabecera[x]];
                let resultado = array[i]["nombre"];
                if (array[i][columna + 'mensaje']) {
                  this.translateService.get(array[i][columna + 'mensaje']).subscribe((mensaje)=>{comentario +=  columna +": "+mensaje})
                } 
              //line += ((array[i][cabecera[x]] !== undefined) ?array[i][cabecera[x]] + ';':';');
              line += ((columna == resultado && array[i]["valor"] !== undefined) ?array[i]["valor"] + ';':';');
            }
            line = line.slice(0,-1);
                //str += line + '\r\n';
                informeRows.push(line.split(";"));
                comentarios.push(comentario);

            }
            //return str;
            return {'cabecera':[informeCabecera],'rows':informeRows,'comentarios':comentarios,'informes':'Controles'};
}

formatFecha(fecha: Date):string{

//let mifecha = ("0"+fecha.getUTCDate()).slice(-2) +"/"+("0"+(fecha.getUTCMonth()+1)).slice(-2)+"/"+fecha.getUTCFullYear()+ " - " +("0"+(fecha.getHours())).slice(-2)+":"+("0"+fecha.getUTCMinutes()).slice(-2);
let mifecha = moment(fecha).format('DD/MM/YYYY HH:mm')
  return mifecha;
}

setChanges(){
this.tabla = this.tabla2;
this.tabla = this.tabla.filter((fila)=>{
  let result = false;
  this.columnas.forEach((col)=>{
  if (fila[col['field']]) result = true;
});
return result;
});
}

gotoIncidencia(evento){
  console.log(evento);

}

// newChart(){
//   let canvas = document.createElement("canvas")
//   canvas.style.visibility = 'hidden';
//   document.body.appendChild(canvas);
//   let ctx = canvas.getContext("2d");

//   let options = {
//     title: {
//         display: true,
//         text: 'My Title',
//         fontSize: 16
//     },
//     legend: {
//         position: 'bottom'
//     }
// };
//   let datos = {
//     labels:['uno','dos','tres','cuatro'],
//     datasets: [
//     {
//       label: "line1",
//       data: [10,5,15,25]
//     }
//   ]
//   }
//   let config ={
//     // this is the string the constructor was registered at, ie Chart.controllers.MyType
//     type: 'line',
//     data: datos,
//     options: options
// };
//   let myLineChart = new Chart(ctx, config);
//   let img = myLineChart.toBase64Image();
//   //console.log(img);
// }

}
