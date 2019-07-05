import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import {DataTable} from 'primeng/primeng';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from '@ngx-translate/core';

import * as moment from 'moment';

import { EmpresasService } from '../../services/empresas.service';
import { Servidor } from '../../services/servidor.service';
import { Empresa } from '../../models/empresa';
import { URLS,cal } from '../../models/urls';
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
  public clmigrado:number=0;
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
  public alertaGuardar:object={'guardarcheck':false,'guardarcheckcontrol':false,'ordenarcheck':false,'ordenarcheckcontrol':false};  
  
  idBorrar: number;
  modalCL: Modal = new Modal();
  modalCCL: Modal = new Modal();
  modalImportCL: Modal = new Modal();
  empresa: any;
  es;
  public tipo = 'libre';
  procesando:boolean=false;
  public cols:any[];
  public cols2:any[];
  public newRow:boolean=false;
  public newRow2:boolean=false;
  public viewPeriodicidad: any=null;
  public template:boolean=false;
  //***   EXPORT DATA */
public exportar_informes: boolean =false;
public exportando:boolean=false;
public informeData:any;
//***   EXPORT DATA */


  constructor(public servidor: Servidor, public empresasService: EmpresasService
    , public translate: TranslateService, private messageService: MessageService) {}

  ngOnInit() {
    this.cl = new Checklist(0, this.empresasService.seleccionada,'', null, null,0,null,null);
    this.es=cal;
  this.cols = [
    { field: 'nombrechecklist', header: 'Nombre', type: 'std', width:150,orden:false,'required':true },
    { field: 'fecha_', header: 'fecha', type: 'fecha', width:120,orden:false,'required':true },
    { field: 'periodicidad2', header: 'periodicidad', type: 'periodicidad', width:90,orden:false,'required':true }
  ];
  this.cols2 = [
    { field: 'id', header: 'id', type: 'std2', width:10,orden:false,'required':true ,visible:false},
    { field: 'nombre', header: 'Nombre', type: 'std', width:150,orden:false,'required':true,visible:true },
  ];
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
                let periodicidad2='true';
                if (element.periodicidad2.length > 0) periodicidad2 = element.periodicidad2;
                if (element.orden == 0){
                  //this.modificarCL(element.id);
                  this.guardarCL[element.id] = true;
                  orden++;
                  }else{orden=parseInt(element.orden);}
                let fecha;
                if (moment.isDate(new Date(element.fecha_)) && element.fecha_ != "0000-00-00"){
                  fecha = new Date(element.fecha_)
                }else{
                  fecha = null;
                }
                this.checklists.push(new Checklist(element.id, element.idempresa, element.nombrechecklist,
                  element.periodicidad, element.tipoperiodo,element.migrado,periodicidad2,fecha,orden));
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
    return new Promise((resolve)=>{
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
          this.checklistActiva=nuevaChecklist.id;
          this.selectedChecklist=this.checklists[this.checklists.length-1];
          this.setAlerta('alertas.saveOk','success','alertas.tituloAlertaInfo');
          resolve ({"data":response.id});
        }else{
          this.setAlerta('alertas.saveNotOk','error','alertas.tituloAlertaInfo');
          resolve ({"data":0});
        }
      },
      (error)=>{
        this.setAlerta('alertas.saveNotOk','error','alertas.tituloAlertaInfo');
        resolve ({"data":0});
      });
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
console.log(this.selectedChecklist);
this.alertaGuardar['ordenarcheckcontrol'] = false;
this.alertaGuardar['guardarcheckcontrol'] = false;
this.checklistActiva = evento.id;
this.clmigrado = this.checklists[this.checklists.findIndex((cl)=>cl.id==this.checklistActiva)].migrado;
this.controlchecklists=[];
this.controlchecklists = this.controlchecklists.slice();
this.mostrarCCL(evento.id)
  }
  


  onEditCL(evento){
    this.modificarCL(evento.data.id);
    } 
  modificarCL(idChecklist: number) {
    this.guardarCL[idChecklist] = true;
    if (!this.alertaGuardar['guardarcheck']){
      this.alertaGuardar['guardarcheck'] = true;
      this.setAlerta('alertas.guardar','warn','alertas.tituloAlertaInfo');
      }
  }
  // modificarCL() {
  //   if (this.checklistActiva !== 0) {
  //     this.modificar = true;
  //   }
  //   this.modCL = this.checklists.find(checklist => checklist.id == this.checklistActiva);
  // }

  saveAllCL(){
    for (let x=0;x<this.guardarCL.length;x++){
      if (this.guardarCL[x]==true) {
        let indice = this.checklists.findIndex((myitem)=>myitem.id==x);
        console.log ("id",x,this.checklists[indice]);
        this.actualizarCL(this.checklists[indice].id)
      }
    }
  }

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
          this.alertaGuardar['guardarcheck'] = false;
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
            if (this.checklistActiva == parseInt(localStorage.getItem("triggerEntradasMP"))){
              this.quitarTriggerEntradasProducto();
            }
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
  
addTriggerEntradasProducto(idChecklist){
  let param = "&entidad=triggers"
  let trigger={
    'id':null,
    'idempresa':this.empresasService.seleccionada,
    'entidadOrigen':'proveedores_entradas_producto',
    'idOrigen':null,
    'entidadDestino':'checklist',
    'idDestino':idChecklist
  }
  this.servidor.postObject(URLS.STD_ITEM, trigger,param).subscribe(
    response => {
      if (response.success) {
        localStorage.setItem('triggerEntradasMP',idChecklist);
      }
  },
  error =>console.log(error));
}

quitarTriggerEntradasProducto(){
  let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=triggers&WHERE=idDestino="+this.checklistActiva;
  this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
    response => {
      console.log(response);
      if (response.success == 'true' && response.data) {
        for (let element of response.data) {
          if (element.entidadOrigen == 'proveedores_entradas_producto' && element.entidadDestino=='checklist'){
            //localStorage.setItem('triggerEntradasMP',element.id);
            let parametrosDelete = '?id=' + element.id+"&entidad=triggers";
            this.servidor.deleteObject(URLS.STD_ITEM, parametrosDelete).subscribe(
              response => {
                if (response.success) {
                  localStorage.removeItem("triggerEntradasMP");
                  console.log('TRIGGER FUERA');
                }
            });
          }
          }
      }
  },
error =>{
  console.log('hay Trigger servicios entrada' + error);
  });
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
    let orden;
    (ccl.orden>0)?orden=ccl.orden:orden=this.newOrdenCCL();
    let nuevoCCL = new ControlChecklist(0, this.checklistActiva, ccl.nombre,0,orden);
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
    console.log(evento)
    this.modificarCCL(evento.data.id);
    } 
  modificarCCL(idControlchecklist: number) {
    this.guardar[idControlchecklist] = true;
    if (!this.alertaGuardar['guardarcheckcontrol']){
      this.alertaGuardar['guardarcheckcontrol'] = true;
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
  
  saveAllCCL(){
    for (let x=0;x<this.guardar.length;x++){
      if (this.guardar[x]==true) {
        let indice = this.controlchecklists.findIndex((myitem)=>myitem.id==x);
        console.log ("id",x,this.controlchecklists[indice]);
        this.actualizarCCL(this.controlchecklists[indice].id)
      }
    }
  }

  actualizarCCL(idControlchecklist: number) {
    let modControlchecklist = this.controlchecklists.find(controlchecklist => controlchecklist.id == idControlchecklist);
    let parametros = '?id=' +  idControlchecklist;
    this.servidor.putObject(URLS.CONTROLCHECKLISTS, parametros, modControlchecklist).subscribe(
      response => {
        if (response.success =="true") {
          console.log('User updated');
          this.guardar[idControlchecklist] = false;
          this.alertaGuardar['guardarcheckcontrol'] = false;
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
              element.nombre,0,element.orden));
          }
        }
    });
    }
  }

  // setPeriodicidad(periodicidad: string, idItem?: number, i?: number){
  //   if (!idItem){
  //   this.cl.periodicidad2 = periodicidad;
  //   // console.log(this.nuevoItem.periodicidad);
  
  //   }else{
  //     // console.log(idItem,i,periodicidad);
  //     this.modificarCL(idItem);
  //     let indice = this.checklists.findIndex((item)=>item.id==idItem);
  //     this.checklists[indice].periodicidad2 = periodicidad;
  //     // console.log(this.items[indice]);
  //   }
  // }



  setPeriodicidad(periodicidad: string, idChecklist?: number, i?: number){
    this.viewPeriodicidad=null;
    if (!idChecklist){
    this.cl.periodicidad2 = periodicidad;
    console.log(this.cl.periodicidad2);
  
    }else{
      this.modificarCL(idChecklist);
      let indice = this.checklists.findIndex((item)=>item.id==idChecklist);
      this.checklists[indice].periodicidad2 = periodicidad;
      this.cl = new Checklist(0, this.empresasService.seleccionada,'', null, null,0,null,null);

    }
  }
  openPeriodicidad(Control){
    console.log('view Periodicidad Ok',Control);
    if (Control.id == 0){
      this.viewPeriodicidad='true';
    }else{
      this.cl= Control;
      this.viewPeriodicidad=Control.periodicidad2;
    }
  }
  closePeriodicidad(activo){
  if (activo==false){
    this.cl = new Checklist(0, this.empresasService.seleccionada,'', null, null,0,null,null);
    this.viewPeriodicidad=false;
  }
  }
 
  ordenar(elemento) {
    console.log('ORDENANDO')
    this.procesando = true;
   
    if (elemento == 'ckecklist'){
      this.alertaGuardar['ordenarcheck'] = false;
      console.log('checklist')
    this.checklists.forEach((item) => {
      console.log('ORDENANDO',item)
      this.actualizarCL(item.id);
    });
    this.checklists = this.checklists.slice();
  }else{
    this.alertaGuardar['ordenarcheckcontrol'] = false;
    this.controlchecklists.forEach((item) => {
      this.actualizarCCL(item.id);
    });
    this.controlchecklists = this.controlchecklists.slice();
  }
    this.procesando = false;
  }
  

  editOrden(elemento){
    if (elemento == 'ckeck'){
      if (!this.alertaGuardar['ordenarcheck']){ 
        this.setAlerta('alertas.nuevoOrden','info','alertas.tituloAlertaInfo');
        }
      this.alertaGuardar['ordenarcheck'] = true;
    }else{
      if (!this.alertaGuardar['ordenarcheckcontrol']){ 
        this.setAlerta('alertas.nuevoOrden','info','alertas.tituloAlertaInfo');
        }
      this.alertaGuardar['ordenarcheckcontrol'] = true;
    }
  }


// unExpand(){
//   this.lista.nativeElement.size = 1;
// }
// expand(){
//     let num = this.checklists.length;
//   this.lista.nativeElement.size = num;
// }





openNewRow(){
  //this.nuevoMantenimiento =  new MantenimientosMaquina(0,0,'','');
  console.log('newRow',this.newRow);
  this.newRow = !this.newRow;
  }
  closeNewRow(){
    //this.nuevoMantenimiento =  new MantenimientosMaquina(0,0,'','');
    this.newRow = false;
    }
    openNewRow2(){
      //this.nuevoMantenimiento =  new MantenimientosMaquina(0,0,'','');
      console.log('newRow',this.newRow);
      this.newRow2 = !this.newRow2;
      }
      closeNewRow2(){
        //this.nuevoMantenimiento =  new MantenimientosMaquina(0,0,'','');
        this.newRow2 = false;
        }
      //**** EXPORTAR DATA */

  async exportarTable(){
    this.exportando=true;

    this.informeData = await this.ConvertToCSV(this.cols, this.checklists,'Checklists');
  }
  async exportarTableCCL(){
    this.exportando=true;
    //let nomChecklist = this.checklists[this.checklists.findIndex((item)=>item.id==this.checklistActiva)].nombrechecklist;
    let tab; 
    this.translate.get('Controles').subscribe((desc)=>{tab=desc});
    this.informeData = await this.ConvertToCSV(this.cols2, this.controlchecklists,tab + ' ' + this.selectedChecklist.nombrechecklist);
  }
  informeRecibido(resultado){
    console.log('informe recibido:',resultado);
    if (resultado){
      setTimeout(()=>{this.exportando=false},1500)
    }else{
      this.exportando=false;
    }
  }

  ConvertToCSV(controles,objArray,tabla){
    var cabecera =  typeof controles != 'object' ? JSON.parse(controles) : controles;
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    console.log(cabecera,array)
    let informeCabecera=[];
    let informeRows=[];
                var str = '';
                var row = "";
                let titulo="";
                for (var i = 0; i < cabecera.length; i++) {
                  this.translate.get(cabecera[i]["header"]).subscribe((desc)=>{titulo=desc});
                  row += titulo + ';';
                }
                row = row.slice(0, -1);
                informeCabecera = row.split(";");

                str='';
                for (var i = 0; i < array.length; i++) {
                  var line ="";
                   for (var x = 0; x < cabecera.length; x++) {
                  
                    let valor='';
                    
                    switch (cabecera[x]['type']){
                      case 'fecha':
                      valor = moment(array[i][cabecera[x]['field']]).format('DD-MM-YYYY');
                      break;
                      case 'dropdown':
                      valor = (array[i][cabecera[x]['field']]==null)?'':this.getDropDownValor(cabecera[x]['field'], array[i][cabecera[x]['field']]);
                      break;
                      case 'periodicidad':
                      if (array[i][cabecera[x]['field']] && array[i][cabecera[x]['field']].length >1)
                      valor= JSON.parse(array[i][cabecera[x]['field']])["repeticion"];
                      break;
                      default:
                      valor = (array[i][cabecera[x]['field']]==null)?'':array[i][cabecera[x]['field']];
                      break;
                    }

                  line += valor + ';';
                }
                line = line.slice(0,-1);

                    informeRows.push(line.split(";"));
    
                }
                let informe='';
                this.translate.get(tabla).subscribe((desc)=>{informe=desc});
                return {'cabecera':[informeCabecera],'rows':informeRows,'comentarios':[],'informes':informe};
    }

    getDropDownValor(tabla,valor){
      let Value;
      switch (tabla){
        case "superuser":
        break;
        case "tipouser":
        break;
      }
      console.log(tabla,valor,Value);
      return Value;
    }


newTemplateSelected(template){
     template.fecha_=new Date();
     this.template=null;
     this.cl.periodicidad2=template.periodicidad2;
      console.log(template.nombrechecklist,template.periodicidad2,template.fecha_);
      let templateCL = new Checklist(0,0,template.nombrechecklist,template.periodicidad,template.tipoperiodo,template.migrado,template.periodicidad2,template.fecha_,template.orden);
    this.nuevaChecklist(templateCL).then(
      (resultado)=>{
        console.log(resultado);
        if (resultado["data"] > 0){
        this.checklistActiva = resultado["data"];
        this.addTriggerEntradasProducto(resultado["data"]);
        console.log(this.checklists.length,this.checklists,this.checklistActiva);
        this.cerrarModalImportCL(template.id);
        }
      }
    );
    }

}
