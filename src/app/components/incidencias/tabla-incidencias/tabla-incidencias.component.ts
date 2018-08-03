import { Component, OnInit, OnChanges, ViewEncapsulation, Output, Input, EventEmitter, ViewChild } from '@angular/core';
import { Router ,ActivatedRoute, ParamMap  } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from 'ng2-translate';
import { DataTable, Column } from 'primeng/primeng';
import { Table } from 'primeng/table';
import {Calendar} from 'primeng/primeng';

import { EmpresasService } from '../../../services/empresas.service';
import { Servidor } from '../../../services/servidor.service';
import { URLS } from '../../../models/urls';
import { Usuario } from '../../../models/usuario';

import { Empresa } from '../../../models/empresa';
import { Incidencia } from '../../../models/incidencia';
import { Modal } from '../../../models/modal';
import {MatSelect,MatSnackBar} from '@angular/material';
import * as moment from 'moment';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-tabla-incidencias',
  templateUrl: './tabla-incidencias.component.html',
  styleUrls: ['./tabla-incidencias.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TablaIncidenciasComponent implements OnInit,OnChanges {
@Output() incidenciasCargadas: EventEmitter<Incidencia[]> = new EventEmitter<Incidencia[]>();
@ViewChild('dt') tablaIncidencias: Table;
@Input() nuevaIncidenciaFromIncidencias: Incidencia;
@Input() IncidenciaModificadaFromCalendar: Incidencia;
  public modal: Modal = new Modal();
  public procesando:boolean=false;
  //public newIncidencia: Incidencia = new Incidencia(null,this.empresasService.seleccionada,null,new Date,null,null,0,'');
public incidencias: Incidencia[];
public selectedItem: Incidencia;
public usuarios: Usuario[];
public tablaPosition=0;
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
public modo:string='';
  constructor(public servidor: Servidor, public empresasService: EmpresasService, public sanitizer: DomSanitizer
    , public translate: TranslateService, private messageService: MessageService, public router: Router,
  public route: ActivatedRoute) { }

  ngOnInit() {
    if (this.empresasService.seleccionada) this.loadSupervisores();
    this.es = {
      monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
          'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      dayNames: ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'],
      dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
      dayNamesMin: ["Do","Lu","Ma","Mi","Ju","Vi","Sa"],
      firstDayOfWeek: 1
  }; 

  //   this.cols = [
  //     { field: 'incidencia', header: 'Incidencia' },
  //     {field: 'fecha', header: 'Fecha' },
  //     { field: 'solucion', header: 'Solucion' },
  //     { field: 'responsable', header: 'Responsable' },
  //     { field: 'nc', header: 'No conformidad' },
  //     { field: 'foto', header: 'Foto' }
  // ];

    this.cols = [
      { field: 'incidencia', header: 'Incidencia' },
      {field: 'fecha', header: 'Fecha' },
      { field: 'descripcion', header: 'Descripción' },
      { field: 'solucion', header: 'Solución' },
      { field: 'responsable', header: 'Responsable' },
      { field: 'estado', header: 'Estado' },
      { field: 'origen', header: 'Origen' },
      { field: 'responsable_cierre', header: 'Responsable cierre' },
      { field: 'fecha_cierre', header: 'Fecha cierre' }
  ];

  this.estados = [{'nombre':'sin definir','valor':-1},{'nombre':'no aplica','valor':0},{'nombre':'abierto','valor':1},{'nombre':'cerrado','valor':2}]
  window.scrollTo(0, 0)
}
test(item: Incidencia){


}
  ngOnChanges(){
    if (this.selectedItem) this.selectedItem = null;
    console.log('nueva:',this.nuevaIncidenciaFromIncidencias,'modificada:',this.IncidenciaModificadaFromCalendar);
    if (this.nuevaIncidenciaFromIncidencias){
      
    this.incidencias.push(this.nuevaIncidenciaFromIncidencias)
    this.incidencias = this.incidencias.slice();
    let index = this.incidencias.findIndex((incidencia)=>incidencia.id==this.nuevaIncidenciaFromIncidencias.id);
    this.incidencias[index].responsable_cierre =this.nuevaIncidenciaFromIncidencias.responsable_cierre;
    this.incidencias[index].responsable =this.nuevaIncidenciaFromIncidencias.responsable.toString();
    this.incidencias[index].estado =this.nuevaIncidenciaFromIncidencias.estado.toString();
    this.nuevaIncidenciaFromIncidencias = null;
    this.incidencias = this.incidencias.slice();
    this.selectedItem = this.incidencias[index];
    }
    if (this.IncidenciaModificadaFromCalendar){
    // let indice = this.incidencias.findIndex((item)=>item.id==this.IncidenciaModificadaFromCalendar.id);
    //   this.incidencias[indice]=this.IncidenciaModificadaFromCalendar;     
    console.log(this.IncidenciaModificadaFromCalendar)
      let index = this.incidencias.findIndex((incidencia)=>incidencia.id==this.IncidenciaModificadaFromCalendar.id);
      this.incidencias[index].responsable_cierre =this.IncidenciaModificadaFromCalendar.responsable_cierre;
      this.incidencias[index].responsable =this.IncidenciaModificadaFromCalendar.responsable;
      this.incidencias[index].estado =this.IncidenciaModificadaFromCalendar.estado.toString();
      this.IncidenciaModificadaFromCalendar = null;
      this.incidencias = this.incidencias.slice();
    }
  }
  loadSupervisores(){
    let params = this.empresasService.seleccionada;
    let parametros2 = "&entidad=usuarios"+'&idempresa=' + params;
        this.servidor.getObjects(URLS.STD_ITEM, parametros2).subscribe(
          response => {
            this.usuarios = [];
            if (response.success && response.data) {
              console.log(response.data)
              for (let element of response.data) {  
                  this.usuarios.push(new Usuario(
                    element.id,element.usuario,element.password,element.tipouser,element.email,element.idempresa
                  ));
             }
             console.log(this.usuarios)
        this.loadIncidencias(this.empresasService.seleccionada.toString());
            // this.localSupervisor = this.findSupervisor(this.empresasService.userId);
            }
        });
}


  loadIncidencias(emp: Empresa | string) {
    let params = typeof(emp) == "string" ? emp : emp.id
    let parametros = '&idempresa=' + params+this.entidad+'&order=id DESC';
        //let parametros = '&idempresa=' + seleccionada.id;
        // Llamada al servidor para conseguir las checklists
        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            this.incidencias = [];
            if (response.success == 'true' && response.data) {
              for (let element of response.data) {
                let fecha:Date;
                let fechaCierre:Date;
                if (moment(element.fecha).isValid()) fecha = moment(new Date(element.fecha)).utc().toDate();              
                if (moment(element.fecha_cierre).isValid()) fechaCierre = moment(new Date(element.fecha_cierre)).utc().toDate();
                this.incidencias.push(new Incidencia(element.id,element.idempresa,element.incidencia,element.responsable,
                  fecha,element.responsable_cierre,
                  fechaCierre,element.solucion,
                  element.nc,element.origen,element.idOrigen,element.origenasociado,element.idOrigenasociado,element.foto,
                  element.descripcion,element.estado));
              }
              this.incidenciasCargadas.emit(this.incidencias);
              this.incidenciaSelection();
            }
          },
              (error) => {console.log(error)},
              ()=>{

              }
        );
   }

  incidenciaSelection(){
    let params = this.route.paramMap["source"]["_value"];
        if (params["modulo"] == "incidencias" && params["id"]){
            let idOrigen =params["id"];
            let index = this.incidencias.findIndex((item)=>item.id==idOrigen);
            this.selectedItem = this.incidencias[index]
            console.log('***_',index,this.selectedItem,idOrigen)
          }
  }



  onRowSelect(evento, tabla: Table){
    console.log('****ROWSELECTED',evento,this.selectedItem)
    if (this.selectedItem){
    console.log('****ROWSELECTED',evento,tabla.value.findIndex((item)=>item.id==this.selectedItem.id))
    let index =tabla.value.findIndex((item)=>item.id==this.selectedItem.id);
   this.tablaPosition = index;
    }
  }

   changeItem(event,idItem:number,fuente:string){
console.log(event);
    // if (fuente == 'responsable'){
    //   let index = this.incidencias.findIndex((incidencia)=>incidencia.id==idItem);
    //   if (this.incidencias[index].responsable_cierre == 0 || isNullOrUndefined(this.incidencias[index].responsable_cierre)) this.incidencias[index].responsable_cierre = event.value;
    // }
    this.itemEdited(idItem);
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
    incidencia.responsable,incidencia.fecha,incidencia.responsable_cierre,incidencia.fecha_cierre,
    incidencia.solucion,incidencia.nc,incidencia.origen,incidencia.idOrigen,incidencia.origenasociado,
    incidencia.idOrigenasociado,incidencia.foto,incidencia.descripcion,incidencia.estado));
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
    console.log(tabla);
    
    this.modo="export";
    let origin_Value = tabla.value;
    let mitabla: Table = tabla;
    //  let mitabla = new Table(tabla.el,tabla.domHandler,tabla.objectUtils,tabla.zone,tabla.tableService);
    //  mitabla.value = origin_Value;
    //  mitabla.columns = tabla.columns;
    mitabla.value.map((incidencia)=>{
        // (moment(incidencia.fecha).isValid())?incidencia.fecha = moment(incidencia.fecha).format("DD/MM/YYYY hh:mm"):'';
        // (moment(incidencia.fecha_cierre).isValid() && incidencia.fecha_cierre !== undefined)?incidencia.fecha_cierre = moment(incidencia.fecha_cierre).format("DD/MM/YYYY hh:mm"):'';
        (moment(incidencia.fecha).isValid())?incidencia.fecha = moment(incidencia.fecha).toJSON():'';
        (moment(incidencia.fecha_cierre).isValid() && incidencia.fecha_cierre !== undefined)?incidencia.fecha_cierre = moment(incidencia.fecha_cierre).toJSON():'';
        let indice_responsable = this.usuarios.findIndex((usuario)=>usuario.id==incidencia.responsable);
        if (indice_responsable > -1)  incidencia.responsable = this.usuarios[indice_responsable].usuario;
        let indice_responsable_cierre = this.usuarios.findIndex((usuario)=>usuario.id==incidencia.responsable_cierre);
        if (indice_responsable_cierre > -1) incidencia.responsable_cierre = this.usuarios[indice_responsable_cierre].usuario;
        if (parseInt(incidencia.estado)>=-1)  incidencia.estado=this.estados[this.estados.findIndex((estado)=>parseInt(estado.valor)==incidencia.estado)]["nombre"]
        });

    mitabla.csvSeparator = ";";
    mitabla.exportFilename = "Incidencias";
    mitabla.exportCSV();
  tabla.value = origin_Value;
  tabla._value = origin_Value;

   // tabla.value = origin_Value;
   this.modo="normal";
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

  gotoOrigen(item){
    console.log('goto Origen',item);
    let url = 'empresas/'+ this.empresasService.seleccionada + '/'+ item.origenasociado +'/'+item.idOrigenasociado+'/'+item.idOrigen
    //let cleanUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);

    this.router.navigate([url]);
    // this.router.navigateByUrl(url).then(
    //   (ok)=>{console.log('ok',ok)}
    // ).catch(
    //   (error)=>{console.log('ERROR:',error)}
    // )
  }

  getColor(estado){
    switch(estado){
      case "-1":
      return '#673ab7';
      case "0":
      return '#cccccc';
      case "1":
      return 'red';
      case "2":
      return '#33cc33';

    }
  }
}

