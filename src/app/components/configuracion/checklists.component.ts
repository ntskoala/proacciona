import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import {DataTable} from 'primeng/primeng';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from 'ng2-translate';

import * as moment from 'moment';

import { EmpresasService } from '../../services/empresas.service';
import { Servidor } from '../../services/servidor.service';
import { Empresa } from '../../models/empresa';
import { URLS } from '../../models/urls';
import { Checklist } from '../../models/checklist';
import { ControlChecklist } from '../../models/controlchecklist';
import { Modal } from '../../models/modal';

@Component({
  selector: 'tab-checklists',
  templateUrl: './checklists.component.html'
})
export class ChecklistsComponent implements OnInit{
@ViewChild ('listaChecklist') lista: ElementRef;
@ViewChild('dt') dt: DataTable;
  public subscription: Subscription;
  checklistActiva: number = 0;
  checklist: Checklist = new Checklist(0, 0, 'Seleccionar', 0, '');
  checklists: Checklist[] = [];
  selectedChecklist: Checklist;
  controlchecklists: ControlChecklist[] = [];
  cl: Checklist;
  ccl: Object = {};
  modificar: boolean = false;
  modCL: Checklist;
  guardar = [];
  guardarCL = [];
  public alertaGuardar:object={'guardar':false,'ordenar':false};  
  
  idBorrar: number;
  modalCL: Modal = new Modal();
  modalCCL: Modal = new Modal();
  modalImportCL: Modal = new Modal();
  empresa: any;
  es;
  tipo = 'libre';
  procesando:boolean=false;
  constructor(public servidor: Servidor, public empresasService: EmpresasService
    , public translate: TranslateService, private messageService: MessageService) {}

  ngOnInit() {
    this.cl = new Checklist(0, this.empresasService.seleccionada,'', null, null,0,null,null);
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
        this.empresa = emp;
    let params = typeof(emp) == "string" ? emp : emp.id
    let parametros = '&idempresa=' + params;
        //let parametros = '&idempresa=' + seleccionada.id;
        // Llamada al servidor para conseguir las checklists
        this.servidor.getObjects(URLS.CHECKLISTS, parametros).subscribe(
          response => {
            // Ocultar mostrar control checklists
            this.checklistActiva = 0;
            // Vaciar la lista actual
            this.checklists = [];
            this.guardarCL = [];
            //this.checklists.push(this.checklist);
            if (response.success == 'true' && response.data) {
              let orden=0;
              for (let element of response.data) {
                if (element.orden == 0){
                  this.modificarCL(element.id);
                  orden++;
                  }else{orden=parseInt(element.orden);}
                let fecha;
                if (moment.isDate(new Date(element.fecha_)) && element.fecha_ != "0000-00-00"){
                  fecha = new Date(element.fecha_)
                }else{
                  fecha = null;
                }
                this.checklists.push(new Checklist(element.id, element.idempresa, element.nombrechecklist,
                  element.periodicidad, element.tipoperiodo,element.migrado,element.periodicidad2,fecha,orden));
                  this.guardarCL[element.id] = false;
              }
            }
          },
    error => console.log("error getting usuarios en permisos",error),
    ()=>{
      //this.expand();
    }
    );
   }

  nuevaChecklist(cl: Checklist) {

    let fecha;
    (cl.fecha_)? fecha= new Date(Date.UTC(cl.fecha_.getFullYear(), cl.fecha_.getMonth(), cl.fecha_.getDate())): fecha=null;
    let nuevaChecklist = new Checklist(0, this.empresasService.seleccionada,
      cl.nombrechecklist, cl.periodicidad, cl.tipoperiodo,0,this.cl.periodicidad2,fecha,this.newOrdenCL());
    this.servidor.postObject(URLS.CHECKLISTS, nuevaChecklist).subscribe(
      response => {
        // si tiene éxito
        if (response.success) {
          nuevaChecklist.id = response.id;
          this.checklists.push(nuevaChecklist);
          this.checklists = this.checklists.slice();
          this.cl = new Checklist(0, this.empresasService.seleccionada,'', null, null,0,null,null);
          this.setAlerta('alertas.saveOk','success','alertas.tituloAlertaInfo');
        }else{
          this.setAlerta('alertas.saveNotOk','error','alertas.tituloAlertaInfo');
        }
      },
      (error)=>{
        this.setAlerta('alertas.saveNotOk','error','alertas.tituloAlertaInfo');
      });
  }
  newOrdenCL():number{
    let orden;
    if ( this.checklists.length && this.checklists[this.checklists.length-1].orden >0){
      orden = this.checklists[this.checklists.length-1].orden+1;
     }else{
      orden = 0;
     }
     return orden;
  }

  onChecklistSelect(evento){
console.log(evento)
this.checklistActiva = evento.data.id;
this.controlchecklists=[];
this.controlchecklists = this.controlchecklists.slice();
this.mostrarCCL(evento.data.id)
  }


  onEditCL(evento){
    this.modificarCL(evento.data.id);
    } 
  modificarCL(idChecklist: number) {
    this.guardarCL[idChecklist] = true;
    if (!this.alertaGuardar['guardar']){
      this.alertaGuardar['guardar'] = true;
      this.setAlerta('alertas.guardar','warn','alertas.tituloAlertaInfo');
      }
  }
  // modificarCL() {
  //   if (this.checklistActiva !== 0) {
  //     this.modificar = true;
  //   }
  //   this.modCL = this.checklists.find(checklist => checklist.id == this.checklistActiva);
  // }

  actualizarCL(idCL) {

   // let parametros = '?id=' + this.modCL.id;  
   let indice = this.checklists.findIndex((elem)=>elem.id==idCL);
   let parametros = '?id=' + idCL; 
     
  if (this.checklists[indice].fecha_)  this.checklists[indice].fecha_ = new Date(Date.UTC(this.checklists[indice].fecha_.getFullYear(), this.checklists[indice].fecha_.getMonth(), this.checklists[indice].fecha_.getDate()))
    this.checklists[indice].periodicidad2 = this.checklists[indice].periodicidad2;  
  if (this.checklists[indice]["_$visited"]) delete this.checklists[indice]["_$visited"]; 
  console.log(this.checklists[indice]);      
    this.servidor.putObject(URLS.CHECKLISTS, parametros,this.checklists[indice]).subscribe(
      response => {
        if (response.success) {
          this.guardarCL[idCL] = false;
          this.alertaGuardar['guardar'] = false;
          this.setAlerta('alertas.saveOk','success','alertas.tituloAlertaInfo');
        }else{
          this.setAlerta('alertas.saveNotOk','error','alertas.tituloAlertaInfo');
        }
      },
      (error)=>{
        this.setAlerta('alertas.saveNotOk','error','alertas.tituloAlertaInfo');
      });
    this.modificar = false;
  }

  checkBorrarCL(idChecklist:number) {
    this.checklistActiva = idChecklist;
    if (this.checklistActiva !== 0) {
      this.modalCL.titulo = 'borrarChecklistT';
      this.modalCL.subtitulo = 'borrarChecklistST';
      this.modalCL.eliminar = true;
      this.modalCL.visible = true;
    }
  }

  cerrarModalCL(event: boolean) {
    this.modalCL.visible = false;
    if (event) {
      let parametros = '?id=' +  this.checklistActiva;
      this.servidor.deleteObject(URLS.CHECKLISTS, parametros).subscribe(
        response => {
          if (response.success) {
            let clBorrar = this.checklists.find(cl => cl.id == this.checklistActiva);
            let indice = this.checklists.indexOf(clBorrar);
            this.checklists.splice(indice, 1);
            this.checklists = this.checklists.slice();
            this.checklistActiva = 0;                    
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

  mostrarCCL(idChecklist: number) {
   // this.unExpand();
    console.log(idChecklist);
    let parametros = '&idchecklist=' + idChecklist;
    // llamada al servidor para conseguir los controlchecklist
    this.servidor.getObjects(URLS.CONTROLCHECKLISTS, parametros).subscribe(
      response => {
        this.controlchecklists = [];
        this.guardar=[];
        if (response.success && response.data) {
          let orden=0;
          for (let element of response.data) {
            if (element.orden == 0){
              this.modificarCCL(element.id);
              orden++;
              }else{orden=parseInt(element.orden);}
            this.controlchecklists.push(new ControlChecklist(element.id, element.idchecklist,
              element.nombre,element.migrado,orden));
            this.guardar[element.id] = false;
          }
        }
      // mostramos la lista de control checklists
      this.checklistActiva = parseInt(idChecklist.toString());        
    });
  }

  crearCCL(ccl: ControlChecklist) {
    // Limpiar el form
    this.ccl = {};
    let nuevoCCL = new ControlChecklist(0, this.checklistActiva, ccl.nombre,0,this.newOrdenCCL());
    this.servidor.postObject(URLS.CONTROLCHECKLISTS, nuevoCCL).subscribe(
      response => {
        if (response.success) {
          nuevoCCL.id = response.id;
          this.controlchecklists.push(nuevoCCL);
          this.controlchecklists = this.controlchecklists.slice();
          this.setAlerta('alertas.saveOk','success','alertas.tituloAlertaInfo');
        }else{
          this.setAlerta('alertas.saveNotOk','error','alertas.tituloAlertaInfo');
        }
      },
      (error)=>{
        this.setAlerta('alertas.saveNotOk','error','alertas.tituloAlertaInfo');
      });
  }

  newOrdenCCL():number{
    let orden;
    if ( this.controlchecklists.length && this.controlchecklists[this.controlchecklists.length-1].orden >0){
      orden = this.controlchecklists[this.controlchecklists.length-1].orden+1;
     }else{
      orden = 0;
     }
     return orden;
  }

  checkBorrarCCL(idCCL: number) {
    this.idBorrar = idCCL;
    this.modalCCL.titulo = 'borrarControlchecklistT';
    this.modalCCL.subtitulo = 'borrarControlchecklistST';
    this.modalCCL.eliminar = true;
    this.modalCCL.visible = true;
  }

  cerrarModalCCL(event: boolean) {
    this.modalCCL.visible = false;
    if (event) {
      let parametros = '?id=' + this.idBorrar;
      this.servidor.deleteObject(URLS.CONTROLCHECKLISTS, parametros).subscribe(
        response => {
          if (response.success) {
            let cclBorrar = this.controlchecklists.find(ccl => ccl.id == this.idBorrar);
            let indice = this.controlchecklists.indexOf(cclBorrar);
            this.controlchecklists.splice(indice, 1);
            this.controlchecklists = this.controlchecklists.slice();
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

  onEditCCL(evento){
    this.modificarCCL(evento.data.id);
    } 
  modificarCCL(idControlchecklist: number) {
    this.guardar[idControlchecklist] = true;
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
  
  actualizarCCL(idControlchecklist: number) {
    let modControlchecklist = this.controlchecklists.find(controlchecklist => controlchecklist.id == idControlchecklist);
    let parametros = '?id=' +  idControlchecklist;
    this.servidor.putObject(URLS.CONTROLCHECKLISTS, parametros, modControlchecklist).subscribe(
      response => {
        if (response.success =="true") {
          console.log('User updated');
          this.guardar[idControlchecklist] = false;
          this.alertaGuardar['guardar'] = false;
          this.setAlerta('alertas.saveOk','success','alertas.tituloAlertaInfo');
        }else{
          this.setAlerta('alertas.saveNotOk','error','alertas.tituloAlertaInfo');
        }
    },
    (error)=>{
      this.setAlerta('alertas.saveNotOk','error','alertas.tituloAlertaInfo');
    });
  }
  import() {
    if (this.checklistActiva !== 0) {
      this.modalImportCL.titulo = 'Importar Checklist';
      this.modalImportCL.subtitulo = '';
      this.modalImportCL.eliminar = false;
      this.modalImportCL.visible = true;
      this.modalImportCL.importchecklist = true;
    }
  }
  cerrarModalImportCL(event: string | boolean) {
   this.modalImportCL.visible = false;
    if (event) {
    let parametros = '&idchecklist=' + event;
    // llamada al servidor para conseguir los controlchecklist
    this.servidor.getObjects(URLS.CONTROLCHECKLISTS, parametros).subscribe(
      response => {
        if (response.success && response.data) {
          for (let element of response.data) {
            this.crearCCL(new ControlChecklist(0, this.checklistActiva,
              element.nombre));
          }
        }
    });
    }
  }

  setPeriodicidad(periodicidad: string, idItem?: number, i?: number){
    if (!idItem){
    this.cl.periodicidad2 = periodicidad;
    // console.log(this.nuevoItem.periodicidad);
  
    }else{
      // console.log(idItem,i,periodicidad);
      this.modificarCL(idItem);
      let indice = this.checklists.findIndex((item)=>item.id==idItem);
      this.checklists[indice].periodicidad2 = periodicidad;
      // console.log(this.items[indice]);
    }
  }

 
  ordenar(elemento) {
    console.log('ORDENANDO')
    this.procesando = true;
    this.alertaGuardar['ordenar'] = false;
    if (elemento == 'ckecklist'){
      console.log('checklist')
    this.checklists.forEach((item) => {
      console.log('ORDENANDO',item)
      this.actualizarCL(item.id);
    });
    this.checklists = this.checklists.slice();
  }else{
    this.controlchecklists.forEach((item) => {
      this.actualizarCCL(item.id);
    });
    this.controlchecklists = this.controlchecklists.slice();
  }
    this.procesando = false;
  }
  
  editOrden(){
    if (!this.alertaGuardar['ordenar']){
      this.alertaGuardar['ordenar'] = true;
      this.setAlerta('alertas.nuevoOrden','info','alertas.tituloAlertaInfo');
      }
  }


// unExpand(){
//   this.lista.nativeElement.size = 1;
// }
// expand(){
//     let num = this.checklists.length;
//   this.lista.nativeElement.size = num;
// }




}
