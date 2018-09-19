import { Component, OnInit, OnChanges, DoCheck, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { Router  } from '@angular/router';

import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from '@ngx-translate/core';
import {Calendar} from 'primeng/primeng';

import { EmpresasService } from '../../../services/empresas.service';
import { Servidor } from '../../../services/servidor.service';
import { PermisosService } from '../../../services/permisos.service';
import { URLS } from '../../../models/urls';
import { server } from '../../../../environments/environment';
import { Empresa } from '../../../models/empresa';
import { Usuario } from '../../../models/usuario';
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
export class BotonIncidenciaComponent implements OnInit, OnChanges,DoCheck {
  @Output() nuevaIncidenciaCreada: EventEmitter<Incidencia> = new EventEmitter<Incidencia>();
  @Input() origen: any;
  public responsables: any[];
public nuevaIncidencia:boolean=false;
public newIncidencia: Incidencia = new Incidencia(null,this.empresasService.seleccionada,null,this.empresasService.userId,new Date,null,null,null,null,'Incidencias',0,null,0,'','',null);
//public incidencias: Incidencia[];
public selectedDay: number;
public cols:any[];
public es:any;
public entidad:string="&entidad=incidencias";
public urlFoto = URLS.DOCS + this.empresasService.seleccionada + '/incidencias/';
public uploadFoto: any;
public colorBoton:string='accent';
  constructor(public servidor: Servidor, public empresasService: EmpresasService, public router: Router
    , public translate: TranslateService, private messageService: MessageService, public permisos: PermisosService) { }

  ngOnInit() {
    this.loadUsuarios();
    this.es = {
      monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
          'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      dayNames: ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'],
      dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
      dayNamesMin: ["Do","Lu","Ma","Mi","Ju","Vi","Sa"],
      firstDayOfWeek: 1
  }; 
  //this.setOrigen();
  }

ngOnChanges(){
//this.setOrigen();
}
ngDoCheck(){
  if (this.origen){
  this.setOrigen();
  }
  
}
getColor(){
  if (this.origen){
  switch (this.origen.estado){
    case "0":
    return '#cccccc';  
  case "2":
  return '#33cc33';  
  }
}
}
setOrigen(){
 // console.log('###BOTON CHANGES',this.origen,this.origen.idIncidencia > 0)

  if (this.origen.idIncidencia > 0){
    switch (this.origen.estado){
    case "1":
    this.colorBoton= 'warn';
    break;
    case "-1":
    this.colorBoton = 'primary';
    break; 
    }
    this.newIncidencia.id = this.origen.idIncidencia;
    this.newIncidencia.estado = this.origen.estado;
  }

  if (this.origen.origen){
    this.newIncidencia.origen = this.origen.origen;
  }
  if (this.origen.origenasociado){
    this.newIncidencia.origenasociado = this.origen.origenasociado;
  }
  if (this.origen.idOrigenasociado){
    this.newIncidencia.idOrigenasociado = this.origen.idOrigenasociado;
  }
  if (this.origen.idOrigen){
    this.newIncidencia.idOrigen = this.origen.idOrigen;
  }
}
loadUsuarios(){
  let params = this.empresasService.seleccionada;
  let parametros2 = "&entidad=usuarios"+'&idempresa=' + params;
      this.servidor.getObjects(URLS.STD_ITEM, parametros2).subscribe(
        response => {
          this.responsables = [];
          if (response.success && response.data) {
          //  console.log(response.data)
            for (let element of response.data) {  
              this.responsables.push({'label':element.usuario,'value':element.id});
           }
          }
      });
}


  newItem() {
    this.newIncidencia.fecha = new Date(Date.UTC(this.newIncidencia.fecha.getFullYear(), this.newIncidencia.fecha.getMonth(), this.newIncidencia.fecha.getDate(), this.newIncidencia.fecha.getHours(), this.newIncidencia.fecha.getMinutes()))
    this.newIncidencia.fecha_cierre = null;//new Date(Date.UTC(this.newIncidencia.fecha_cierre.getFullYear(), this.newIncidencia.fecha_cierre.getMonth(), this.newIncidencia.fecha_cierre.getDate(), this.newIncidencia.fecha_cierre.getHours(), this.newIncidencia.fecha_cierre.getMinutes()))

    this.newIncidencia.idempresa = this.empresasService.seleccionada;
    this.newIncidencia.estado=-1;
      this.addItem(this.newIncidencia).then(
        (valor)=>{      
          console.log(valor);
          this.sendMaiolAviso(this.newIncidencia);
          this.nuevaIncidenciaCreada.emit(this.newIncidencia);
          let id= this.newIncidencia.id;
          this.setIncidencia();
          this.newIncidencia = new Incidencia(null,this.empresasService.seleccionada,null,this.empresasService.userId,new Date,null,null,null,null,'Incidencias',0,null,0,'','',null);
            // this.newIncidencia = new Incidencia(null,this.empresasService.seleccionada,null,new Date,null,null,0);
            // this.incidencias = this.incidencias.slice();
            this.nuevaIncidencia = false;
            let urlNovaIncidencia = '/empresas/2/incidencias/0/'+id;
            this.router.navigateByUrl(urlNovaIncidencia)

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
  if (this.newIncidencia.id >0){
    let url = 'empresas/' + this.empresasService.seleccionada + '/incidencias/'+0+'/'+this.newIncidencia.id;
    this.router.navigate([url]);
    // this.router.navigateByUrl(url).then(
    //   (ok)=>{console.log('ok',ok)}
    // ).catch(
    //   (error)=>{console.log('ERROR:',error)}
    // )
  }else{
this.nuevaIncidencia = ! this.nuevaIncidencia;
console.log(this.nuevaIncidencia)
  }
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

sendMaiolAviso(nuevaIncidencia: Incidencia){
  console.log(this.responsables,nuevaIncidencia)
  let responsable;
if (nuevaIncidencia.responsable == 109){
responsable = "admin";
}else{
  this.responsables[this.responsables.findIndex((responsable)=>responsable["value"] == nuevaIncidencia.responsable)]["label"];
}
  let body = "Nueva incidencia creada desde " + nuevaIncidencia.origen + "<BR>Por: " +  responsable;
  body +=   "<BR>Con fecha y hora: " + moment(nuevaIncidencia.fecha).format('DD-MM-YYYY hh-mm') +  "<BR>"
  body +=   "<BR>Nombre: " + nuevaIncidencia.incidencia +  "<BR>"
  body +=   "Descripción: " + (nuevaIncidencia.descripcion)? nuevaIncidencia.descripcion:"";
  body +=    "<BR>Solución inmediata propuesta: " + (nuevaIncidencia.solucion)? nuevaIncidencia.solucion:"";
  // body +=    "<BR>Ir a la incidencia: https://tfc.proacciona.es.com/empresas/"+ this.empresasService.seleccionada +"/incidencias/0/" + nuevaIncidencia.id + ""
  body +=    "<BR>Ir a la incidencia: "+server+ this.empresasService.seleccionada +"/incidencias/0/" + nuevaIncidencia.id + ""

  if (nuevaIncidencia.origen != 'incidencias')
  // body +=    "<BR>Ir al elemento https://tfc.proacciona.es/empresas/"+ this.empresasService.seleccionada +"/"+ nuevaIncidencia.origenasociado +"/"+ nuevaIncidencia.idOrigenasociado +"/" + nuevaIncidencia.idOrigen + ""
  body +=    "<BR>Ir al elemento "+ server + this.empresasService.seleccionada +"/"+ nuevaIncidencia.origenasociado +"/"+ nuevaIncidencia.idOrigenasociado +"/" + nuevaIncidencia.idOrigen + ""

  let parametros2 = "&body="+body+'&idempresa=' + this.empresasService.seleccionada;
      this.servidor.getObjects(URLS.ALERTES, parametros2).subscribe(
        response => {
          if (response.success && response.data) {
            console.log(response.data)
          }
      });
}

okDate(cal:Calendar){
  cal.overlayVisible = false;
}

itemDateEdited(fecha: any,evento:any) {
  console.log(evento);
  this.selectedDay= new Date(fecha).getDate();
}

responsableSelected(event){
  console.log(event);
  if (!this.newIncidencia.responsable_cierre) this.newIncidencia.responsable_cierre = event.value;
  

}

}
