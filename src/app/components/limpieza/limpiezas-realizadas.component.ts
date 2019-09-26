import { Component, OnInit, Input, OnChanges, ViewChild } from '@angular/core';
import { Router,ActivatedRoute, ParamMap  } from '@angular/router';

import { DomSanitizer } from '@angular/platform-browser';

import {DataTable,Column} from 'primeng/primeng';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from '@ngx-translate/core';

import { Servidor } from '../../services/servidor.service';
import { URLS,cal } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { LimpiezaRealizada } from '../../models/limpiezarealizada';
import { LimpiezaZona } from '../../models/limpiezazona';
  import { Usuario } from '../../models/usuario';

import { Modal } from '../../models/modal';
import * as moment from 'moment';
import { isDate } from '@angular/common/src/i18n/format_date';
import { SwitchView } from '@angular/common/src/directives/ng_switch';
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
public cols:any[];
public selectedItem: LimpiezaRealizada;
public images: string[];
public docs: string[];
public usuarios:object[];
 public guardar = [];
 public alertaGuardar:boolean=false;
public idBorrar;
public motivo:boolean[]=[];
public tipos:object[]=[{label:'Interno', value:'interno'},{label:'Externo', value:'externo'}];
public supervisar:object[]=[{"value":0,"label":"Por supervisar"},{"value":1,"label":"Correcto"},{"value":2,"label":"Incorrecto"}];
public countSinSupervisar:number=0;
public supervisarBatch:number=0;
  modal: Modal = new Modal();
entidad:string="&entidad=limpieza_realizada";
field:string="&field=idlimpiezazona&idItem=";
filterDates:string="&filterdates=true&fecha_inicio="+this.empresasService.currentStartDate+"&fecha_fin="+moment().format("YYYY-MM-DD")+"&fecha_field=fecha";
es
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


  constructor(public servidor: Servidor,public empresasService: EmpresasService,private route: ActivatedRoute
    , public translate: TranslateService, private messageService: MessageService) {}


 ngOnInit() {
      //this.loadSupervisores();
      this.baseurl = URLS.DOCS + this.empresasService.seleccionada + '/limpieza_realizada/';
      
      this.es=cal;
        this.cols = [
          { field: 'nombre', header: 'Nombre', type: 'std', width:160,orden:true,'required':true },
          { field: 'fecha_prevista', header: 'limpieza.fecha_prevista', type: 'fecha', width:120,orden:'fecha_prevista','required':true },
          { field: 'fecha', header: 'fecha', type: 'fecha', width:120,orden:'fecha','required':true },
          { field: 'tipo', header: 'tipo', type: 'dropdown', width:115,orden:false,'required':true },
          { field: 'idusuario', header: 'responsable', type: 'dropdown', width:130,orden:false,'required':false },
          { field: 'supervision', header: 'limpieza.supervision', type: 'dropdown', width:130,orden:false,'required':false },
          { field: 'idsupervisor', header: 'limpieza.supervisor', type: 'dropdown', width:110,orden:false,'required':false },
          { field: 'fecha_supervision', header: 'limpieza.fecha_supervision', type: 'fecha', width:120,orden:'fecha_supervision','required':true },
        ];
        if (localStorage.getItem("idioma")=="cat") {
          this.tipos=[{label:'Intern', value:'interno'},{label:'Extern', value:'externo'}];
          this.supervisar=[{"value":0,"label":"Per Supervisar"},{"value":1,"label":"Correcte"},{"value":2,"label":"Incorrecte"}];
        }
        window.scrollTo(0, 0);
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
          if (index > -1){
            this.selectedItem = this.items[index]
            this.tablaPosition = index;
            console.log('***_',index,this.selectedItem)
            }else{
              this.setAlerta('incidencia.noencontrada')
            }
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
  getOptions(option){
    //console.log('*****',option);
    switch (option[0]){
    case 'tipo':
    return this.tipos;
    break;
    case 'supervision':
    return this.supervisar;
    break;
    case 'idsupervisor':
    return this.usuarios;
    break;
    case 'idusuario':
      return this.usuarios;
      break;
    }
    }

  setItems(){
  //  let params = this.maquina.id;
  //  let parametros = '&idmaquina=' + params;
      let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+this.field+this.limpieza.id+"&order=fecha DESC"+this.filterDates; 
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
                  new Date(element.fecha_prevista),new Date(element.fecha),element.tipo,element.idusuario,element.responsable,element.id,
                  element.idempresa,element.idsupervisor,fecha,element.supervision,element.detalles_supervision,
                  supervisor,element.doc,element.imagen));
                  if (element.supervision == 0) this.countSinSupervisar++;
                  this.motivo.push(false);
                  this.incidencia[element.id]={'origen':'limpiezas','origenasociado':'limpieza_realizada','idOrigenasociado':element.idlimpiezazona,'idOrigen':element.id}
                  // this.url.push({"imgficha":this.baseurl + element.id +'_'+element.imgficha,"imgcertificado":this.baseurl + element.id +'_'+element.imgcertificado});
                  this.images[element.id] = this.baseurl + element.id + "_"+element.imagen;
                  this.docs[element.id] = this.baseurl + element.id + "_"+element.doc;
                }
                 this.incidenciaSelection();
                // this.getIncidencias();
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
                  // this.usuarios.push(new Usuario(
                  //   element.id,element.usuario,element.password,element.tipouser,element.email,element.idempresa
                  // ));
                  this.usuarios.push({'label':element.usuario,'value':element.id})
             }

             this.setItems();
            // this.localSupervisor = this.findSupervisor(this.empresasService.userId);
            }
        });
}

findSupervisor(id:number){
//console.log(id);
let index = this.usuarios.findIndex((user)=>user["value"]==id)
//console.log(this.usuarios[index]);
let user 
if (index > -1){
user = this.usuarios[index]["label"];
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
            this.items = this.items.slice();
            this.setAlerta('alertas.borrar');
          }
      });
    }
  }

  saveAll(){
    for (let x=0;x<this.guardar.length;x++){
      if (this.guardar[x]==true) {
        let indice = this.items.findIndex((myitem)=>myitem.id==x);
        console.log ("id",x,this.items[indice]);
        this.saveItem(this.items[indice])
      }
    }
     
    }

 saveItem(mantenimiento: LimpiezaRealizada) {
   return new Promise((resolve)=>{
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
          resolve(true);
          console.log('Limpieza updated');
        }
    });
  })
  }

detalleSupervision(idMantenimiento: number,index:number){
this.motivo[index] = !this.motivo[index];
}
setSupervision($event){

}




//*******IMAGENES */

// verFoto(foto:string,idItem){
  
//   let calc = window.scrollY;
//     this.top = calc + 'px';
  
//   let index = this.items.findIndex((item)=>item.id==idItem);

// if (foto=="doc"){
//   if (this.items[index].doc){
// if(this.docs[idItem].substr(this.docs[idItem].length-3,3)=='pdf'){  
//   window.open(this.docs[idItem],"_blank")
// }else{
//   this.verdoc =  true;
//   this.foto = this.docs[idItem];
// }
//   }
// }else{
  
//   if (this.items[index].imagen){
//   this.verdoc =  true;
//   this.foto = this.images[idItem];
// }
// }
// }

verFoto(foto:string,idItem){
  
  let calc = window.scrollY;
    this.top = calc + 'px';
    let index = this.items.findIndex((item)=>item.id==idItem);

if (foto=="doc"){
  if (this.items[index].doc){
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
  console.log(this.items[index].imagen)
  if (this.items[index].imagen){
  this.verdoc =  true;
  this.foto = this.images[idItem];
}
}
console.log(this.foto,this.images)
}
cerrarPdf(){
  this.pdfSrc = null;
}

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

// async exportData(tabla: DataTable){
//   let origin_Value = tabla._value;
//   tabla.columns.push(new Column())
//   tabla.columns[tabla.columns.length-1].field='descripcion';
//   tabla.columns[tabla.columns.length-1].header='descripcion';
//   tabla.columns.push(new Column())
//   tabla.columns[tabla.columns.length-1].field='detalles_supervision';
//   tabla.columns[tabla.columns.length-1].header='detalles_supervision';
//   tabla._value = tabla.dataToRender;
//   tabla._value.map((limpieza)=>{
//       (moment(limpieza.fecha_prevista).isValid())?limpieza.fecha_prevista = moment(limpieza.fecha_prevista).format("DD/MM/YYYY"):'';
//       (moment(limpieza.fecha).isValid())?limpieza.fecha = moment(limpieza.fecha).format("DD/MM/YYYY"):'';
//       (moment(limpieza.fecha_supervision).isValid())?limpieza.fecha_supervision= moment(limpieza.fecha_supervision).format("DD/MM/YYYY"):'';    
      
//       switch (limpieza.supervision){
//         case "0":
//         limpieza.supervision = "Sin supervisar";
//         break;
//         case "1":
//         limpieza.supervision = "Correcte";
//         break;
//         case "2":
//         limpieza.supervision = "Incorrecte";        
//         break;       
//       }
//       limpieza.idsupervisor = limpieza.supervisor;
//       // planificacion.descripcion = 'test';
//       limpieza.detalles_supervision = limpieza.detalles_supervision;
//     });
//   tabla.csvSeparator = ";";
//   tabla.exportFilename = "Limpiezas_Realizadas_del_"+tabla.dataToRender[0].fecha+"_al_"+tabla.dataToRender[tabla.dataToRender.length-1].fecha+"";
//   tabla.exportCSV();
//   tabla._value = origin_Value;
//   tabla.columns.splice(tabla.columns.length-2,2);
// }



// informeRecibido(resultado){
//   console.log('informe recibido:',resultado);
//   if (resultado){
//     setTimeout(()=>{this.exportando=false},1500)
//   }else{
//     this.exportando=false;
//   }
// }


// ConvertToCSV(controles,objArray){
// var cabecera =  typeof controles != 'object' ? JSON.parse(controles) : controles;
// var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
// console.log(cabecera,array)
// let informeCabecera=[];
// let informeRows=[];
// let comentarios = [];
//           var str = '';
//           var row = "";
//           row += "Foto;"
//           for (var i = 0; i < cabecera.length; i++) {
//             row += cabecera[i] + ';';
//           }
//           row = row.slice(0, -1);
//           //append Label row with line break
//           //str += row + '\r\n';
//           informeCabecera = row.split(";");
//           str='';
//           for (var i = 0; i < array.length; i++) {
//             let fotoUrl = ''
//             let comentario='';
//             if (array[i].foto){
//               fotoUrl =URLS.FOTOS + this.empresasService.seleccionada + '/control'+ array[i].id + '.jpg'
//            }                            
//               var line = fotoUrl+";";
//               //var line =array[i].usuario+";"+array[i].fecha +";";

//             for (var x = 0; x < cabecera.length; x++) {
//               let columna = cabecera[x];
//               let resultado = array[i][cabecera[x]];
//               if (moment(resultado).isValid()) resultado = moment(resultado).format('DD/MM/YYYY');
//               //let resultado = array[i];
//             //   if (array[i][columna + 'mensaje']) {
//             //     this.translateService.get(array[i][columna + 'mensaje']).subscribe((mensaje)=>{comentario +=  columna +": "+mensaje})
//             //   } 
//             // //line += ((array[i][cabecera[x]] !== undefined) ?array[i][cabecera[x]] + ';':';');
//             line += (resultado!== undefined && resultado !== null) ? resultado + ';':';';
//           }
//           line = line.slice(0,-1);
//               //str += line + '\r\n';
//               informeRows.push(line.split(";"));
//               comentarios.push(comentario);

//           }
//           return str;
//           // return {'cabecera':[informeCabecera],'rows':informeRows,'comentarios':comentarios,'informes':'Limpiezas realizadas'};
// }




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
                    this.translate.get('limpieza.limpiezas_realizadas').subscribe((desc)=>{informe=desc});
                    return {'cabecera':[informeCabecera],'rows':informeRows,'comentarios':[],'informes':informe};
        }
    
        getDropDownValor(tabla,valor){
          console.log(tabla,valor);
          let Value ='';
          let index;
          switch (tabla){
            case 'tipo':
            index=this.tipos.findIndex((tipo)=>tipo["value"]==valor);
            if (index>-1)
            Value = this.tipos[index]["label"];
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


      
    menuSupervision(){
      console.log('opened menu');
    }

  supervisarTodas(lr){
    //console.log(lr.rows,lr.sortField,lr.sortOrder);

    // this.items.filter((item)=>{
    //   console.log(item.supervision)
    //   if (item.supervision==0) return item;
    // })
    let x=1;
    let z=1;
    let sinSupervisar = this.items.filter((item)=>{
      //console.log(item.supervision)
      if (item.supervision==0) return item;
    })
    //console.log(sinSupervisar)
    sinSupervisar.forEach(async (item) => {
      item.supervision = 1;
      //this.saveItem(item)
      this.saveItem(item).then(
        (valorx)=>{
          z+=1;
          this.supervisarBatch = (100 / this.countSinSupervisar)*z;
          if(this.supervisarBatch > 99 || z >= this.countSinSupervisar){
            setTimeout(()=>{this.supervisarBatch=0},1000);
            this.setAlerta('alertas.saveOk')
          }
        }
      )

      
      x += 1;
    })
    //setTimeout(()=>{this.supervisarBatch=0},1000);
  }

  // save(item,i){
  //   return new Promise((resolve)=>{
  //     this.saveItem(item).then(
  //       (valor)=>{
  //         resolve (i);
  //       }
  //     )
  //   })
  // }

}