import { Component, OnInit, Input } from '@angular/core';
import { Router,ActivatedRoute, ParamMap  } from '@angular/router';

import { DomSanitizer } from '@angular/platform-browser';

import { DataTable,Column } from 'primeng/primeng';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from '@ngx-translate/core';

import * as moment from 'moment';

import { Servidor } from '../../services/servidor.service';
import { URLS,cal } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { Empresa } from '../../models/empresa';
 import { Maquina } from '../../models/maquina';
 import { CalendarioMantenimiento } from '../../models/calendariomantenimiento';
 import { MantenimientoRealizado } from '../../models/mantenimientorealizado';
 import { Periodicidad } from '../../models/periodicidad';
 import { Modal } from '../../models/modal';

@Component({
  selector: 'mantenimientos-realizados',
  templateUrl: './mantenimientos-realizados.component.html',
  styleUrls:['ficha-maquina.css']
})

export class MantenimientosRealizadosComponent implements OnInit {

@Input() maquina:Maquina;
@Input() nuevo: number;
@Input() Piezas;
public pieza;

public mantenimientos: MantenimientoRealizado[];
public incidencia:any[];
public tablaPosition=0;
public selectedItem: MantenimientoRealizado;
public cols:any;
public images: string[];
public docs: string[];
public es:any;
 public guardar = [];
 public alertaGuardar:boolean=false;
public idBorrar;
public tipo:object[]=[{label:'Interno', value:'interno'},{label:'Externo', value:'externo'}];

  modal: Modal = new Modal();
  filterDates:string="&filterdates=true&fecha_inicio="+this.empresasService.currentStartDate+"&fecha_fin="+moment().format("YYYY-MM-DD")+"&fecha_field=fecha";

public expanded:boolean=false;
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
//***   EXPORT DATA */
public exportar_informes: boolean =false;
public exportando:boolean=false;
public informeData:any;
//***   EXPORT DATA */


  constructor(public servidor: Servidor,public empresasService: EmpresasService, public sanitizer: DomSanitizer
    , public translate: TranslateService, private messageService: MessageService,private route: ActivatedRoute) {}





  ngOnInit() {
    //  this.setMantenimientos();
    this.baseurl = URLS.DOCS + this.empresasService.seleccionada + '/mantenimientos_realizados/';
    
    this.es=cal;
        if (localStorage.getItem("idioma")=="cat") this.tipo=[{label:'Intern', value:'interno'},{label:'Extern', value:'externo'}];
        this.cols = [
          { field: 'mantenimiento', header: 'Mantenimiento', type: 'std', width:160,orden:true,'required':true },
          { field: 'fecha_prevista', header: 'maquinas.fecha_prevista', type: 'fecha', width:120,orden:true,'required':true },
          { field: 'fecha', header: 'fecha', type: 'fecha', width:120,orden:true,'required':true },
          { field: 'tipo', header: 'tipo', type: 'dropdown', width:110,orden:true,'required':true },
          { field: 'pieza', header: 'maquinas.pieza', type: 'dropdown', width:120,orden:false,'required':false },
          { field: 'cantidadPiezas', header: 'maquinas.cantidadPiezas', type: 'std', width:60,orden:false,'required':false },
          { field: 'responsable', header: 'responsable', type: 'std', width:130,orden:true,'required':false }
        ];
        window.scrollTo(0, 0)
  }
  // photoURL(i) {
  //   this.verdoc=!this.verdoc;
  //   this.foto = this.url[i];
  // }
  ngOnChanges(){
    this.baseurl = URLS.DOCS + this.empresasService.seleccionada + '/mantenimientos_realizados/';
    this.setMantenimientos();
    if(this.Piezas){
      this.pieza = this.Piezas.map((pieza)=>{return {'label':pieza["nombre"],'value':pieza["id"]}});
      this.pieza.unshift({'label':"ninguna",'value':0});
      }else{
        this.pieza =[{'label':"ninguna",'value':0}];
      }
}
getOptions(option){
  if (option=='tipo'){
  return this.tipo;
  }else{
  return this.pieza;
  }
  }

incidenciaSelection(){
  let params = this.route.paramMap["source"]["_value"];
      if ((params["modulo"] == "mantenimientos_realizados" || params["modulo"] == "mantenimientos_relizados") && params["id"]){
          let idOrigen =params["id"];
          let index = this.mantenimientos.findIndex((item)=>item.id==idOrigen);
        if (index > -1){
          this.selectedItem = this.mantenimientos[index]
          this.tablaPosition = index;
          //console.log('***_',index,this.selectedItem)
        }else{
          this.setAlerta('incidencia.noencontrada')
        }
        }
}
seleccion(evento){
  console.log("SELECCION",evento);
}

onRowSelect(evento, tabla: DataTable){
//   console.log('****ROWSELECTED',tabla.value.findIndex((item)=>item.id==this.selectedItem.id))
//   let index =tabla.value.findIndex((item)=>item.id==this.selectedItem.id);
//  this.tablaPosition = index;
}

  setMantenimientos(){
    let params = this.maquina.id;
    let parametros = '&tipomantenimiento=preventivo&idmaquina=' + params+this.filterDates;
    //  let parametros = '&idempresa=' + this.empresasService.seleccionada; 
        this.servidor.getObjects(URLS.MANTENIMIENTOS_REALIZADOS, parametros).subscribe(
          response => {
            this.mantenimientos = [];
            this.incidencia =[];
            this.images=[];
            this.docs=[];
            if (response.success && response.data) {
              for (let element of response.data) {  
                  this.mantenimientos.push(new MantenimientoRealizado(element.idmantenimiento,element.idmaquina,
                  element.maquina,element.mantenimiento,element.descripcion,new Date(element.fecha_prevista),
                  new Date(element.fecha),element.tipo,element.elemento,element.causas,element.tipo2,element.doc,
                  element.idusuario,element.responsable,element.id,element.tipo_evento,element.idempresa,element.imagen,element.pieza,element.cantidadPiezas))

                  this.incidencia[element.id]={'origen':'maquinaria','origenasociado':'mantenimientos_realizados','idOrigenasociado':element.idmaquina,'idOrigen':element.id}
                  
                  this.images[element.id] = this.baseurl + element.id + "_"+element.imagen;
                  this.docs[element.id] = this.baseurl + element.id + "_"+element.doc;
                }
                //console.log(this.mantenimientos,this.incidencia)
                this.incidenciaSelection();
                //this.getIncidencias();
            }
        },
        error=>console.log(error),
        ()=> {}
        );
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



 saveItem(mantenimiento: MantenimientoRealizado) {

  // console.log ("evento");
  this.alertaGuardar = false;
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

//*******IMAGENES */

verFoto(foto:string,idItem){
  
  let calc = window.scrollY;
    this.top = calc + 'px';
  
  let index = this.mantenimientos.findIndex((item)=>item.id==idItem);

if (foto=="doc"){
  if (this.mantenimientos[index].doc){
if(this.docs[idItem].substr(this.docs[idItem].length-3,3)=='pdf'){  
  //window.open(this.docs[idItem],"_blank")
  // this.pdfSrc = this.docs[idItem];
  this.verdoc =  true;
  this.foto = this.docs[idItem];
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
cerrarPdf(){
  this.pdfSrc = null;
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
  rowExpanded(evento){
    console.log(evento)
    this.expanded=true;
  }
  rowCollapsed(evento){
    console.log(evento)
    this.expanded=false;
  }
  exportData(tabla: DataTable) {
    //console.log(tabla);
    let origin_Value = tabla._value;
    tabla.columns.push(new Column())
    tabla.columns[tabla.columns.length-1].field='descripcion';
    tabla.columns[tabla.columns.length-1].header='descripcion';
    tabla.columns.push(new Column())
    tabla.columns[tabla.columns.length-1].field='causas';
    tabla.columns[tabla.columns.length-1].header='causas';
    tabla._value = tabla.dataToRender;
    tabla._value.map((mentenimientos) => {
      (moment(mentenimientos.fecha_prevista).isValid()) ? mentenimientos.fecha_prevista = moment(mentenimientos.fecha_prevista).format("DD/MM/YYYY") : '';
      (moment(mentenimientos.fecha).isValid()) ? mentenimientos.fecha = moment(mentenimientos.fecha).format("DD/MM/YYYY") : '';
      
     // mentenimientos.periodicidad = this.checkPeriodo(mentenimientos.periodicidad);
    });

    tabla.csvSeparator = ";";
    tabla.exportFilename = "Mantenimientos_realizados" + this.maquina.nombre+"_del_"+tabla.dataToRender[0].fecha+"_al_"+tabla.dataToRender[tabla.dataToRender.length-1].fecha+"";
    tabla.exportCSV();
    tabla._value = origin_Value;
    tabla.columns.splice(tabla.columns.length-2,2);
  }

  checkPeriodo(periodicidad: string): string {
    if (periodicidad) {
      let valor: string;
      let periodo = JSON.parse(periodicidad);
      return periodo.repeticion;
    } else {
      return 'Nul';
    }
  }

cerrarFoto(){
  this.verdoc=false;
}

getIncidencias(){
  let params = this.empresasService.seleccionada;
  let parametros2 = "&entidad=incidencias"+'&idempresa=' + params+"&field=idOrigenasociado&idItem="+this.maquina.id+"&WHERE=origen=&valor=maquinaria";
      this.servidor.getObjects(URLS.STD_SUBITEM, parametros2).subscribe(
        response => {
          
          if (response.success && response.data) {

            for (let element of response.data) {  
              //console.log(element.idOrigen)
              this.incidencia[element.idOrigen]["idIncidencia"]=element.id; 
              this.incidencia[element.idOrigen]["estado"]=element.estado;                              
           }
           
          }
      });
}

PageAnterior(){
  if (this.paginaPdf >1)
  this.paginaPdf--
}
PageSiguiente(){
  if (this.paginaPdf < this.maxPdf)
  this.paginaPdf++;
}
onPDFError(event){
console.log('ERROR PDF:',event)
}
onProgress(event){
  console.log('Progress',event)
}
zoomIn(){
this.zoomPdf+=0.2
}
zoomOut(){
  this.zoomPdf-=0.2
}
pdfLoaded(event){
  console.log('Loaded',event)
  this.maxPdf = event._pdfInfo.numPages;
}


      //**** EXPORTAR DATA */

      async exportarTable(){
        this.exportando=true;
        this.informeData = await this.ConvertToCSV(this.cols, this.mantenimientos);
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
                    this.translate.get('maquinas.mantenimientos_realizados').subscribe((desc)=>{informe=desc});
                    return {'cabecera':[informeCabecera],'rows':informeRows,'comentarios':[],'informes':informe};
        }
    
        getDropDownValor(tabla,valor){
          let Value;
    
          switch (tabla){
            case "pieza":
            Value = this.pieza[this.pieza.findIndex((pza)=>pza['value']==valor)]['label'];
            break;
            case "tipo":
            Value = valor;
            break;
          }
          console.log(tabla,valor,Value);
          return Value;
        }




}
