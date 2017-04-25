import { Component, OnInit, Input, OnChanges } from '@angular/core';
//import { DatePickerOptions, DateModel } from 'ng2-datepicker';

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
//  date: DateModel[]=[];
 // options: DatePickerOptions;
public mantenimientos: MantenimientosMaquina[] =[]; 
public nuevoMantenimiento: MantenimientosMaquina = new MantenimientosMaquina(0,0,'','');
public guardar =[];
public idBorrar;
public es:any;
  modal: Modal = new Modal();
  constructor(public servidor: Servidor,public empresasService: EmpresasService) {}

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
        this.servidor.getObjects(URLS.MANTENIMIENTOS, parametros).subscribe(
          response => {
            this.mantenimientos = [];
            let i=0;
            
            this.moment = Date();
            if (response.success && response.data) {
              for (let element of response.data) {
                this.mantenimientos.push(new MantenimientosMaquina(element.id, element.idmaquina, element.nombre,new Date(element.fecha), element.tipo, element.periodicidad,
                  element.tipoperiodo, element.doc,element.usuario,element.responsable));
                this.guardar[element.id] = false;
//                this.date.push({"day":"","month":"","year":"","formatted":element.fecha,"momentObj":this.moment}) 
                i++;
              }
            // let widz = 430 + (this.mantenimientos.length*50);
            // if ( document.getElementById("testid") !== null)
            // document.getElementById("testid").style.minHeight= widz+"px";
            }
        },
       error=>console.log(error),
        ()=>{ 
        let widz = 430 + (this.mantenimientos.length*50);
            if ( document.getElementById("testid") !== null)
            document.getElementById("testid").style.minHeight= widz+"px";
            console.log("mantenimientos preventivos",this.mantenimientos);
        }
        );
  }


    modificarMantenimiento(idMantenimiento: number, fecha?: any) {
    this.guardar[idMantenimiento] = true;
    //console.log (fecha.toString());
  }
 actualizarMantenimiento(mantenimiento: MantenimientosMaquina, i: number, event: any) {

  // console.log ("evento",event);
    this.guardar[mantenimiento.id] = false;
    console.log ("actualizar_mantenimiento",mantenimiento);
    mantenimiento.fecha = new Date(Date.UTC(mantenimiento.fecha.getFullYear(), mantenimiento.fecha.getMonth(), mantenimiento.fecha.getDate()))
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
    this.nuevoMantenimiento.fecha = new Date(Date.UTC(this.nuevoMantenimiento.fecha.getFullYear(), this.nuevoMantenimiento.fecha.getMonth(), this.nuevoMantenimiento.fecha.getDate()))
    this.servidor.postObject(URLS.MANTENIMIENTOS, this.nuevoMantenimiento).subscribe(
      response => {
        if (response.success) {
          this.nuevoMantenimiento.id = response.id;
          this.mantenimientos.push(this.nuevoMantenimiento);
 //         this.date.push({"day":"","month":"","year":"","formatted":this.nuevoMantenimiento.fecha,"momentObj":this.moment});
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