import { Component, OnInit, Input, OnChanges } from '@angular/core';

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
  templateUrl: './calibraciones.component.html'
})
export class CalibracionesComponent implements OnInit, OnChanges {
@Input() maquina:Maquina;
public nuevaFecha: Date;
public calibraciones: CalibracionesMaquina[] =[]; 
public nuevoCalibracion: CalibracionesMaquina = new CalibracionesMaquina(0,0,'',this.nuevaFecha);
public guardar =[];
public idBorrar;
public modal2: boolean= false;
public es:any;
usuarios: Usuario[] = [];
  modal: Modal = new Modal();
  constructor(private servidor: Servidor,private empresasService: EmpresasService) {}

  ngOnInit() {
    //solo se carga el control si hay una maquina seleccionada, por eso no necesito controlar
  //  this.setMantenimientos();
         this.es = {
            monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
                'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            dayNames: ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'],
            dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
            dayNamesMin: ["Do","Lu","Ma","Mi","Ju","Vi","Sa"],
            firstDayOfWeek: 1
        }; 
    }

ngOnChanges(){
    this.setMantenimientos();
}
  setMantenimientos(){
    let params = this.maquina.id;
    let parametros = '&idmaquina=' + params;
       // let parametros = '&idempresa=' + seleccionada.id; 
        this.servidor.getObjects(URLS.CALIBRACIONES, parametros).subscribe(
          response => {
            this.calibraciones = [];
            if (response.success && response.data) {
              for (let element of response.data) {
                this.calibraciones.push(new CalibracionesMaquina(element.id, element.idmaquina, element.nombre,new Date(element.fecha), element.tipo, element.periodicidad,
                  element.tipo_periodo, element.doc));
                this.guardar[element.id] = false;
              }
            }
        });
  }

    modificarMantenimiento(idMantenimiento: number) {
    this.guardar[idMantenimiento] = true;
  }
 actualizarMantenimiento(mantenimiento: CalibracionesMaquina, i: number) {
    this.guardar[mantenimiento.id] = false;
     mantenimiento.fecha = new Date(Date.UTC(mantenimiento.fecha.getFullYear(), mantenimiento.fecha.getMonth(), mantenimiento.fecha.getDate()))
     mantenimiento.periodicidad = this.calibraciones[i].periodicidad;
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
    this.servidor.postObject(URLS.CALIBRACIONES, this.nuevoCalibracion).subscribe(
      response => {
        if (response.success) {
          this.nuevoCalibracion.id = response.id;
          this.calibraciones.push(this.nuevoCalibracion);
          this.nuevoCalibracion = new CalibracionesMaquina(0,0,'',this.nuevaFecha);
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
            this.calibraciones.splice(indice, 1);
          }
      });
    }
  }


setPeriodicidad(periodicidad: string, idmantenimiento?: number, i?: number){
  if (!idmantenimiento){
  this.nuevoCalibracion.periodicidad = periodicidad;
  console.log(this.nuevoCalibracion.periodicidad);

  }else{
    console.log(idmantenimiento,i);
    this.modificarMantenimiento(idmantenimiento);
    this.calibraciones[i].periodicidad = periodicidad;

  }
}




}