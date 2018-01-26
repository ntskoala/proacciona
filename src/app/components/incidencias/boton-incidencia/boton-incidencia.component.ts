import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from 'ng2-translate';

import { EmpresasService } from '../../../services/empresas.service';
import { Servidor } from '../../../services/servidor.service';
import { URLS } from '../../../models/urls';
import { Empresa } from '../../../models/empresa';
import { Incidencia } from '../../../models/incidencia';
import { Modal } from '../../../models/modal';
import {MdSelect,MdSnackBar} from '@angular/material';
import * as moment from 'moment';

@Component({
  selector: 'app-boton-incidencia',
  templateUrl: './boton-incidencia.component.html',
  styleUrls: ['./boton-incidencia.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class BotonIncidenciaComponent implements OnInit {
public nuevaIncidencia:boolean=false;
public newIncidencia: Incidencia = new Incidencia(null,this.empresasService.seleccionada,null,new Date,null,null,0);
public incidencias: Incidencia[];
public cols:any[];
public es:any;
public entidad:string="&entidad=incidencias";
  constructor(public servidor: Servidor, public empresasService: EmpresasService
    , public translate: TranslateService, private messageService: MessageService) { }

  ngOnInit() {
    this.es = {
      monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
          'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      dayNames: ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'],
      dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
      dayNamesMin: ["Do","Lu","Ma","Mi","Ju","Vi","Sa"],
      firstDayOfWeek: 1
  }; 
  }



  newItem() {
    this.newIncidencia.fecha = new Date(Date.UTC(this.newIncidencia.fecha.getFullYear(), this.newIncidencia.fecha.getMonth(), this.newIncidencia.fecha.getDate()))
    this.newIncidencia.idempresa = this.empresasService.seleccionada;

      this.addItem(this.newIncidencia).then(
        (valor)=>{      
            this.newIncidencia = new Incidencia(null,this.empresasService.seleccionada,null,new Date,null,null,0);
            this.incidencias = this.incidencias.slice();
          }
      );
  }

   addItem(incidencia: Incidencia){
    return new Promise((resolve,reject)=>{
    let param = this.entidad;
    this.servidor.postObject(URLS.STD_ITEM, incidencia,param).subscribe(
      response => {
        if (response.success) {
          this.incidencias.push(new Incidencia(response.id,incidencia.idempresa,incidencia.incidencia,
            incidencia.fecha,incidencia.solucion,incidencia.responsable,incidencia.nc));
          resolve(true);
        }
    },
    error =>{
      console.log(error);
      resolve(true);
    },
    () =>  {}
    );
  });
  }


setIncidencia(){
this.nuevaIncidencia = ! this.nuevaIncidencia;
}
}
