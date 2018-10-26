import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Router,ActivatedRoute, ParamMap  } from '@angular/router';

import { Servidor } from '../../services/servidor.service';
import { EmpresasService } from '../../services/empresas.service';
import { PermisosService } from '../../services/permisos.service';
import { EmpresasComponent } from '../empresas.component';
import { URLS } from '../../models/urls';
import { ResultadoControl } from '../../models/resultadocontrol';
import * as moment from 'moment';
import * as XLSX from 'xlsx';
import * as Chart from 'chart.js';
import {SelectItem, DataTable} from 'primeng/primeng';
import { HttpClientXsrfModule } from '@angular/common/http';

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
  fecha: Object ={};// = {"inicio":"2016-12-09","fin":"2016-12-12"};
  //fecha: Object = {"inicio":"2017-01-09","fin":"2017-02-12"};
  public modal: boolean = false;
  public fotoSrc: string;
  public exportar_informes: boolean =false;
  public es;
  public brands: string[]=['>','<','='];
  constructor(public servidor: Servidor, public empresasService: EmpresasService, 
    public empresasComponent: EmpresasComponent, public permisos: PermisosService,private route: ActivatedRoute) {}

  ngOnInit() {
    this.newChart();
    // Conseguir controles
    console.log(this.route.params["_value"]["modulo"],this.route.params["_value"]["id"]);
    this.getControles();
    this.subscription = this.empresasService.empresaSeleccionada.subscribe(x => this.getControles());
    this.subscription = this.empresasService.opcionesFuente.subscribe(x => this.exportar_informes = x);
        //     this.es = {
        //     firstDayOfWeek: 1,
        //     dayNames: [ "domingo","lunes","martes","miércoles","jueves","viernes","sábado" ],
        //     dayNamesShort: [ "dom","lun","mar","mié","jue","vie","sáb" ],
        //     dayNamesMin: [ "D","L","M","X","J","V","S" ],
        //     monthNames: [ "enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre" ],
        //     monthNamesShort: [ "ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic" ]
        // }
        this.es = {
          monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
              'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
              monthNamesShort: [ "Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic" ],              
          dayNames: ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'],
          dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
          dayNamesMin: ["Do","Lu","Ma","Mi","Ju","Vi","Sa"],
          firstDayOfWeek: 1
      }; 
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
    this.fotoSrc = URLS.FOTOS + this.empresasService.seleccionada + '/control' + idResultado + '.jpg'
    this.modal = true;
  }

  cerrarFoto() {
    this.modal = false;
  }

scroll(){
  console.log("dateclicked");
  this.empresasComponent.scrolldown();
}
excelOld(fecha){
  console.log("send to excel");
var csvData = this.ConvertToCSV(this.columnas, this.tabla);
    var a = document.createElement("a");
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);
    var blob = new Blob([csvData], { type: 'text/csv' });
    var url= window.URL.createObjectURL(blob);
    //window.open(url,'_blank');
    a.href = url;
    
    a.download = 'InformeControles_del'+fecha.inicio.formatted+"_al_"+fecha.fin.formatted+'.csv';
    a.click();
}
excel(fecha,dt: DataTable){
  
  /* generate worksheet */
// let ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.tabla2);
let ws2: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.tabla);
// let ws2: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.table, {raw:true});


/* Find desired cell */
var celda: XLSX.CellAddress = ws2['A1'];

/* Get the value */

// let celda: XLSX.CellAddress;
let formatCelda:  XLSX.CellObject = {t:'s'};

formatCelda.v = 'columna1';
formatCelda.t='s'
// formatCelda.s={ alignment: {textRotation: 90 },font: {sz: 14, bold: true, color:' #0000FF',name:'verdana' },fill:{bgColor: {rgb:'#FF0000' }}};
XLSX.utils.cell_set_hyperlink(formatCelda,'https://tfc.proacciona.es');
XLSX.utils.cell_add_comment(formatCelda,'Prueba','Proacciona');
XLSX.utils.format_cell(formatCelda,{ alignment: {textRotation: 90 },font: {sz: 14, bold: true, color:' #0000FF',name:'verdana' },fill:{patternType:'solid',bgColor: {rgb:'#FF0000' }}});

ws2['A1'] = formatCelda;


/* generate workbook and add the worksheet */
const wb: XLSX.WorkBook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws2, 'Controles');
/* save to file */
XLSX.writeFile(wb, 'Informe_Controles_del'+fecha.inicio.formatted+"_al_"+fecha.fin.formatted+'.xlsx');
}
gapps(){
// let url = "https://docs.google.com/spreadsheets/d/1S_xFw1p0AdfN2mX9Z6BcmHXZCV96fphT9dkRK6L9hNg/edit?usp=sharing&data=hola"
// window.open(url,'_blank');
}

ConvertToCSV(controles,objArray){
var cabecera =  typeof controles != 'object' ? JSON.parse(controles) : controles;
var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
            var str = '';
            var row = "";
            row += "Usuario;Fecha;"
            for (var i = 0; i < cabecera.length; i++) {
              row += cabecera[i] + ';';
            }
            row = row.slice(0, -1);
            //append Label row with line break
            str += row + '\r\n';
 
            for (var i = 0; i < array.length; i++) {
                
                var line =array[i].usuario+";"+array[i].fecha + ";";

              for (var x = 0; x < cabecera.length; x++) {
                let columna = cabecera[x];
                let resultado = array[i][cabecera[x]];
              line += ((array[i][cabecera[x]] !== undefined) ?array[i][cabecera[x]] + ';':';');
            }
            line = line.slice(0,-1);
                str += line + '\r\n';
            }
            return str;
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

newChart(){
  let canvas = document.createElement("canvas")
  canvas.style.visibility = 'hidden';
  document.body.appendChild(canvas);
  let ctx = canvas.getContext("2d");

  let options = {
    title: {
        display: true,
        text: 'My Title',
        fontSize: 16
    },
    legend: {
        position: 'bottom'
    }
};
  let datos = {
    labels:['uno','dos','tres','cuatro'],
    datasets: [
    {
      label: "line1",
      data: [10,5,15,25]
    }
  ]
  }
  let config ={
    // this is the string the constructor was registered at, ie Chart.controllers.MyType
    type: 'line',
    data: datos,
    options: options
};
  let myLineChart = new Chart(ctx, config);
  let img = myLineChart.toBase64Image();
  //console.log(img);
}

}
