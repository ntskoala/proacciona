import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { Router,ActivatedRoute, ParamMap  } from '@angular/router';

import { DomSanitizer } from '@angular/platform-browser';
import {DataTable, Column} from 'primeng/primeng';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from '@ngx-translate/core';

import { Servidor } from '../../../services/servidor.service';
import { URLS,cal } from '../../../models/urls';
import { EmpresasService } from '../../../services/empresas.service';

// import { LimpiezaRealizada } from '../../../models/limpiezarealizada';
import { FormacionRealizada } from '../../../models/formaciones-realizadas';
//import { Planificacion } from '../../../models/limpiezazona';
import { Usuario } from '../../../models/usuario';
import { Trabajador } from '../../../models/trabajadores';

import { Modal } from '../../../models/modal';
import * as moment from 'moment';
// import { Planificacion } from '../../../models/planificacion';

@Component({
  selector: 'app-formaciones-realizadas',
  templateUrl: './formaciones-realizadas.component.html',
  styleUrls: ['./formaciones-realizadas.component.css']
})
export class FormacionesRealizadasComponent implements OnInit {

  @Input() nuevo: number;

  //@Input() plan: string;
  @Output() planRealizado: EventEmitter<FormacionRealizada> = new EventEmitter<FormacionRealizada>();
  // public items: LimpiezaRealizada[];
  public items: FormacionRealizada[];
  public cols:any[];
  public images: string[];
  public docs: string[];
  public usuarios:object[];
  public incidencia:any[];
  public tablaPosition=0;
  public selectedItem: FormacionRealizada;
  
  
   public guardar = [];
   public alertaGuardar:boolean=false;
  public idBorrar;
  public motivo:boolean[]=[];
  public estados:object[]=[{label:'Convocado', value:'Convocado'},{label:'Cursando', value:'Cursando'},{label:'Pendiente test', value:'Pendiente test'},{label:'Examinado', value:'Examinado'}];
  
  public supervisar:object[]=[{"value":0,"label":"porSupervisar"},{"value":1,"label":"correcto"},{"value":2,"label":"incorrecto"}];
    modal: Modal = new Modal();
    public stacked:boolean=false;
  entidad:string="&entidad=formaciones_realizadas";
  filterDates:string="&filterdates=true&fecha_inicio="+this.empresasService.currentStartDate+"&fecha_fin="+moment().format("YYYY-MM-DD")+"&fecha_field=fecha";
  
  //field:string="&field=idfamilia&idItem=";
  es
  
  autoresize:boolean=true;
  public procesando:boolean=false;
  //******IMAGENES */
  //public url; 
  public baseurl;
  public verdoc:boolean=false;
  public pdfSrc: string=null;
  public paginaPdf:number=1;
  public maxPdf:number=1;
  public zoomPdf:number=1;
  public image;
  public foto;
  public top = '50px';
  //************** */
  //************** */
  public expanded:boolean=false;
  public currentExpandedId: number;
  //***   EXPORT DATA */
  public exportar_informes: boolean =false;
  public exportando:boolean=false;
  public informeData:any;
  //***   EXPORT DATA */
    constructor(public servidor: Servidor,public empresasService: EmpresasService, 
      public translate: TranslateService, private messageService: MessageService,private route: ActivatedRoute) {}
  
  
   ngOnInit() {
        this.loadSupervisores();
        this.baseurl = URLS.DOCS + this.empresasService.seleccionada + '/formaciones_realizadas/';
        this.es=cal;
          window.scrollTo(0, 0);
          this.cols = [
            { field: 'nombre', header: 'Nombre', type: 'std', width:160,orden:true,'required':true },
            { field: 'fecha_prevista', header: 'limpieza.fecha_prevista', type: 'fecha', width:120,orden:true,'required':true },
            { field: 'fecha', header: 'fecha', type: 'fecha', width:120,orden:true,'required':true },
            { field: 'estado', header: 'estado', type: 'dropdown', width:120,orden:true,'required':true },
            { field: 'responsable', header: 'responsable', type: 'std', width:120,orden:true,'required':false },
            { field: 'supervision', header: 'limpieza.supervision', type: 'dropdown', width:120,orden:false,'required':false },
            { field: 'idsupervisor', header: 'limpieza.supervisor', type: 'dropdown', width:120,orden:false,'required':false },
            { field: 'fecha_supervision', header: 'limpieza.fecha_supervision', type: 'fecha', width:120,orden:true,'required':true },
          ];
          if (localStorage.getItem("idioma")=="cat") {
            this.estados=[{label:'Convocat', value:'Convocado'},{label:'Cursant', value:'Cursando'},{label:'Pendent test', value:'Pendiente test'},{label:'Evaluat', value:'Examinado'}];
            this.supervisar=[{"value":0,"label":"Per Supervisar"},{"value":1,"label":"Correcte"},{"value":2,"label":"Incorrecte"}];
          }
    }
  
    ngOnChanges(){
        this.loadSupervisores();
       // console.log('paso3',this.nuevo);
  
    //*******IMAGES */
      this.baseurl = URLS.DOCS + this.empresasService.seleccionada + '/formaciones_realizadas/';
      //this.url = this.baseurl +'_'+this.plan.doc;
      //this.image= this.baseurl + this.plan.id + "_"+"imagen_qr_TFC_IOS.jpg";
    //************* */
    }
  
    getOptions(option){
      //console.log('*****',option);
      switch (option[0]){
      case 'estado':
      return this.estados;
      break;
      case 'supervision':
      return this.supervisar;
      break;
      case 'idsupervisor':
      return this.usuarios;
      break;
      }
      }
  
  
    incidenciaSelection(){
      let params = this.route.paramMap["source"]["_value"];
          if (params["modulo"] == "formaciones_realizadas" && params["id"]){
              let idOrigen =params["id"];
              let index = this.items.findIndex((item)=>item.id==idOrigen);
              if (index > -1){
              this.selectedItem = this.items[index]
              this.tablaPosition = index;
              console.log('***_',index,this.selectedItem)
              }else{
                this.setAlerta('incidencia.noencontrada')
              }
            }
    }
  
    setItems(){
    //  let params = this.maquina.id;
    //  let parametros = '&idmaquina=' + params;
        let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+"&order=fecha DESC";//+this.filterDates;
          this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
            response => {
              this.items = [];
              this.incidencia=[];
              this.images=[];
              this.docs=[];
              if (response.success && response.data) {
                for (let element of response.data) {  
                  let fecha;
                  (moment(new Date(element.fecha_supervision)).isValid())? fecha = new Date(element.fecha_supervision): fecha = null;
                  // let supervisor = ''; 
                  // (element.idsupervisor>0)? supervisor = this.findSupervisor(element.idsupervisor):supervisor =  '';
                    this.items.push(new FormacionRealizada(element.id,element.idplan,element.estado,element.idempresa,
                      element.nombre,element.descripcion,new Date(element.fecha_prevista),new Date(element.fecha),element.resposable,element.idtrabajador,
                    element.idsupervisor,fecha,element.supervision,element.detalles_supervision,element.supervisor,element.tipo_formacion,element.tipo_formador,
                    element.formador,element.percentExito,element.valoracion,element.imagen,element.doc));
                    this.incidencia[element.id]={'origen':'formaciones','origenasociado':'formaciones_realizadas','idOrigenasociado':null,'idOrigen':element.id}
                    
                    this.motivo.push(false);
                    this.images[element.id] = this.baseurl + element.id + "_"+element.imagen;
                    this.docs[element.id] = this.baseurl + element.id + "_"+element.doc;
                    // this.url.push({"imgficha":this.baseurl + element.id +'_'+element.imgficha,"imgcertificado":this.baseurl + element.id +'_'+element.imgcertificado});
               }
               this.incidenciaSelection();
               this.getIncidencias();
              }else{
                this.procesando=false;
              }
  
          });
         
    }
  
  
  loadSupervisores(){
    this.procesando=true;
      let params = this.empresasService.seleccionada;
      let parametros2 = "&entidad=usuarios"+'&idempresa=' + params;
          this.servidor.getObjects(URLS.STD_ITEM, parametros2).subscribe(
            response => {
              this.usuarios = [];
              if (response.success && response.data) {
  
                for (let element of response.data) {  
                    // this.usuarios.push(new Usuario(
                    //   element.id,element.usuario,element.password,element.tipouser,element.email,element.idempresa
                    // ));
                      this.usuarios.push({label:element.usuario,value:element.id})
               }
              // console.log('usuarios',this.usuarios)
               this.setItems();
              // this.localSupervisor = this.findSupervisor(this.empresasService.userId);
              }else{
                this.procesando =false;
              }
          });
  }
  
  // findSupervisor(id:number){
  // //console.log(id);
  // let index = this.usuarios.findIndex((user)=>user.id==id)
  // //console.log(this.usuarios[index]);
  // let user = this.usuarios[index].usuario;
  // //console.log(user);
  // return user;
  // }
  
  doSomething(item,header,col,field){
  console.log(item,header,col,field)
  }
  
  onEdit(event){
    console.log(event);
    this.itemEdited(event.data.id);
  }
  
  itemEdited(idMantenimiento: number) {
    this.guardar[idMantenimiento] = true;
    if (!this.alertaGuardar){
      this.alertaGuardar = true;
      this.setAlerta('alertas.guardar');
      }
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
    checkBorrar(idBorrar: number) {
      // Guardar el id del control a borrar
      this.idBorrar = idBorrar;
      // Crea el modal
      this.modal.titulo = 'borrarT';
      this.modal.subtitulo = 'borrarST';
      this.modal.eliminar = true;
      this.modal.visible = true;
    }
  
    cerrarModal(event: boolean) {
      this.modal.visible = false;
      if (event) {
        let parametros = '?id=' + this.idBorrar+this.entidad;
        this.servidor.deleteObject(URLS.STD_SUBITEM, parametros).subscribe(
          response => {
            if (response.success) {
              let controlBorrar = this.items.find(mantenimiento => mantenimiento.id == this.idBorrar);
              let indice = this.items.indexOf(controlBorrar);
              this.items.splice(indice, 1);
              this.items = this.items.slice();
              this.setAlerta('alertas.borrar');
            }
        });
      }
    }
  
  
  
   saveItem(mantenimiento: FormacionRealizada) {
  
     console.log ("evento");
     this.alertaGuardar = false;
      this.guardar[mantenimiento.id] = false;
      delete mantenimiento.supervisor;
      if (!moment(mantenimiento.fecha_supervision).isValid()) mantenimiento.fecha_supervision = new Date();
      console.log ("actualizar_mantenimiento",mantenimiento);
      mantenimiento.fecha = new Date(Date.UTC(mantenimiento.fecha.getFullYear(), mantenimiento.fecha.getMonth(), mantenimiento.fecha.getDate()))
      mantenimiento.fecha_supervision = new Date(Date.UTC(mantenimiento.fecha_supervision.getFullYear(), mantenimiento.fecha_supervision.getMonth(), mantenimiento.fecha_supervision.getDate()))
      //let parametros = '?id=' + mantenimiento.id;
      let parametros = '?id=' + mantenimiento.id+this.entidad;  
      this.servidor.putObject(URLS.STD_SUBITEM, parametros, mantenimiento).subscribe(
        response => {
          if (response.success) {
            console.log('plan updated');
          }
      });
    }
  
  detalleSupervision(idMantenimiento: number,index:number){
  this.motivo[index] = !this.motivo[index];
  }
  setSupervision($event){
  
  }
  // openIt(plan){
  //   console.log(plan)
  //   this.planRealizado.emit(plan);
  // }
  
  
  
  //*******IMAGENES */
  
      verFoto(foto:string,idItem){
        
        let calc = window.scrollY;
          this.top = calc + 'px';
        
        let index = this.items.findIndex((item)=>item.id==idItem);
      if (foto=="doc"){
        if (this.items[index].doc){
      if(this.docs[idItem].substr(this.docs[idItem].length-3,3)=='pdf'){  
        // window.open(this.docs[idItem],"_blank")
        this.verdoc =  true;
        this.foto = this.docs[idItem];
      }else{
        this.verdoc =  true;
        this.foto = this.docs[idItem];
      }
        }
      }else{
        
        if (this.items[index].imagen){
        this.verdoc =  true;
        this.foto = this.images[idItem];
      }
      }
    }
    photoURL(url){
     // return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  
    uploadFunciones(event:any,idItem: number,field?:string) {
      console.log( event)
      var target = event.target || event.srcElement; //if target isn't there then take srcElement
      let files = target.files;
      //let files = event.srcElement.files;
      let idEmpresa = this.empresasService.seleccionada.toString();
       let index = this.items.findIndex((item)=>item.id==idItem);
      this.servidor.postDoc(URLS.UPLOAD_DOCS, files,'planificaciones_realizadas',idItem.toString(), this.empresasService.seleccionada.toString(),field).subscribe(
        response => {
          console.log('doc subido correctamente');
          if (field == 'imagen'){
            this.images[idItem] = this.baseurl + idItem + "_"+files[0].name;
            this.items[index].imagen=files[0].name;
          }else{
             this.docs[idItem] = this.baseurl + idItem + "_"+files[0].name;
             this.items[index].doc=files[0].name;
          }
          // let activa = this.empresas.find(emp => emp.id == this.empresasService.seleccionada);
          // activa.logo = '1';
        }
      )
    }
  
    expandir(dt: any,row:number,event:any){
      console.log(dt,row,event)
  
      dt.toggleRow(row);
    }
  
  
  exportData(tabla: DataTable){
    console.log(tabla);
    let origin_Value = tabla._value;
    
    tabla.columns.push(new Column())
    tabla.columns[tabla.columns.length-1].field='descripcion';
    tabla.columns[tabla.columns.length-1].header='descripcion';
    tabla.columns.push(new Column())
    tabla.columns[tabla.columns.length-1].field='detalles_supervision';
    tabla.columns[tabla.columns.length-1].header='detalles_supervision';
    tabla._value = tabla.dataToRender;
    tabla._value.map((planificacion)=>{
        (moment(planificacion.fecha_prevista).isValid())?planificacion.fecha_prevista = moment(planificacion.fecha_prevista).format("DD/MM/YYYY"):'';
        (moment(planificacion.fecha).isValid())?planificacion.fecha = moment(planificacion.fecha).format("DD/MM/YYYY"):'';
        (moment(planificacion.fecha_supervision).isValid())?planificacion.fecha_supervision= moment(planificacion.fecha_supervision).format("DD/MM/YYYY"):'';    
        switch (planificacion.supervision){
          case "0":
          planificacion.supervision = "Sin supervisar";
          break;
          case "1":
          planificacion.supervision = "Correcte";
          break;
          case "2":
          planificacion.supervision = "Incorrecte";        
          break;       
        }
        planificacion.idsupervisor = planificacion.supervisor;
        // planificacion.descripcion = 'test';
        planificacion.detalles_supervision = planificacion.detalles_supervision;
      });
  
    tabla.csvSeparator = ";";
      tabla.exportFilename = "Planes_Realizadas_del_"+tabla.dataToRender[0].fecha+"_al_"+tabla.dataToRender[tabla.dataToRender.length-1].fecha+"";
  
    tabla.exportCSV();
    tabla._value = origin_Value;
    tabla.columns.splice(tabla.columns.length-2,2);
  }
  
  getIncidencias(){
    let params = this.empresasService.seleccionada;
    let parametros2 = "&entidad=incidencias"+'&idempresa=' + params+"&field=idOrigenasociado&idItem="+0+"&WHERE=origen=&valor=planificaciones";
        this.servidor.getObjects(URLS.STD_SUBITEM, parametros2).subscribe(
          response => {
            
            if (response.success && response.data) {
  
              for (let element of response.data) {  
                this.incidencia[element.idOrigen]["idIncidencia"]=element.id; 
                this.incidencia[element.idOrigen]["estado"]=element.estado;                              
             }
             this.procesando=false;
            }else{
              this.procesando=false;
            }
        });
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
  
        //**** EXPORTAR DATA */
  
        async exportarTable(){
          this.exportando=true;
          this.informeData = await this.ConvertToCSV(this.cols, this.items);
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
                      this.translate.get('planificaciones.planificaciones_realizadas').subscribe((desc)=>{informe=desc});
                      return {'cabecera':[informeCabecera],'rows':informeRows,'comentarios':[],'informes':informe};
          }
      
          getDropDownValor(tabla,valor){
            console.log(tabla,valor);
            let Value ='';
            let index;
            switch (tabla){
              case 'tipo':
              index=this.estados.findIndex((estado)=>estado["value"]==valor);
              if (index>-1)
              Value = this.estados[index]["label"];
              break;
              case 'supervision':
              index=this.supervisar.findIndex((sup)=>sup["value"]==valor);
              if (index>-1)
              Value = this.supervisar[index]["label"];
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