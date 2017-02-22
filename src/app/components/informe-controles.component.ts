import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { Servidor } from '../services/servidor.service';
import { EmpresasService } from '../services/empresas.service';
import { PermisosService } from '../services/permisos.service';
import { EmpresasComponent } from './empresas.component';
import { URLS } from '../models/urls';
import { ResultadoControl } from '../models/resultadocontrol';

@Component({
  selector: 'informe-controles',
  templateUrl: '../assets/html/informe-controles.component.html'
})
export class InformeControlesComponent implements OnInit {

  private subscription: Subscription;
  controles: any[] = [];
  resultadoscontrol: ResultadoControl[] = [];
  columnas: string[] = [];
  tabla: Object[] = [];
  fecha: Object ={};// = {"inicio":"2016-12-09","fin":"2016-12-12"};
  //fecha: Object = {"inicio":"2016-11-09","fin":"2016-12-12"};
  modal: boolean = false;
  fotoSrc: string;
  exportar_informes: boolean =false;

  constructor(private servidor: Servidor, private empresasService: EmpresasService, public empresasComponent: EmpresasComponent, private permisos: PermisosService) {}

  ngOnInit() {
    // Conseguir controles
    this.getControles();
    this.subscription = this.empresasService.empresaSeleccionada.subscribe(x => this.getControles());
    this.subscription = this.empresasService.opcionesFuente.subscribe(x => this.exportar_informes = x);
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
            this.columnas.push(element.nombre);
          }
        }
    });
  }

  filtrarFechas(fecha) {
    console.log (fecha.inicio.formatted,fecha.fin.formatted);
    // conseguir resultadoscontrol
    let parametros = '&idempresa=' + this.empresasService.seleccionada +
      '&fechainicio=' + fecha.inicio.formatted + '&fechafin=' + fecha.fin.formatted;
    this.servidor.getObjects(URLS.RESULTADOS_CONTROL, parametros).subscribe(
      response => {
        this.resultadoscontrol = [];
        this.tabla = [];
        if (response.success && response.data) {
          for (let element of response.data) {
            let fecha = new Date(element.fecha);

              this.resultadoscontrol.push(new ResultadoControl(element.idr, element.idcontrol,element.usuario,
                parseFloat(element.resultado), new Date(element.fecha), element.foto));
          }
        }
        for (let element of this.resultadoscontrol) {
          for (let control of this.controles) {
            if (control.id == element.idcontrol) {
              let resultado = new Object;
              resultado['id'] = element.idr;
              resultado['usuario'] = element.usuario;
              resultado['fecha'] = this.formatFecha(element.fecha);
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
            }
          }
        }
    });
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
excel(fecha){
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
let mifecha = ("0"+fecha.getUTCDate()).slice(-2) +"/"+("0"+(fecha.getUTCMonth()+1)).slice(-2)+"/"+fecha.getUTCFullYear()+ " - " +("0"+(fecha.getUTCHours()+2)).slice(-2)+":"+("0"+fecha.getUTCMinutes()).slice(-2);
console.log(mifecha);
  return mifecha;
}

}
