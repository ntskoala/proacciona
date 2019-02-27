import { Component, OnInit, OnChanges, ViewEncapsulation, Output, Input, EventEmitter, ViewChild } from '@angular/core';
import { Router ,ActivatedRoute, ParamMap  } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from '@ngx-translate/core';
import { DataTable, Column } from 'primeng/primeng';
import { Table } from 'primeng/table';
import {Calendar} from 'primeng/primeng';

import { EmpresasService } from '../../../services/empresas.service';
import { Servidor } from '../../../services/servidor.service';
import { URLS,cal } from '../../../models/urls';
import { Usuario } from '../../../models/usuario';
import { server } from '../../../../environments/environment';

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
public newIncidencia: Incidencia = new Incidencia(null,this.empresasService.seleccionada,null,this.empresasService.userId,new Date,null,null,null,null,'Incidencias',0,null,0,'','',null);

public selectedItem: Incidencia;
public usuarios: object[];
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
public uploadFoto: any;
public fotoSrc: string;
public modal2: boolean = false;;
public verdoc: boolean = false;
// public url=[];
public foto:string;
public top:string;
public modo:string='';
//************** */
//************** */
public expanded:boolean=false;
public currentExpandedId: number;
public newRow:boolean=false;
//***   EXPORT DATA */
public exportar_informes: boolean =false;
public exportando:boolean=false;
public informeData:any;
//***   EXPORT DATA */


  constructor(public servidor: Servidor, public empresasService: EmpresasService, public sanitizer: DomSanitizer
    , public translate: TranslateService, private messageService: MessageService, public router: Router,
  public route: ActivatedRoute) { }

  ngOnInit() {
    if (this.empresasService.seleccionada) this.loadSupervisores();
    this.es=cal;

    this.cols = [
      { field: 'incidencia', header: 'incidencia.incidencia', type: 'std', width:160,orden:true,'required':true  },
      {field: 'fecha', header: 'Fecha', type: 'fecha', width:120,orden:true,'required':true  },
      // { field: 'descripcion', header: 'Descripción', type: 'std', width:160,orden:true,'required':true  },
      // { field: 'solucion', header: 'Solución', type: 'std', width:160,orden:true,'required':true  },
      { field: 'responsable', header: 'Responsable', type: 'dropdown', width:130,orden:false,'required':true ,'disabled':true },
      { field: 'estado', header: 'Estado', type: 'dropdown', width:130,orden:false,'required':false  },
      { field: 'origen', header: 'Origen', type: 'trad', width:130,orden:false,'required':true  },
      { field: 'responsable_cierre', header: 'incidencia.r_cierre', type: 'dropdown', width:130,orden:false,'required':false,'disabled':false   },
      { field: 'fecha_cierre', header: 'incidencia.fecha_cierre', type: 'fecha', width:120,orden:true,'required':true  }
  ];

  if (localStorage.getItem("idioma")=="cat") {
  }
  this.translate.get(['incidencia.estado-1','incidencia.estado0','incidencia.estado1','incidencia.estado2']).subscribe((respuesta)=>{
    console.log(respuesta);
    this.estados = [{'label':respuesta['incidencia.estado-1'],'value':-1},{'label':respuesta['incidencia.estado0'],'value':0},{'label':respuesta['incidencia.estado1'],'value':1},{'label':respuesta['incidencia.estado2'],'value':2}]
    window.scrollTo(0, 0)
  })
  // this.estados = [{'nombre':'sin definir','valor':-1},{'nombre':'no aplica','valor':0},{'nombre':'abierto','valor':1},{'nombre':'cerrado','valor':2}]
  // window.scrollTo(0, 0)
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

  getOptions(option){
    //console.log('*****',option);
    switch (option[0]){
    case 'estado':
    return this.estados;
    break;
    case 'responsable_cierre':
    return this.usuarios;
    break;
    case 'responsable':
    return this.usuarios;
    break;
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
                  // this.usuarios.push(new Usuario(
                  //   element.id,element.usuario,element.password,element.tipouser,element.email,element.idempresa
                  // ));
                  this.usuarios.push({label:element.usuario,value:element.id})
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



newItem() {
  this.newIncidencia.fecha = new Date(Date.UTC(this.newIncidencia.fecha.getFullYear(), this.newIncidencia.fecha.getMonth(), this.newIncidencia.fecha.getDate(), this.newIncidencia.fecha.getHours(), this.newIncidencia.fecha.getMinutes()))
  this.newIncidencia.fecha_cierre = null;//new Date(Date.UTC(this.newIncidencia.fecha_cierre.getFullYear(), this.newIncidencia.fecha_cierre.getMonth(), this.newIncidencia.fecha_cierre.getDate(), this.newIncidencia.fecha_cierre.getHours(), this.newIncidencia.fecha_cierre.getMinutes()))
  this.newIncidencia.idempresa = this.empresasService.seleccionada;
  this.newIncidencia.responsable = this.empresasService.userId;
  this.newIncidencia.estado=-1;
    this.addItem(this.newIncidencia).then(
      (valor)=>{      
        console.log(valor);
        this.sendMaiolAviso(this.newIncidencia);
        //this.nuevaIncidenciaCreada.emit(this.newIncidencia);
        let id= this.newIncidencia.id;
        this.incidencias.push(this.newIncidencia);
        this.newIncidencia = new Incidencia(null,this.empresasService.seleccionada,null,this.empresasService.userId,new Date,null,null,null,null,'Incidencias',0,null,0,'','',null);
          // this.newIncidencia = new Incidencia(null,this.empresasService.seleccionada,null,new Date,null,null,0);
       this.incidencias = this.incidencias.slice();

        }
    );
}

 addItem(incidencia: Incidencia){
  return new Promise((resolve,reject)=>{
    console.log(incidencia)
  let param = this.entidad;
  this.servidor.postObject(URLS.STD_ITEM, incidencia,param).subscribe(
    response => {
      if (response.success) {
        this.newIncidencia.id = response.id;
        if (this.newIncidencia.foto && this.uploadFoto) this.uploadImgNewIncidencia(this.uploadFoto,response.id,'foto');
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
  





    sendMaiolAviso(nuevaIncidencia: Incidencia){
      console.log(this.usuarios,nuevaIncidencia)
      let responsable;
    if (nuevaIncidencia.responsable == 109 || this.empresasService.administrador){
    responsable = "admin";
    }else{
      this.usuarios[this.usuarios.findIndex((responsable)=>responsable["value"] == nuevaIncidencia.responsable)]["label"];
    }
      let body = "Nueva incidencia creada desde " + nuevaIncidencia.origen + "<BR>Por: " +  responsable;
      body +=   "<BR>Con fecha y hora: " + moment(nuevaIncidencia.fecha).format('DD-MM-YYYY hh-mm') +  "<BR>"
      body +=   "<BR>Nombre: " + nuevaIncidencia.incidencia +  "<BR>"
      body +=   "Descripción: " + (nuevaIncidencia.descripcion)? nuevaIncidencia.descripcion:"";
      body +=    "<BR>Solución inmediata propuesta: " + (nuevaIncidencia.solucion)? nuevaIncidencia.solucion:"";
      body +=   "<BR>Se requiere seguimiento y cierre de la incidencia."
      // body +=    "<BR>Ir a la incidencia: https://tfc.proacciona.es.com/empresas/"+ this.empresasService.seleccionada +"/incidencias/0/" + nuevaIncidencia.id + ""
      //body +=    "<BR>Ir a la incidencia: "+server+ this.empresasService.seleccionada +"/incidencias/0/" + nuevaIncidencia.id + ""
    
      if (nuevaIncidencia.origen != 'incidencias'){}
      // body +=    "<BR>Ir al elemento https://tfc.proacciona.es/empresas/"+ this.empresasService.seleccionada +"/"+ nuevaIncidencia.origenasociado +"/"+ nuevaIncidencia.idOrigenasociado +"/" + nuevaIncidencia.idOrigen + ""
      //body +=    "<BR>Ir al elemento "+ server + this.empresasService.seleccionada +"/"+ nuevaIncidencia.origenasociado +"/"+ nuevaIncidencia.idOrigenasociado +"/" + nuevaIncidencia.idOrigen + ""
      let link = encodeURI(server)+"%23%2Fempresas%2F"+ this.empresasService.seleccionada +"%2Fincidencias%2F0%2F" + nuevaIncidencia.id + ""
      let parametros2 = "&body="+body+'&idempresa=' + this.empresasService.seleccionada + "&uri="+encodeURI(link);
          this.servidor.getObjects(URLS.ALERTES, parametros2).subscribe(
            response => {
              if (response.success && response.data) {
                console.log(response.data)
              }
          });
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
        let indice_responsable = this.usuarios.findIndex((usuario)=>usuario["value"]==incidencia.responsable);
        if (indice_responsable > -1)  incidencia.responsable = this.usuarios[indice_responsable]["label"];
        let indice_responsable_cierre = this.usuarios.findIndex((usuario)=>usuario["value"]==incidencia.responsable_cierre);
        if (indice_responsable_cierre > -1) incidencia.responsable_cierre = this.usuarios[indice_responsable_cierre]["label"];
        if (parseInt(incidencia.estado)>=-1)  incidencia.estado=this.estados[this.estados.findIndex((estado)=>parseInt(estado.valor)==incidencia.estado)]["label"]
        });

    mitabla.csvSeparator = ";";
    mitabla.exportFilename = "Incidencias";
    mitabla.exportCSV();
  tabla.value = origin_Value;
  tabla._value = origin_Value;
   // tabla.value = origin_Value;
   this.modo="normal";
   this.loadSupervisores();
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

  setImg(event){
    this.uploadFoto = event;
    var target = event.target || event.srcElement; //if target isn't there then take srcElement
    let files = target.files;
    this.newIncidencia.foto = files[0].name;
    console.log(this.newIncidencia.foto);
  }
  uploadImgNewIncidencia(event, idItem,tipo) {
    console.log(event, idItem,tipo)
    var target = event.target || event.srcElement; //if target isn't there then take srcElement
    let files = target.files;
    let idEmpresa = this.empresasService.seleccionada.toString();
    this.servidor.postDoc(URLS.UPLOAD_DOCS, files,'incidencias',idItem, this.empresasService.seleccionada.toString(),tipo).subscribe(
      response => {
        this.newIncidencia.foto = files[0].name;
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






rowExpanded(evento){
  console.log(evento)
  this.currentExpandedId = evento.data.id;
  this.expanded=true;
}
rowCollapsed(evento){
  console.log(evento)
  this.expanded=false;
}





openNewRow(){
  //this.nuevoMantenimiento =  new MantenimientosMaquina(0,0,'','');
  console.log('newRow',this.newRow);
  this.newRow = !this.newRow;
  }
  closeNewRow(){
    //this.nuevoMantenimiento =  new MantenimientosMaquina(0,0,'','');
    this.newRow = false;
    }

      //**** EXPORTAR DATA */

      async exportarTable(){
        this.exportando=true;
        this.informeData = await this.ConvertToCSV(this.cols, this.incidencias);
      }
    
      informeRecibido(resultado){
        console.log('informe recibido:',resultado);
        if (resultado){
          setTimeout(()=>{this.exportando=false},1500)
        }else{
          this.exportando=false;
        }
      }
    
      ConvertToCSV(controles,objArray){
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
                          if (moment(array[i][cabecera[x]['field']]).isValid())
                          valor = moment(array[i][cabecera[x]['field']]).format('DD-MM-YYYY');
                          break;
                          case 'dropdown':
                          valor = (array[i][cabecera[x]['field']]==null)?'':this.getDropDownValor(cabecera[x]['field'], array[i][cabecera[x]['field']]);
                          break;
                          case 'periodicidad':
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
                    this.translate.get('Incidencias').subscribe((desc)=>{informe=desc});
                    return {'cabecera':[informeCabecera],'rows':informeRows,'comentarios':[],'informes':informe};
        }
    
        getDropDownValor(tabla,valor){
          console.log(tabla,valor);
          let Value ='';
          let index;
          switch (tabla){
            case 'estado':
            index=this.estados.findIndex((sup)=>sup["value"]==valor);
            if (index>-1)
            Value = this.estados[index]["label"];
            break;
            case 'idsupervisor':
            index=this.usuarios.findIndex((user)=>user["value"]==valor);
            if (index>-1)
            Value = this.usuarios[index]["label"];
            break;
            }
          console.log(tabla,valor,Value);
          return Value;
        }
    
}

