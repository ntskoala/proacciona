import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { DataTable,Column } from 'primeng/primeng';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from '@ngx-translate/core';

import * as moment from 'moment';

import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { Empresa } from '../../models/empresa';
 import { Maquina } from '../../models/maquina';
 import { CalendarioMantenimiento } from '../../models/calendariomantenimiento';
 import { MantenimientoRealizado } from '../../models/mantenimientorealizado';
 import { Periodicidad } from '../../models/periodicidad';
 import { Modal } from '../../models/modal';

@Component({
  selector: 'mantenimientos-correctivos',
  templateUrl: './mantenimientos-correctivos.component.html',
  styleUrls:['ficha-maquina.css']
})

export class MantenimientosCorrectivosComponent implements OnInit {

@Input() maquina:Maquina;


public mantenimientos: MantenimientoRealizado[];
public images: string[];
public docs: string[];
public es:any;
public guardar = [];
public alertaGuardar:boolean=false;
public idBorrar;
  modal: Modal = new Modal();
public nuevoMantenimiento: MantenimientoRealizado = new MantenimientoRealizado(0,0,'','','',new Date(),new Date());;
public date = new Date();
//public url:string[]=[];

public tipos:object[]=[{label:'interno', value:'interno'},{label:'externo', value:'externo'}];
//******IMAGENES */
//public url; 
public baseurl;
public verdoc:boolean=false;
public image;
public foto;
public top = '50px';
//************** */
  constructor(public servidor: Servidor,public empresasService: EmpresasService, public sanitizer: DomSanitizer
    , public translate: TranslateService, private messageService: MessageService) {}





  ngOnInit() {
    //  this.setMantenimientos();
    this.baseurl = URLS.DOCS + this.empresasService.seleccionada + '/mantenimientos_realizados/';
    
                 this.es = {
            monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
                'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            dayNames: ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'],
            dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
            dayNamesMin: ["Do","Lu","Ma","Mi","Ju","Vi","Sa"],
            firstDayOfWeek: 1
        }; 
  }
  // photoURL(i) {
  //   this.verdoc=!this.verdoc;
  //   this.foto = this.url[i];
  // }
  ngOnChanges(){
    this.baseurl = URLS.DOCS + this.empresasService.seleccionada + '/mantenimientos_realizados/';
    
    this.setMantenimientos();

}


  setMantenimientos(){
    let params = this.maquina.id;
    let parametros = '&tipomantenimiento=correctivo&idmaquina=' + params;
    //  let parametros = '&idempresa=' + this.empresasService.seleccionada; 
        this.servidor.getObjects(URLS.MANTENIMIENTOS_REALIZADOS, parametros).subscribe(
          response => {
            this.mantenimientos = [];
            this.images=[];
            this.docs=[];
            if (response.success && response.data) {
              for (let element of response.data) {  
                  this.mantenimientos.push(new MantenimientoRealizado(element.idmantenimiento,element.idmaquina,
                    element.maquina,element.mantenimiento,element.descripcion,new Date(element.fecha_prevista),
                    new Date(element.fecha),element.tipo,element.elemento,element.causas,element.tipo2,element.doc,
                    element.idusuario,element.responsable,element.id,element.tipo_evento,element.idempresa,
                    element.imagen))
            //       this.url.push(URLS.DOCS + this.empresasService.seleccionada + '/mantenimientos_realizados/' + element.id +'_'+element.doc);
            this.images[element.id] = this.baseurl + element.id + "_"+element.imagen;
            this.docs[element.id] = this.baseurl + element.id + "_"+element.doc;
                  }
            }
        },
        error=>console.log(error),
        ()=> console.log("mantenimientos",this.mantenimientos)
        );
        
  }



  newItem() {
    console.log (this.nuevoMantenimiento);
    this.nuevoMantenimiento.idmaquina = this.maquina.id;
    this.nuevoMantenimiento.fecha = new Date(Date.UTC(this.nuevoMantenimiento.fecha.getFullYear(), this.nuevoMantenimiento.fecha.getMonth(), this.nuevoMantenimiento.fecha.getDate()))
    this.nuevoMantenimiento.tipo2 = "correctivo";
    this.nuevoMantenimiento.idempresa = this.empresasService.seleccionada;
    this.servidor.postObject(URLS.MANTENIMIENTOS_REALIZADOS, this.nuevoMantenimiento).subscribe(
      response => {
        if (response.success) {
          this.nuevoMantenimiento.id = response.id;
          this.mantenimientos.push(this.nuevoMantenimiento);
          this.nuevoMantenimiento = new MantenimientoRealizado(0,0,'','','',new Date(),new Date());
          this.mantenimientos = this.mantenimientos.slice();
        }
    });
  }

  onEdit(evento){
    this.itemEdited(evento.data.id);
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

  
 saveItem(mantenimiento: MantenimientoRealizado) {
  this.alertaGuardar = false;
  // console.log ("evento",event);
    this.guardar[mantenimiento.id] = false;
    console.log ("actualizar_mantenimiento",mantenimiento);
    mantenimiento.fecha = new Date(Date.UTC(mantenimiento.fecha.getFullYear(), mantenimiento.fecha.getMonth(), mantenimiento.fecha.getDate()))
    let parametros = '?id=' + mantenimiento.id;        
    this.servidor.putObject(URLS.MANTENIMIENTOS_REALIZADOS, parametros, mantenimiento).subscribe(
      response => {
        if (response.success) {
          console.log('Mantenimiento updated');
        }
    });

  }

  checkBorrar(idBorrar: number) {
    // Guardar el id del control a borrar
    this.idBorrar = idBorrar;
    // Crea el modal
    this.modal.titulo = 'maquinas.borrarMantenimientoR';
    this.modal.subtitulo = 'maquinas.borrarMantenimientoR';
    this.modal.eliminar = true;
    this.modal.visible = true;
  }

  cerrarModal(event: boolean) {
    this.modal.visible = false;
    if (event) {
      let parametros = '?id=' + this.idBorrar;
      this.servidor.deleteObject(URLS.MANTENIMIENTOS_REALIZADOS, parametros).subscribe(
        response => {
          if (response.success) {
            let controlBorrar = this.mantenimientos.find(mantenimiento => mantenimiento.id == this.idBorrar);
            let indice = this.mantenimientos.indexOf(controlBorrar);
            this.mantenimientos.splice(indice, 1);
            this.mantenimientos = this.mantenimientos.slice();
          }
      });
    }
  }

  // uploadImg(event, idItem,i) {
  //   console.log(event)
  //   var target = event.target || event.srcElement; //if target isn't there then take srcElement
  //   let files = target.files;
  //   //let files = event.srcElement.files;
  //   let idEmpresa = this.empresasService.seleccionada.toString();
  //   this.servidor.postDoc(URLS.UPLOAD_DOCS, files,'mantenimientos_realizados',idItem, this.empresasService.seleccionada.toString()).subscribe(
  //     response => {
  //       console.log('doc subido correctamente',files[0].name);
  //       this.mantenimientos[i].doc = files[0].name;
  //       this.url[i]= URLS.DOCS + this.empresasService.seleccionada + '/mantenimientos_realizados/' +  idItem +'_'+files[0].name;
  //       // let activa = this.empresas.find(emp => emp.id == this.empresasService.seleccionada);
  //       // activa.logo = '1';
  //     }
  //   )
  // }




//*******IMAGENES */
cerrarFoto(){
  this.verdoc=false;
}
verFoto(foto:string,idItem){
  
  let calc = window.scrollY;
    this.top = calc + 'px';
  
  let index = this.mantenimientos.findIndex((item)=>item.id==idItem);

if (foto=="doc"){
  if (this.mantenimientos[index].doc){
if(this.docs[idItem].substr(this.docs[idItem].length-3,3)=='pdf'){  
  window.open(this.docs[idItem],"_blank")
}else{
  this.verdoc =  true;
  this.foto = this.docs[idItem];
}
  }
}else{
  
  if (this.mantenimientos[index].imagen){
  this.verdoc =  true;
  this.foto = this.images[idItem];
}
}
}

photoURL(url){
return this.sanitizer.bypassSecurityTrustResourceUrl(url);
}

uploadFunciones(event:any,idItem: number,field?:string) {
  console.log( event)
  var target = event.target || event.srcElement; //if target isn't there then take srcElement
  let files = target.files;
  //let files = event.srcElement.files;
  let idEmpresa = this.empresasService.seleccionada.toString();
   let index = this.mantenimientos.findIndex((item)=>item.id==idItem);
  this.servidor.postDoc(URLS.UPLOAD_DOCS, files,'mantenimientos_realizados',idItem.toString(), this.empresasService.seleccionada.toString(),field).subscribe(
    response => {
      console.log('doc subido correctamente');
      if (field == 'imagen'){
        console.log('##',this.baseurl + idItem + "_"+files[0].name)
        this.images[idItem] = this.baseurl + idItem + "_"+files[0].name;
        this.mantenimientos[index].imagen=files[0].name;
      }else{
         this.docs[idItem] = this.baseurl + idItem + "_"+files[0].name;
         this.mantenimientos[index].doc=files[0].name;
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

  exportData(tabla: DataTable) {
    console.log(tabla);
    let origin_Value = tabla._value;
    tabla.columns.push(new Column())
    tabla.columns[tabla.columns.length-1].field='descripcion';
    tabla.columns[tabla.columns.length-1].header='descripcion';
    tabla.columns.push(new Column())
    tabla.columns[tabla.columns.length-1].field='causas';
    tabla.columns[tabla.columns.length-1].header='causas';
    tabla._value = tabla.dataToRender;
    tabla._value.map((mentenimientos) => {
      (moment(mentenimientos.fecha).isValid()) ? mentenimientos.fecha = moment(mentenimientos.fecha).format("DD/MM/YYYY") : '';
    });

    tabla.csvSeparator = ";";
    tabla.exportFilename = "Mantenimientos_correctivos" + this.maquina.nombre+"_del_"+tabla.dataToRender[0].fecha+"_al_"+tabla.dataToRender[tabla.dataToRender.length-1].fecha+"";
    tabla.exportCSV();
    tabla._value = origin_Value;
    tabla.columns.splice(tabla.columns.length-2,2);
  }


}
