import { Component, OnInit, OnChanges,ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';

import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from 'ng2-translate';
import {Calendar} from 'primeng/primeng';

import { EmpresasService } from '../../../services/empresas.service';
import { Servidor } from '../../../services/servidor.service';
import { URLS } from '../../../models/urls';
import { Empresa } from '../../../models/empresa';
import { Incidencia } from '../../../models/incidencia';
import { Modal } from '../../../models/modal';
import {MatSelect,MatSnackBar} from '@angular/material';
import * as moment from 'moment';

@Component({
  selector: 'app-boton-incidencia',
  templateUrl: './boton-incidencia.component.html',
  styleUrls: ['./boton-incidencia.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class BotonIncidenciaComponent implements OnInit, OnChanges {
  @Output() nuevaIncidenciaCreada: EventEmitter<Incidencia> = new EventEmitter<Incidencia>();
  @Input() origen: any;

public nuevaIncidencia:boolean=false;
public newIncidencia: Incidencia = new Incidencia(null,this.empresasService.seleccionada,null,new Date,null,null,null,null,0,'Incidencias',0,'','',null,0);
public incidencias: Incidencia[];
public selectedDay: number;
public cols:any[];
public es:any;
public entidad:string="&entidad=incidencias";
public urlFoto = URLS.DOCS + this.empresasService.seleccionada + '/incidencias/';
public uploadFoto: any;
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

ngOnChanges(){
  if (this.origen.origen && this.origen.idOrigen){
    this.newIncidencia.origen = this.origen.origen;
    this.newIncidencia.idOrigen = this.origen.idOrigen;
  }else{
    this.newIncidencia.origen = 'Incidencias';
    this.newIncidencia.idOrigen = 0;
  }
}

  newItem() {
    this.newIncidencia.fecha = new Date(Date.UTC(this.newIncidencia.fecha.getFullYear(), this.newIncidencia.fecha.getMonth(), this.newIncidencia.fecha.getDate(), this.newIncidencia.fecha.getHours(), this.newIncidencia.fecha.getMinutes()))
    this.newIncidencia.idempresa = this.empresasService.seleccionada;

      this.addItem(this.newIncidencia).then(
        (valor)=>{      
          console.log(valor);
          this.nuevaIncidenciaCreada.emit(this.newIncidencia);
          this.setIncidencia();
            // this.newIncidencia = new Incidencia(null,this.empresasService.seleccionada,null,new Date,null,null,0);
            // this.incidencias = this.incidencias.slice();
          }
      );
  }

   addItem(incidencia: Incidencia){
    return new Promise((resolve,reject)=>{
    let param = this.entidad;
    this.servidor.postObject(URLS.STD_ITEM, incidencia,param).subscribe(
      response => {
        if (response.success) {
          this.newIncidencia.id = response.id;
          if (this.newIncidencia.foto && this.uploadFoto) this.uploadImg(this.uploadFoto,response.id,'foto');
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
console.log(this.nuevaIncidencia)
}

setImg(event){
  this.uploadFoto = event;
  var target = event.target || event.srcElement; //if target isn't there then take srcElement
  let files = target.files;
  this.newIncidencia.foto = files[0].name;
  console.log(this.newIncidencia.foto);
}

uploadImg(event, idItem,tipo) {
  console.log(event, idItem,tipo)
  var target = event.target || event.srcElement; //if target isn't there then take srcElement
  let files = target.files;
  //let files = event.srcElement.files;
  let idEmpresa = this.empresasService.seleccionada.toString();
  this.servidor.postDoc(URLS.UPLOAD_DOCS, files,'incidencias',idItem, this.empresasService.seleccionada.toString(),tipo).subscribe(
    response => {
      console.log('doc subido correctamente',files[0].name);
      this.newIncidencia.foto = files[0].name;
      // this.url[i]= URLS.DOCS + this.empresasService.seleccionada + '/incidencias/' +  idItem +'_'+files[0].name;
      // let activa = this.empresas.find(emp => emp.id == this.empresasService.seleccionada);
      // activa.logo = '1';
    }
  )
}



okDate(cal:Calendar){
  cal.overlayVisible = false;
}

itemDateEdited(fecha: any,evento:any) {
  console.log(evento);
  this.selectedDay= new Date(fecha).getDate();
}



}
