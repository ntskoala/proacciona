import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from 'ng2-translate';
import { DataTable, Column } from 'primeng/primeng';
import { Table } from 'primeng/table';
import {Calendar} from 'primeng/primeng';

import { EmpresasService } from '../../services/empresas.service';
import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { Empresa } from '../../models/empresa';
import { Incidencia } from '../../models/incidencia';
import { Modal } from '../../models/modal';
import {MatSelect,MatSnackBar} from '@angular/material';
import * as moment from 'moment';
@Component({
  selector: 'app-incidencias',
  templateUrl: './incidencias.component.html',
  styleUrls: ['./incidencias.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class IncidenciasComponent implements OnInit {

  public modal: Modal = new Modal();
  public procesando:boolean=false;
  //public newIncidencia: Incidencia = new Incidencia(null,this.empresasService.seleccionada,null,new Date,null,null,0,'');
public incidencias: Incidencia[];
public guardar = [];
public alertaGuardar:object={'guardar':false,'ordenar':false};
public idBorrar:number;
public alertas: object[]=[];
public selectedDay: number;
public selectedDayValoracion: number;
public estados = [];
public cols:any[];
public es:any;
public entidad:string="&entidad=incidencias";

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
    if (this.empresasService.seleccionada) this.loadIncidencias(this.empresasService.seleccionada.toString());
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
  this.estados = [{'nombre':'--','valor':0},{'nombre':'Incorrecto','valor':1},{'nombre':'Correcto','valor':2}]
  }


  loadIncidencias(emp: Empresa | string) {
    let params = typeof(emp) == "string" ? emp : emp.id
    let parametros = '&idempresa=' + params+this.entidad;
        //let parametros = '&idempresa=' + seleccionada.id;
        // Llamada al servidor para conseguir las checklists
        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            this.incidencias = [];
            //this.url=[];
            if (response.success == 'true' && response.data) {
              for (let element of response.data) {
                let fecha_Valoracion;
                if (moment(element.fecha_valoracion).isValid()){
                  fecha_Valoracion = moment(new Date(element.fecha_valoracion)).utc().toDate();
                }else{
                  fecha_Valoracion = null;
                }
                this.incidencias.push(new Incidencia(element.id,element.idempresa,element.incidencia,
                  moment(new Date(element.fecha)).utc().toDate(),element.solucion, element.responsable,
                  element.nc,element.origen,element.idOrigen,element.foto,element.valoracion,fecha_Valoracion,element.estado));
                // this.url.push(URLS.DOCS + this.empresasService.seleccionada + '/incidencias/' + element.id +'_'+element.foto);

              }
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
  //  newItem() {
  //   this.newIncidencia.fecha = new Date(Date.UTC(this.newIncidencia.fecha.getFullYear(), this.newIncidencia.fecha.getMonth(), this.newIncidencia.fecha.getDate()))
  //   this.newIncidencia.idempresa = this.empresasService.seleccionada;

  //     this.addItem(this.newIncidencia).then(
  //       (valor)=>{      
  //           this.newIncidencia = new Incidencia(null,this.empresasService.seleccionada,null,new Date,null,null,0);
  //           this.incidencias = this.incidencias.slice();
  //         }
  //     );
  // }
  //  addItem(incidencia: Incidencia){
  //   return new Promise((resolve,reject)=>{
  //   let param = this.entidad;
  //   this.servidor.postObject(URLS.STD_ITEM, incidencia,param).subscribe(
  //     response => {
  //       if (response.success) {
  //         this.incidencias.push(new Incidencia(response.id,incidencia.idempresa,incidencia.incidencia,
  //           incidencia.fecha,incidencia.solucion,incidencia.responsable,incidencia.nc));
  //         resolve(true);
  //       }
  //   },
  //   error =>{
  //     console.log(error);
  //     resolve(true);
  //   },
  //   () =>  {}
  //   );
  // });
  // }
  nuevaIncidenciaCreada(incidencia: Incidencia){
    console.log('incidencia creada',incidencia);
  this.incidencias.push(new Incidencia(incidencia.id,incidencia.idempresa,incidencia.incidencia,
    incidencia.fecha,incidencia.solucion,incidencia.responsable,incidencia.nc,incidencia.origen,incidencia.idOrigen,incidencia.foto,incidencia.valoracion,incidencia.fecha_valoracion,incidencia.estado));
    this.incidencias = this.incidencias.slice();
}


// modificarItem(){
//   this.nuevoNombre = this.planes[this.planes.findIndex((plan)=>plan.id==this.planActivo)].nombre;
// (this.novoPlan)? this.novoPlan = null :this.modificaPlan = !this.modificaPlan;
// }

 saveItem(item: Incidencia,i: number) {
  this.alertaGuardar['guardar'] = false;
  let indice = this.incidencias.findIndex((myitem)=>myitem.id==item.id);
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
              let indice = this.incidencias.findIndex((item) => item.id == this.idBorrar);
             // let indice = this.mantenimientos.indexOf(controlBorrar);
             this.incidencias.splice(indice, 1);
              //this.planActivo = 0;
              this.incidencias = this.incidencias.slice();
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
    if (campo=='fecha_valoracion'){
      this.selectedDayValoracion= new Date(fecha).getDate();
    }else{
    this.selectedDay= new Date(fecha).getDate();
    }
    this.guardar[idItem] = true;
    if (!this.alertaGuardar['guardar']){
      this.alertaGuardar['guardar'] = true;
      this.setAlerta('alertas.guardar');
      }
  }


  // photoURL(i,foto,itemFoto) {
  //  console.log(i,foto,itemFoto);
  //  let index = this.incidencias.findIndex((item)=>item.id==i);
  //   let calc = window.scrollY;
  //   this.top = calc + 'px';
  //   console.log(this.url[index],this.top)
  //   this.verdoc=!this.verdoc;
  //   this.foto = this.url[index];
  // }

  ventanaFoto(incidencia: Incidencia, entidad: string) {
    console.log(incidencia.incidencia);
    this.fotoSrc = URLS.DOCS + this.empresasService.seleccionada + '/'+ entidad + "/" + incidencia.id+ "_"+ incidencia.foto;
    this.modal2 = true;
  }
  cerrarFoto(){
    this.modal2=false;
  }

  uploadImg(event, idItem,i,tipo) {
    console.log(event, idItem,i,tipo)
    let index = this.incidencias.findIndex((item)=>item.id==idItem);
    var target = event.target || event.srcElement; //if target isn't there then take srcElement
    let files = target.files;
    //let files = event.srcElement.files;
    let idEmpresa = this.empresasService.seleccionada.toString();
    this.servidor.postDoc(URLS.UPLOAD_DOCS, files,'incidencias',idItem, this.empresasService.seleccionada.toString(),tipo).subscribe(
      response => {
        console.log('doc subido correctamente',files[0].name);
        this.incidencias[index].foto = files[0].name;
        this.fotoSrc = URLS.DOCS + this.empresasService.seleccionada + '/incidencias/' + this.incidencias[index].id+ "_"+ this.incidencias[index].foto;
        // this.url[i]= URLS.DOCS + this.empresasService.seleccionada + '/incidencias/' +  idItem +'_'+files[0].name;
        // let activa = this.empresas.find(emp => emp.id == this.empresasService.seleccionada);
        // activa.logo = '1';
      }
    )
  }

  expandedRow(evento){
    let incidencia = evento.data;
    console.log(evento);
    this.fotoSrc = URLS.DOCS + this.empresasService.seleccionada + '/incidencias/' + incidencia.id+ "_"+ incidencia.foto;
    
  }

  nuevoEstadoNC($event,item){
    console.log($event);
    item.nc=$event;
    this.itemEdited(item.id)
  }
}
