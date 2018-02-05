import { Component, OnInit, OnChanges, ViewEncapsulation, Input } from '@angular/core';

import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from 'ng2-translate';
import { DataTable, Column } from 'primeng/primeng';
import { Table } from 'primeng/table';
import {Calendar} from 'primeng/primeng';

import { EmpresasService } from '../../../services/empresas.service';
import { Servidor } from '../../../services/servidor.service';
import { URLS } from '../../../models/urls';
import { Empresa } from '../../../models/empresa';
import { IncidenciaAccionesNC } from '../../../models/incidencia';
import { Modal } from '../../../models/modal';
import {MdSelect,MdSnackBar} from '@angular/material';
import * as moment from 'moment';

@Component({
  selector: 'app-gestion-incidencia',
  templateUrl: './gestion-incidencia.component.html',
  styleUrls: ['./gestion-incidencia.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class GestionIncidenciaComponent implements OnInit, OnChanges {
@Input() idIncidencia:number;

  public modal: Modal = new Modal();
  public procesando:boolean=false;
public newAccionIncidencia: IncidenciaAccionesNC = new IncidenciaAccionesNC(null,this.idIncidencia,new Date,null,null,null,0);
public incidencias_nc: IncidenciaAccionesNC[];
public guardar = [];
public alertaGuardar:object={'guardar':false,'ordenar':false};
public idBorrar:number;
public alertas: object[]=[];
public selectedDay: number;
public selectedDay_Termini: number;
public cols:any[];
public es:any;
public entidad:string="&entidad=incidencias_nc";
public field:string="&field=idIncidencia&idItem=";
//FOPTO
public fotoSrc: string;
public modal2: boolean = false;;
public verdoc: boolean = false;
// public url=[];
public foto:string;
public top:string;

  constructor(public servidor: Servidor, public empresasService: EmpresasService
    , public translate: TranslateService, private messageService: MessageService) { }

  ngOnInit() {
   // if (this.empresasService.seleccionada) this.loadIncidencias(this.empresasService.seleccionada.toString());
    this.es = {
      monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
          'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      dayNames: ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'],
      dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
      dayNamesMin: ["Do","Lu","Ma","Mi","Ju","Vi","Sa"],
      firstDayOfWeek: 1
  }; 
    this.cols = [
      { field: 'incidencia', header: 'Incidencia' },
      {field: 'fecha', header: 'Fecha' },
      { field: 'solucion', header: 'Solucion' },
      { field: 'responsable', header: 'Responsable' },
      { field: 'nc', header: 'No conformidad' },
      { field: 'foto', header: 'Foto' }
  ];
  }

  ngOnChanges(){
    console.log('Changes, id: ',this.idIncidencia);
    if (this.idIncidencia) this.loadIncidencias(this.empresasService.seleccionada.toString());
   }


  loadIncidencias(emp: Empresa | string) {
    let params = typeof(emp) == "string" ? emp : emp.id
    let parametros = '&idempresa=' + params+this.entidad+this.field+this.idIncidencia;
        //let parametros = '&idempresa=' + seleccionada.id;
        // Llamada al servidor para conseguir las checklists
        this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
          response => {
            this.incidencias_nc = [];
            //this.url=[];
            if (response.success == 'true' && response.data) {
              for (let element of response.data) {
                this.incidencias_nc.push(new IncidenciaAccionesNC(element.id,element.idIncidencia,
                  moment(new Date(element.fecha)).utc().toDate(),element.accion,element.fecha_termini,element.responsable,element.estdo));
                // this.url.push(URLS.DOCS + this.empresasService.seleccionada + '/incidencias/' + element.id +'_'+element.foto);

              }
              console.log(this.incidencias_nc);
            }
          },
              (error) => {console.log(error)},
              ()=>{
              }
        );
   }



   itemEdited(idItem: number, fecha?: any) {

    this.guardar[idItem] = true;
    if (!this.alertaGuardar['guardar']){
      this.alertaGuardar['guardar'] = true;
      this.setAlerta('alertas.guardar');
      }
  }
// ngOnChanges(changes:SimpleChange) {}
onEdit(evento){
  console.log(evento)
  if (!this.alertaGuardar['guardar']){
    this.alertaGuardar['guardar'] = true;
    this.setAlerta('alertas.guardar');
    }
  this.guardar[evento.data.id]= true;
}

setAlerta(concept:string){
  let concepto;
  this.translate.get(concept).subscribe((valor)=>concepto=valor)  
  this.messageService.clear();this.messageService.add(
    {severity:'warn', 
    summary:'Info', 
    detail: concepto
    }
  );
}

   newItem() {
    this.newAccionIncidencia.fecha = new Date(Date.UTC(this.newAccionIncidencia.fecha.getFullYear(), this.newAccionIncidencia.fecha.getMonth(), this.newAccionIncidencia.fecha.getDate()))
    this.newAccionIncidencia.idIncidencia = this.idIncidencia;

      this.addItem(this.newAccionIncidencia).then(
        (valor)=>{      
            this.newAccionIncidencia =  new IncidenciaAccionesNC(null,this.idIncidencia,new Date,null,null,null,0);
            this.incidencias_nc = this.incidencias_nc.slice();
          }
      );
  }
   addItem(incidencia: IncidenciaAccionesNC){
    return new Promise((resolve,reject)=>{
    let param = this.entidad;
    this.servidor.postObject(URLS.STD_ITEM, incidencia,param).subscribe(
      response => {
        if (response.success) {
          this.incidencias_nc.push(new IncidenciaAccionesNC(response.id,incidencia.idIncidencia,
            incidencia.fecha,incidencia.accion,incidencia.fecha_termini,incidencia.responsable,incidencia.estado));
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
  nuevaIncidenciaCreada(incidencia: IncidenciaAccionesNC){
    console.log('incidencia creada',incidencia);
  this.incidencias_nc.push(new IncidenciaAccionesNC(incidencia.id,incidencia.idIncidencia,
    incidencia.fecha,incidencia.accion,incidencia.fecha_termini,incidencia.responsable,incidencia.estado));
    this.incidencias_nc = this.incidencias_nc.slice();
}


// modificarItem(){
//   this.nuevoNombre = this.planes[this.planes.findIndex((plan)=>plan.id==this.planActivo)].nombre;
// (this.novoPlan)? this.novoPlan = null :this.modificaPlan = !this.modificaPlan;
// }

 saveItem(item: IncidenciaAccionesNC,i: number) {
  this.alertaGuardar['guardar'] = false;
  let indice = this.incidencias_nc.findIndex((myitem)=>myitem.id==item.id);
    this.guardar[item.id] = false;
    let parametros = '?id=' + item.id+this.entidad;    
    item.fecha = new Date(Date.UTC(item.fecha.getFullYear(), item.fecha.getMonth(), item.fecha.getDate(), item.fecha.getHours(), item.fecha.getMinutes()));
    console.log(item,i);
    this.servidor.putObject(URLS.STD_ITEM, parametros, item).subscribe(
      response => {
        if (response.success) {
          console.log('item updated');
        }
    });
  }

  checkBorrar(idBorrar: number) {
    // Guardar el id del control a borrar
    this.idBorrar = idBorrar;
    // Crea el modal
    this.modal.titulo = 'borrarIncidenciaT';
    this.modal.subtitulo = 'borrarIncidenciaST';
    this.modal.eliminar = true;
    this.modal.visible = true;
  }
    cerrarModal(event: boolean) {
      this.modal.visible = false;
      if (event) {
        let parametros = '?id=' + this.idBorrar+this.entidad;
        this.servidor.deleteObject(URLS.STD_ITEM, parametros).subscribe(
          response => {
            if (response.success) {
              let indice = this.incidencias_nc.findIndex((item) => item.id == this.idBorrar);
             // let indice = this.mantenimientos.indexOf(controlBorrar);
             this.incidencias_nc.splice(indice, 1);
              //this.planActivo = 0;
              this.incidencias_nc = this.incidencias_nc.slice();
              //this.planSeleccionado.emit(this.planes[0]);
            }
        });
      }
    }
  
  // eliminaIncidencia(){
  //       this.modal.titulo = 'borrarControlT';
  //     this.modal.subtitulo = 'borrarControlST';
  //     this.modal.eliminar = true;
  //     this.modal.visible = true;
  // }


  exportData(tabla: Table){
    console.log(tabla.value);
    let origin_Value = tabla.value;
//  tab._value.
    let mitabla: Table = tabla;
    //tabla._value = tabla.da
    mitabla.value.map((incidencia)=>{
        (moment(incidencia.fecha).isValid())?incidencia.fecha = moment(incidencia.fecha).format("DD/MM/YYYY hh:mm"):'';
        });
  
    mitabla.csvSeparator = ";";
    mitabla.exportFilename = "Incidencias";
    mitabla.exportCSV();
  tabla.value = origin_Value;
   // tabla.value = origin_Value;
  }

  okDate(cal:Calendar){
    cal.overlayVisible = false;
  }
  itemDateEdited(idItem: number, fecha: any,evento:any,campo:string) {
    console.log(evento);
    if (campo=='fecha'){
    this.selectedDay= new Date(fecha).getDate();
    }else{
    this.selectedDay_Termini= new Date(fecha).getDate();
    }
    this.guardar[idItem] = true;
    if (!this.alertaGuardar['guardar']){
      this.alertaGuardar['guardar'] = true;
      this.setAlerta('alertas.guardar');
      }
  }



 

}

