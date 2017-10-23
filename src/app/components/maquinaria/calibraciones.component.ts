import { Component, OnInit, Input, OnChanges, ViewChild } from '@angular/core';

import { DataTable } from 'primeng/primeng';

import * as moment from 'moment';

import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { Empresa } from '../../models/empresa';
import { CalibracionesMaquina } from '../../models/calibracionesmaquina';
import { Maquina } from '../../models/maquina';
import { Modal } from '../../models/modal';
import { Usuario } from '../../models/usuario';
@Component({
  selector: 'calibraciones',
  templateUrl: './calibraciones.component.html',
  styleUrls: ['mantenimientos.css']
})
export class CalibracionesComponent implements OnInit, OnChanges {
  @Input() maquina: Maquina;
  @ViewChild('DT') dt: DataTable;
  public nuevaFecha: Date;
  public calibraciones: CalibracionesMaquina[] = [];
  public nuevoCalibracion: CalibracionesMaquina = new CalibracionesMaquina(0, 0, '', this.nuevaFecha);
  public guardar = [];
  public idBorrar;
  public modal2: boolean = false;
  public es: any;
  usuarios: Usuario[] = [];
  modal: Modal = new Modal();
  public procesando: boolean = false;

  public tipos: object[] = [{ label: 'interno', value: 'interno' }, { label: 'externo', value: 'externo' }];

  constructor(public servidor: Servidor, public empresasService: EmpresasService) { }

  ngOnInit() {
    //solo se carga el control si hay una maquina seleccionada, por eso no necesito controlar
    //  this.setMantenimientos();
    this.es = {
      monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
        'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      dayNames: ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'],
      dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
      dayNamesMin: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
      firstDayOfWeek: 1
    };
  }

  ngOnChanges() {
    this.setMantenimientos();
  }
  setMantenimientos() {
    let params = this.maquina.id;
    let parametros = '&idmaquina=' + params;
    // let parametros = '&idempresa=' + seleccionada.id; 
    this.servidor.getObjects(URLS.CALIBRACIONES, parametros).subscribe(
      response => {
        this.calibraciones = [];
        if (response.success && response.data) {
          let orden: number = 0;
          for (let element of response.data) {
            if (element.orden == 0) {
              this.itemEdited(element.id);
              orden++;
            } else {
              orden = parseInt(element.orden);
              this.guardar[element.id] = false;
            }
            this.calibraciones.push(new CalibracionesMaquina(element.id, element.idmaquina, element.nombre, new Date(element.fecha), element.tipo, element.periodicidad,
              element.tipo_periodo, element.doc, element.usuario, element.responsable, 0 + orden));
            this.guardar[element.id] = false;
          }
        }

      },
      error => console.log(error),
      () => console.log('calibraciones ok')
    );
  }

  //   modificarMantenimiento(idMantenimiento: number) {
  //   this.guardar[idMantenimiento] = true;
  // }
  onEdit(evento) {
    this.itemEdited(evento.data.id);
  }
  itemEdited(idItem: number, fecha?: any) {
    this.guardar[idItem] = true;
  }
  saveItem(mantenimiento: CalibracionesMaquina, i: number) {
    let indice = this.calibraciones.findIndex((myitem) => myitem.id == mantenimiento.id);
    mantenimiento.periodicidad = this.calibraciones[indice].periodicidad;

    this.guardar[mantenimiento.id] = false;
    mantenimiento.fecha = new Date(Date.UTC(mantenimiento.fecha.getFullYear(), mantenimiento.fecha.getMonth(), mantenimiento.fecha.getDate()))
    let parametros = '?id=' + mantenimiento.id;
    this.servidor.putObject(URLS.CALIBRACIONES, parametros, mantenimiento).subscribe(
      response => {
        if (response.success) {
          console.log('Mantenimiento updated');
        }
      });
  }
  crearMantenimiento() {
    this.nuevoCalibracion.idmaquina = this.maquina.id;
    this.nuevoCalibracion.fecha = new Date(Date.UTC(this.nuevoCalibracion.fecha.getFullYear(), this.nuevoCalibracion.fecha.getMonth(), this.nuevoCalibracion.fecha.getDate()))
    this.nuevoCalibracion.orden = this.newOrden(this.calibraciones);
    this.servidor.postObject(URLS.CALIBRACIONES, this.nuevoCalibracion).subscribe(
      response => {
        if (response.success) {
          this.nuevoCalibracion.id = response.id;
          this.calibraciones.push(this.nuevoCalibracion);
          this.calibraciones = this.calibraciones.slice();
          this.nuevoCalibracion = new CalibracionesMaquina(0, 0, '', this.nuevaFecha);
        }
      });
  }

  checkBorrar(idBorrar: number) {
    // Guardar el id del control a borrar
    this.idBorrar = idBorrar;
    // Crea el modal
    this.modal.titulo = 'borrarControlT';
    this.modal.subtitulo = 'borrarControlST';
    this.modal.eliminar = true;
    this.modal.visible = true;
  }

  cerrarModal(event: boolean) {
    this.modal.visible = false;
    if (event) {
      let parametros = '?id=' + this.idBorrar;
      this.servidor.deleteObject(URLS.CALIBRACIONES, parametros).subscribe(
        response => {
          if (response.success) {
            let controlBorrar = this.calibraciones.find(mantenimiento => mantenimiento.id == this.idBorrar);
            let indice = this.calibraciones.indexOf(controlBorrar);
            this.reordenar(this.dt._value.findIndex((elem) => elem.id == this.idBorrar));
            this.calibraciones.splice(indice, 1);
            this.calibraciones = this.calibraciones.slice();


          }
        });
    }
  }


  // setPeriodicidad(periodicidad: string, idmantenimiento?: number, i?: number){
  //   if (!idmantenimiento){
  //   this.nuevoCalibracion.periodicidad = periodicidad;
  //   console.log(this.nuevoCalibracion.periodicidad);

  //   }else{
  //     console.log(idmantenimiento,i);
  //     this.itemEdited(idmantenimiento);
  //     this.calibraciones[i].periodicidad = periodicidad;

  //   }
  // }
  setPeriodicidad(periodicidad: string, idmantenimiento?: number, i?: number) {
    if (!idmantenimiento) {
      this.nuevoCalibracion.periodicidad = periodicidad;
      console.log(this.nuevoCalibracion.periodicidad);

    } else {
      // console.log(idmantenimiento,i);
      // this.itemEdited(idmantenimiento);
      // this.mantenimientos[i].periodicidad = periodicidad;
      this.itemEdited(idmantenimiento);
      let indice = this.calibraciones.findIndex((item) => item.id == idmantenimiento);
      this.calibraciones[indice].periodicidad = periodicidad;
    }
  }

  goUp(index: number, evento: Event) {
    if (index > 0) {
      this.dt._value[index].orden--;
      this.saveItem(this.dt._value[index], index);
      this.dt._value[index - 1].orden++;
      this.saveItem(this.dt._value[index - 1], index - 1);
      let temp1: any = this.dt._value.splice(index - 1, 1);
      //console.log(this.calibraciones);
      this.dt._value.splice(index, 0, temp1[0]);
      // console.log(this.calibraciones);

      this.calibraciones = this.calibraciones.slice();
      //   setTimeout(()=>{
      //     this.setOrden(evento,dt);
      //   },500);
    } else {
      console.log('primer elemento');
    }
  }

  goDown(index: number, evento: Event) {
    if (index < this.calibraciones.length - 1) {
      this.dt._value[index].orden++;
      this.saveItem(this.dt._value[index], index);
      this.dt._value[index + 1].orden--;

      this.saveItem(this.dt._value[index + 1], index + 1);
      let temp1: any = this.dt._value.splice(index, 1);

      console.log(this.dt._value);
      this.dt._value.splice(index + 1, 0, temp1[0]);
      console.log(this.dt._value);
      this.calibraciones = this.calibraciones.slice();

      // setTimeout(()=>{
      //   this.setOrden(evento,dt);
      // },500);
    } else {
      console.log('ultimo elemento');
    }
  }


  exportData(tabla: DataTable) {
    console.log(tabla);
    let origin_Value = tabla._value;

    tabla._value = tabla.dataToRender;
    tabla._value.map((calibracion) => {
      (moment(calibracion.fecha).isValid()) ? calibracion.fecha = moment(calibracion.fecha).format("DD/MM/YYYY") : '';
      calibracion.periodicidad = this.checkPeriodo(calibracion.periodicidad);
    });

    tabla.csvSeparator = ";";
    tabla.exportFilename = "Calibraciones_" + this.maquina.nombre;
    tabla.exportCSV();
    tabla._value = origin_Value;
  }

  checkPeriodo(periodicidad: string): string {
    if (periodicidad) {
      let valor: string;
      let periodo = JSON.parse(periodicidad);
      return periodo.repeticion;
    } else {
      return 'Nul';
    }
  }

  newOrden(items): number {
    let x: number;
    if (this.dt._value[this.dt._value.length - 1].orden > 0) {
      let valor = this.dt._value[this.dt._value.length - 1].orden;
      x = ++valor;
    } else {
      x = 0;
    }
    return x;
  }

  ordenar() {
    this.procesando = true;
    this.calibraciones.forEach((item) => {
      this.saveItem(item, 0);
    });
    this.procesando = false;
  }

  reordenar(indice) {
    this.procesando = true;
    for (let x = indice; x < this.dt._value.length; x++) {
      this.dt._value[x].orden = x;
      this.saveItem(this.dt._value[x], 0);
    }
    this.procesando = false;
  }
}