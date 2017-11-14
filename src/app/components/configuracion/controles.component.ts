import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from 'ng2-translate';

import * as moment from 'moment';

import { EmpresasService } from '../../services/empresas.service';
import { Servidor } from '../../services/servidor.service';
import { Empresa } from '../../models/empresa';
import { URLS } from '../../models/urls';
import { Control } from '../../models/control';
import { Modal } from '../../models/modal';

@Component({
  selector: 'tab-controles',
  templateUrl: './controles.component.html'
})

export class ControlesComponent implements OnInit {

  public subscription: Subscription;
  controles: Control[] = [];
  nuevoControl: Control;
  guardar = [];
  public alertaGuardar:object={'guardar':false,'ordenar':false};  
  
  idBorrar: number;
  modal: Modal = new Modal();
  es;
  procesando:boolean=false;
  constructor(public servidor: Servidor, public empresasService: EmpresasService
    , public translate: TranslateService, private messageService: MessageService) {}

  ngOnInit() {
    this.nuevoControl = new Control(null,null,null,null,null,null,null,null,null,null,this.empresasService.seleccionada,null,null)
    this.es = {
      monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
          'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      dayNames: ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'],
      dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
      dayNamesMin: ["Do","Lu","Ma","Mi","Ju","Vi","Sa"],
      firstDayOfWeek: 1
  }; 
    if (this.empresasService.seleccionada > 0) this.setEmpresa(this.empresasService.seleccionada.toString());
    this.subscription = this.empresasService.empresaSeleccionada.subscribe(
      emp => {
        this.setEmpresa(emp);
    });
    if (this.empresasService.administrador == false) {
      this.setEmpresa(this.empresasService.empresaActiva.toString());
    }
  }

   setEmpresa(emp: Empresa | string) {
    let params = typeof(emp) == "string" ? emp : emp.id
    let parametros = '&idempresa=' + params;
       // let parametros = '&idempresa=' + seleccionada.id; 
        this.servidor.getObjects(URLS.CONTROLES, parametros).subscribe(
          response => {
            this.controles = [];
            if (response.success && response.data) {
              let orden=0;
              for (let element of response.data) {
                if (element.orden == 0){
                  //this.modificarControl(element.id);
                  this.guardar[element.id] = true;
                  orden++;
                  }else{orden=parseInt(element.orden);}
                let fecha;
                //console.log(element.fecha, new Date(element.fecha), typeof(element.fecha));
                if (moment.isDate(new Date(element.fecha_)) && element.fecha_ != "0000-00-00"){
                  fecha = new Date(element.fecha_)
                }else{
                  fecha = null;
                }
                this.controles.push(new Control(element.id, element.nombre, element.pla, element.valorminimo,
                  element.valormaximo, element.objetivo, element.tolerancia, element.critico, element.periodicidad,
                  element.tipoperiodo, element.idempresa,element.periodicidad2,fecha,orden
                ));
                this.guardar[element.id] = false;
              }
            }
        });
   }

  crearControl(nuevoControl: Control) {
    nuevoControl.idempresa = this.empresasService.seleccionada;
    (nuevoControl.fecha_)? nuevoControl.fecha_ = new Date(Date.UTC(this.nuevoControl.fecha_.getFullYear(), this.nuevoControl.fecha_.getMonth(), this.nuevoControl.fecha_.getDate())):nuevoControl.fecha_=null;
    nuevoControl.periodicidad2 = this.nuevoControl.periodicidad2;
    nuevoControl.orden = this.newOrden();
    this.servidor.postObject(URLS.CONTROLES, nuevoControl).subscribe(
      response => {
        if (response.success) {
          nuevoControl.id = response.id;
          this.controles.push(nuevoControl);
          this.controles=this.controles.slice();
    this.nuevoControl = new Control(null,null,null,null,null,null,null,null,null,null,this.empresasService.seleccionada,null,null)
    this.setAlerta('alertas.saveOk','success','alertas.tituloAlertaInfo');
    
  }else{
    this.setAlerta('alertas.saveNotOk','error','alertas.tituloAlertaInfo');
  }
},
(error)=>{
this.setAlerta('alertas.saveNotOk','error','alertas.tituloAlertaInfo');
});
  }
  newOrden():number{
    let orden;
    if ( this.controles.length && this.controles[this.controles.length-1].orden >0){
      orden = this.controles[this.controles.length-1].orden+1;
     }else{
      orden = 0;
     }
     return orden;
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
      this.servidor.deleteObject(URLS.CONTROLES, parametros).subscribe(
        response => {
          if (response.success) {
            let controlBorrar = this.controles.find(control => control.id == this.idBorrar);
            let indice = this.controles.indexOf(controlBorrar);
            this.controles.splice(indice, 1);
            this.controles=this.controles.slice();
            this.setAlerta('alertas.saveOk','success','alertas.tituloAlertaInfo');
            
          }else{
            this.setAlerta('alertas.saveNotOk','error','alertas.tituloAlertaInfo');
          }
        },
        (error)=>{
        this.setAlerta('alertas.saveNotOk','error','alertas.tituloAlertaInfo');
        });
    }
  }

  onEdit(evento){
    this.modificarControl(evento.data.id);
  }

  modificarControl(idControl: number) {
    this.guardar[idControl] = true;

    if (!this.alertaGuardar['guardar']){
      this.alertaGuardar['guardar'] = true;
      this.setAlerta('alertas.guardar','warn','alertas.tituloAlertaInfo');
      }
  }

  setAlerta(concept:string,tipo:string,titulo:string){
    let concepto;
    let sumary;
    this.translate.get(concept).subscribe((valor)=>concepto=valor)  
    this.translate.get(titulo).subscribe((valor)=>sumary=valor)  
    this.messageService.clear();this.messageService.add(
      {severity:tipo,//success | info | warn | error  
      summary:sumary, 
      detail: concepto
      }
    );
  }

  actualizarControl(control: Control) {
    
    for (let property in control) {
      if (control[property] == '') control[property] = null;
    }
    let indice = this.controles.findIndex((elem)=>elem.id==control.id);
    let parametros = '?id=' + control.id;   
    if (control.fecha_) control.fecha_ = new Date(Date.UTC(control.fecha_.getFullYear(), control.fecha_.getMonth(), control.fecha_.getDate()))
    control.periodicidad2 = this.controles[indice].periodicidad2;   
           
    this.servidor.putObject(URLS.CONTROLES, parametros, control).subscribe(
      response => {
        if (response.success =="true") {
          console.log('User updated');
          this.guardar[control.id] = false;
          this.alertaGuardar['guardar'] = false;
          this.controles=this.controles.slice();
          this.setAlerta('alertas.saveOk','success','alertas.tituloAlertaInfo');
        }else{
          this.setAlerta('alertas.saveNotOk','error','alertas.tituloAlertaInfo');
        }
    },
    (error)=>{
      this.setAlerta('alertas.saveNotOk','error','alertas.tituloAlertaInfo');
    });
  }


  setPeriodicidad(periodicidad: string, idItem?: number, i?: number){
    if (!idItem){
    this.nuevoControl.periodicidad2 = periodicidad;
    // console.log(this.nuevoItem.periodicidad);
  
    }else{
      // console.log(idItem,i,periodicidad);
      this.modificarControl(idItem);
      let indice = this.controles.findIndex((item)=>item.id==idItem);
      this.controles[indice].periodicidad2 = periodicidad;
      // console.log(this.items[indice]);
    }
  }


  ordenar() {
    console.log('ORDENANDO')
    this.procesando = true;
    this.alertaGuardar['ordenar'] = false;
    this.controles.forEach((item) => {
      this.actualizarControl(item);
    });
    this.controles = this.controles.slice();
    this.procesando = false;
  }
  
  editOrden(){
    if (!this.alertaGuardar['ordenar']){
      this.alertaGuardar['ordenar'] = true;
      this.setAlerta('alertas.nuevoOrden','info','alertas.tituloAlertaInfo');
      }
  }

}
