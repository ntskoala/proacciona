import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { Servidor } from '../services/servidor.service';
import { EmpresasService } from '../services/empresas.service';
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
  modal: boolean = false;
  fotoSrc: string;

  constructor(private servidor: Servidor, private empresasService: EmpresasService) {}

  ngOnInit() {
    // Conseguir controles
    this.getControles();
    this.subscription = this.empresasService.empresaSeleccionada.subscribe(x => this.getControles());
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
              this.resultadoscontrol.push(new ResultadoControl(element.idr, element.idcontrol,
                parseInt(element.resultado), new Date(element.fecha), element.foto));
          }
        }
        for (let element of this.resultadoscontrol) {
          for (let control of this.controles) {
            if (control.id == element.idcontrol) {
              let resultado = new Object;
              resultado['id'] = element.idr;
              resultado['fecha'] = element.fecha;
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

}
