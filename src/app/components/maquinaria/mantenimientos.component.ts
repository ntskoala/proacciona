import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { DatePickerOptions, DateModel } from 'ng2-datepicker';

import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { Empresa } from '../../models/empresa';
import { MantenimientosMaquina } from '../../models/mantenimientosmaquina';
 import { Maquina } from '../../models/maquina';
 import { Modal } from '../../models/modal';
@Component({
  selector: 'mantenimientos',
  templateUrl: './mantenimientos.component.html',
  styleUrls: ['mantenimientos.css']
})
export class MantenimientosComponent implements OnInit, OnChanges {
@Input() maquina:Maquina;
moment: any;
  date: DateModel[]=[];
  options: DatePickerOptions;
public mantenimientos: MantenimientosMaquina[] =[]; 
public nuevoMantenimiento: MantenimientosMaquina = new MantenimientosMaquina(0,0,'','');
public guardar =[];
public idBorrar;
  modal: Modal = new Modal();
  constructor(private servidor: Servidor,private empresasService: EmpresasService) {}

  ngOnInit() {
    //solo se carga el control si hay una maquina seleccionada, por eso no necesito controlar
  //  this.setMantenimientos();
    }

ngOnChanges(){
    this.setMantenimientos();

}
  setMantenimientos(){
    let params = this.maquina.id;
    let parametros = '&idmaquina=' + params;
       // let parametros = '&idempresa=' + seleccionada.id; 
        this.servidor.getObjects(URLS.MANTENIMIENTOS, parametros).subscribe(
          response => {
            this.mantenimientos = [];
            let i=0;
            
            this.moment = Date();
            if (response.success && response.data) {
              for (let element of response.data) {
                this.mantenimientos.push(new MantenimientosMaquina(element.id, element.idmaquina, element.nombre,element.fecha, element.tipo, element.periodicidad,
                  element.tipoperiodo, element.doc));
                this.guardar[element.id] = false;
                this.date.push({"day":"","month":"","year":"","formatted":element.fecha,"momentObj":this.moment}) 
                i++;
              }
            let widz = 430 + (this.mantenimientos.length*50);
            if ( document.getElementById("testid") !== null)
            document.getElementById("testid").style.minHeight= widz+"px";
            }
        });
  }


    modificarMantenimiento(idMantenimiento: number, fecha?: any) {
    this.guardar[idMantenimiento] = true;
    //console.log (this.nuevoMantenimiento.fecha);
  }
 actualizarMantenimiento(mantenimiento: MantenimientosMaquina, i: number) {
    this.guardar[mantenimiento.id] = false;
    console.log ("actualizar_mantenimiento",mantenimiento);
    mantenimiento.fecha = this.date[i].formatted;
    mantenimiento.periodicidad = this.mantenimientos[i].periodicidad;
    let parametros = '?id=' + mantenimiento.id;        
    this.servidor.putObject(URLS.MANTENIMIENTOS, parametros, mantenimiento).subscribe(
      response => {
        if (response.success) {
          console.log('Mantenimiento updated');
        }
    });
  }
  crearMantenimiento() {
    console.log (this.nuevoMantenimiento);
    this.nuevoMantenimiento.idmaquina = this.maquina.id;
    this.nuevoMantenimiento.fecha = this.nuevoMantenimiento.fecha.formatted;
    this.servidor.postObject(URLS.MANTENIMIENTOS, this.nuevoMantenimiento).subscribe(
      response => {
        if (response.success) {
          this.nuevoMantenimiento.id = response.id;
          this.mantenimientos.push(this.nuevoMantenimiento);
          this.date.push({"day":"","month":"","year":"","formatted":this.nuevoMantenimiento.fecha,"momentObj":this.moment});
          this.nuevoMantenimiento = new MantenimientosMaquina(0,0,'','');
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
      this.servidor.deleteObject(URLS.MANTENIMIENTOS, parametros).subscribe(
        response => {
          if (response.success) {
            let controlBorrar = this.mantenimientos.find(mantenimiento => mantenimiento.id == this.idBorrar);
            let indice = this.mantenimientos.indexOf(controlBorrar);
            this.mantenimientos.splice(indice, 1);
          }
      });
    }
  }
setPeriodicidad(periodicidad: string, idmantenimiento?: number, i?: number){
  if (!idmantenimiento){
  this.nuevoMantenimiento.periodicidad = periodicidad;
  console.log(this.nuevoMantenimiento.periodicidad);

  }else{
    console.log(idmantenimiento,i);
    this.modificarMantenimiento(idmantenimiento);
    this.mantenimientos[i].periodicidad = periodicidad;

  }
}
}