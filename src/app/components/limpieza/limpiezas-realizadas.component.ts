import { Component, OnInit, Input, OnChanges, ViewChild } from '@angular/core';
import { Router,ActivatedRoute, ParamMap  } from '@angular/router';

import { DomSanitizer } from '@angular/platform-browser';

import {DataTable,Column} from 'primeng/primeng';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from 'ng2-translate';

import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { LimpiezaRealizada } from '../../models/limpiezarealizada';
import { LimpiezaZona } from '../../models/limpiezazona';
  import { Usuario } from '../../models/usuario';

import { Modal } from '../../models/modal';
import * as moment from 'moment';
@Component({
  selector: 'limpiezas-realizadas',
  templateUrl: './limpiezas-realizadas.component.html',
  styleUrls:['limpieza.component.css']
})

export class LimpiezasRealizadasComponent implements OnInit, OnChanges {
@Input() limpieza: LimpiezaZona;
@Input() nueva: number;
@ViewChild('DT') tablaLimpiezas: DataTable;
public tablaPosition=0;
public incidencia:any[];

public items: LimpiezaRealizada[];
public selectedItem: LimpiezaRealizada;
public images: string[];
public docs: string[];
public usuarios:Usuario[];
 public guardar = [];
 public alertaGuardar:boolean=false;
public idBorrar;
public motivo:boolean[]=[];
public supervisar:object[]=[{"value":0,"label":"porSupervisar"},{"value":1,"label":"correcto"},{"value":2,"label":"incorrecto"}];
  modal: Modal = new Modal();
entidad:string="&entidad=limpieza_realizada";
field:string="&field=idlimpiezazona&idItem=";
es
//******IMAGENES */
//public url; 
public baseurl;
public verdoc:boolean=false;
public image;
public foto;
public top = '50px';
//************** */

  constructor(public servidor: Servidor,public empresasService: EmpresasService,private route: ActivatedRoute
    , public translate: TranslateService, private messageService: MessageService) {}


 ngOnInit() {
      //this.loadSupervisores();
      this.baseurl = URLS.DOCS + this.empresasService.seleccionada + '/limpieza_realizada/';
      
                 this.es = {
            monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
                'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            dayNames: ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'],
            dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
            dayNamesMin: ["Do","Lu","Ma","Mi","Ju","Vi","Sa"],
            firstDayOfWeek: 1
        }; 
        window.scrollTo(0, 0)
  }

incidenciaSelection(){
  let x=0;
  this.route.paramMap.forEach((param)=>{
    x++;
      console.log(param["params"]["id"],param["params"]["modulo"]);
      if (param["params"]["modulo"] == "limpieza_realizada"){
        console.log(param["params"]["id"],param["params"]["modulo"]);
        if (param["params"]["id"]){
          console.log(param["params"]["id"],param["params"]["modulo"]);
          let idOrigen = param["params"]["id"];
          let index = this.items.findIndex((item)=>item.id==idOrigen);
          this.selectedItem = this.items[index]
          // let x= 5;
          // do {x--} while ((index -x) % 5 != 0 || x > 0)
          this.tablaPosition = index;
          //console.log("SELECCION AÇUTOMATICA",index,x);
        }
      }
    });
}
seleccion(evento){
  console.log("SELECCION",evento);
}

  ngOnChanges(){
    this.baseurl = URLS.DOCS + this.empresasService.seleccionada + '/limpieza_realizada/';
    
      this.loadSupervisores();
      console.log('paso3',this.nueva);
  }


  setItems(){
  //  let params = this.maquina.id;
  //  let parametros = '&idmaquina=' + params;
      let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+this.field+this.limpieza.id+"&order=fecha DESC"; 
        this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
          response => {
            this.items = [];
            this.images=[];
            this.docs=[];
            this.incidencia=[];
            if (response.success && response.data) {
              for (let element of response.data) {  
                let fecha;
                (moment(new Date(element.fecha_supervision)).isValid())? fecha = new Date(element.fecha_supervision): fecha = null;
                let supervisor = ''; 
                (element.idsupervisor>0)? supervisor = this.findSupervisor(element.idsupervisor):supervisor =  '';
                  this.items.push(new LimpiezaRealizada(element.idelemento,element.idlimpiezazona,element.nombre,element.descripcion,
                  new Date(element.fecha_prevista),new Date(element.fecha),element.tipo,element.usuario,element.responsable,element.id,
                  element.idempresa,element.idsupervisor,fecha,element.supervision,element.detalles_supervision,
                  supervisor,element.doc,element.imagen));
                  this.motivo.push(false);
                  this.incidencia[element.id]={'origen':'limpiezas','origenasociado':'limpieza_realizada','idOrigenasociado':element.idlimpiezazona,'idOrigen':element.id}
                  // this.url.push({"imgficha":this.baseurl + element.id +'_'+element.imgficha,"imgcertificado":this.baseurl + element.id +'_'+element.imgcertificado});
                  this.images[element.id] = this.baseurl + element.id + "_"+element.imagen;
                  this.docs[element.id] = this.baseurl + element.id + "_"+element.doc;
                }
                this.incidenciaSelection();
                this.getIncidencias();
            }

        });
       
  }


loadSupervisores(){
    let params = this.empresasService.seleccionada;
    let parametros2 = "&entidad=usuarios"+'&idempresa=' + params;
        this.servidor.getObjects(URLS.STD_ITEM, parametros2).subscribe(
          response => {
            this.usuarios = [];
            if (response.success && response.data) {

              for (let element of response.data) {  
                  this.usuarios.push(new Usuario(
                    element.id,element.usuario,element.password,element.tipouser,element.email,element.idempresa
                  ));
             }

             this.setItems();
            // this.localSupervisor = this.findSupervisor(this.empresasService.userId);
            }
        });
}

findSupervisor(id:number){
//console.log(id);
let index = this.usuarios.findIndex((user)=>user.id==id)
//console.log(this.usuarios[index]);
let user 
if (index > -1){
user = this.usuarios[index].usuario;
}else{
  user = '';
}
return user;
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
    this.modal.titulo = 'limpieza.borrarLimpiezaR';
    this.modal.subtitulo = 'limpieza.borrarLimpiezaR';
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
            this.selectedItem=null;
            this.items.splice(indice, 1);
            this.setAlerta('alertas.guardar');
          }
      });
    }
  }



 saveItem(mantenimiento: LimpiezaRealizada) {
   
   //console.log ("evento",event);
    this.guardar[mantenimiento.id] = false;
    this.alertaGuardar = false;
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
          console.log('Limpieza updated');
        }
    });
  }

detalleSupervision(idMantenimiento: number,index:number){
this.motivo[index] = !this.motivo[index];
}
setSupervision($event){

}




//*******IMAGENES */

verFoto(foto:string,idItem){
  
  let calc = window.scrollY;
    this.top = calc + 'px';
  
  let index = this.items.findIndex((item)=>item.id==idItem);

if (foto=="doc"){
  if (this.items[index].doc){
if(this.docs[idItem].substr(this.docs[idItem].length-3,3)=='pdf'){  
  window.open(this.docs[idItem],"_blank")
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

// photoURL(url){
// //return this.sanitizer.bypassSecurityTrustResourceUrl(url);
// }

uploadFunciones(event:any,idItem: number,field?:string) {
  console.log( event)
  var target = event.target || event.srcElement; //if target isn't there then take srcElement
  let files = target.files;
  //let files = event.srcElement.files;
  let idEmpresa = this.empresasService.seleccionada.toString();
   let index = this.items.findIndex((item)=>item.id==idItem);
  this.servidor.postDoc(URLS.UPLOAD_DOCS, files,'limpieza_realizada',idItem.toString(), this.empresasService.seleccionada.toString(),field).subscribe(
    response => {
      console.log('doc subido correctamente');
      if (field == 'imagen'){
        console.log('##',this.baseurl + idItem + "_"+files[0].name)
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
  tabla._value.map((limpieza)=>{
      (moment(limpieza.fecha_prevista).isValid())?limpieza.fecha_prevista = moment(limpieza.fecha_prevista).format("DD/MM/YYYY"):'';
      (moment(limpieza.fecha).isValid())?limpieza.fecha = moment(limpieza.fecha).format("DD/MM/YYYY"):'';
      (moment(limpieza.fecha_supervision).isValid())?limpieza.fecha_supervision= moment(limpieza.fecha_supervision).format("DD/MM/YYYY"):'';    
      
      switch (limpieza.supervision){
        case "0":
        limpieza.supervision = "Sin supervisar";
        break;
        case "1":
        limpieza.supervision = "Correcte";
        break;
        case "2":
        limpieza.supervision = "Incorrecte";        
        break;       
      }
      limpieza.idsupervisor = limpieza.supervisor;
      // planificacion.descripcion = 'test';
      limpieza.detalles_supervision = limpieza.detalles_supervision;
    
    });

  tabla.csvSeparator = ";";
  tabla.exportFilename = "Limpiezas_Realizadas_del_"+tabla.dataToRender[0].fecha+"_al_"+tabla.dataToRender[tabla.dataToRender.length-1].fecha+"";
  tabla.exportCSV();
  tabla._value = origin_Value;
  tabla.columns.splice(tabla.columns.length-2,2);
}


getIncidencias(){
  let params = this.empresasService.seleccionada;
  let parametros2 = "&entidad=incidencias"+'&idempresa=' + params+"&field=idOrigenasociado&idItem="+this.limpieza.id+"&WHERE=origen=&valor=limpiezas";
      this.servidor.getObjects(URLS.STD_SUBITEM, parametros2).subscribe(
        response => {
          
          if (response.success && response.data) {

            for (let element of response.data) {  
              this.incidencia[element.idOrigen]["idIncidencia"]=element.id; 
              this.incidencia[element.idOrigen]["estado"]=element.estado;                              
           }
           
           //console.log(this.incidencia);
          // this.localSupervisor = this.findSupervisor(this.empresasService.userId);
          }
      });
}
}