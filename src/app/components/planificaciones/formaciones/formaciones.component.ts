import { Component, OnInit, Input, Output, OnChanges, ViewChild, EventEmitter } from '@angular/core';
import { Router,ActivatedRoute, ParamMap  } from '@angular/router';

import { DomSanitizer } from '@angular/platform-browser';

import {DataTable,Column} from 'primeng/primeng';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from '@ngx-translate/core';

import { Servidor } from '../../../services/servidor.service';
import { URLS,cal } from '../../../models/urls';
import { EmpresasService } from '../../../services/empresas.service';
import { Formacion } from '../../../models/formaciones';
// import { LimpiezaZona } from '../../models/limpiezazona';
  import { Usuario } from '../../../models/usuario';

import { Modal } from '../../../models/modal';
import * as moment from 'moment';
import { isDate } from '@angular/common/src/i18n/format_date';
import { SwitchView } from '@angular/common/src/directives/ng_switch';
@Component({
  selector: 'app-formaciones',
  templateUrl: './formaciones.component.html',
  styleUrls: ['./formaciones.component.css']
})
export class FormacionesComponent implements OnInit {
 // @ViewChild('choicer') Choicer: MatSelect;
  //@ViewChild('saveTT') saveTT: matTooltip;
  //@Output() planSeleccionado: EventEmitter<Planificacion>=new EventEmitter<Planificacion>();
  @Output() listaFormaciones: EventEmitter<Formacion[]>=new EventEmitter<Formacion[]>();

  public incidencia:any[];
 // public subscription: Subscription;
  public planActivo: number = 0;
  public plan: Formacion = new Formacion(0,null,null,null,0,new Date(),'','','',0);
  public formaciones: Formacion[] = [];
  public cols:any[];
  public newRow:boolean=false;
  public guardar = [];
  public alertaGuardar:object={'guardar':false,'ordenar':false};
  public idBorrar:number;
  public cantidad:number=1;  
//  public familias: Familia[];
  public docs: string[];
  public alertas: object[]=[];
  public tipo:string="libre";
  public novoPlan: Formacion;// = new Planificacion(0,0,'');
  public modal: Modal = new Modal();
  public modificaPlan: boolean;
  public nuevoNombre:string;
  public open:boolean;
  public import: boolean=false;
  public es;
  public entidad:string="&entidad=formaciones";
  public ordenPosInicio:number;
  public ordenPosFin:number;
  public procesando:boolean=false;
public viewPeriodicidad: any=null;
public posY='';
//***   EXPORT DATA */
public exportar_informes: boolean =false;
public exportando:boolean=false;
public informeData:any;
//***   EXPORT DATA */
  //******IMAGENES */
  //public url; 
  public baseurl;
  public verdoc:boolean=false;
  public pdfSrc: string=null;
  public paginaPdf:number=1;
  public maxPdf:number=1;
  public zoomPdf:number=1;
  public top = '50px';

  constructor(public servidor: Servidor, public empresasService: EmpresasService
    , public translate: TranslateService, private messageService: MessageService) {}

ngOnInit(){
  

 // this.subscription = this.empresasService.empresaSeleccionada.subscribe(x => this.loadChecklistList(x));
 if (this.empresasService.seleccionada) this.loadplanes(this.empresasService.seleccionada);
//  this.loadFamilias();
this.es=cal;
        this.cols = [
          { field: 'nombre', header: 'Nombre', type: 'std', width:160,orden:true,'required':true },
          { field: 'descripcion', header: 'planificaciones.descripcion', type: 'std', width:160,orden:true,'required':true },
          { field: 'fecha', header: 'fecha', type: 'fecha', width:120,orden:true,'required':true },
          { field: 'periodicidad', header: 'periodicidad', type: 'periodicidad', width:90,orden:false,'required':false },
          { field: 'responsable', header: 'responsable', type: 'std', width:130,orden:true,'required':false }
        ];
}

     loadplanes(emp: number) {
    let parametros = '&idempresa=' + emp+"&entidad=formaciones&order=orden";
        //let parametros = '&idempresa=' + seleccionada.id;
        // Llamada al servidor para conseguir las checklists
        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            // Ocultar mostrar control checklists
            this.planActivo = 0;
            // Vaciar la lista actual
            this.formaciones = [];
            this.incidencia = []; 
            this.docs=[];
            //this.formaciones.push(this.plan);
            if (response.success == 'true' && response.data) {
              let fecha;
              for (let element of response.data) {
                let periodicidad='true';
                if (element.periodicidad.length > 0) periodicidad = element.periodicidad;
                (moment(element.fecha).isValid())? fecha = new Date(element.fecha) : fecha = null;
                this.formaciones.push(new Formacion(element.id,element.idempresa,element.nombre,element.descripcion,element.familia,fecha, periodicidad,element.responsable,element.doc,element.supervisor,parseInt(element.orden)));
              this.incidencia[element.id]={'origen':'formaciones','idOrigen':element.id}
              //this.images[element.id] = this.baseurl + element.id + "_"+element.imagen;
              this.docs[element.id] = this.baseurl + element.id + "_"+element.doc;

              }
            }
          },
              (error) => {console.log(error)},
              ()=>{
                console.log('cursos1:',this.formaciones);
              this.listaFormaciones.emit(this.formaciones);
               //this.expand(this.Choicer.nativeElement);
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
  //console.log(evento)
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

noMostrar(evento){
console.log(evento);
}

modificar(){
  let index = this.formaciones.findIndex((plan)=>plan.id == this.planActivo);

  let plan = this.formaciones[index];
  plan.nombre = this.nuevoNombre;
let param = "&entidad=formaciones";
let parametros = '?id=' + this.planActivo+param;     
    this.servidor.putObject(URLS.STD_ITEM,parametros, plan).subscribe(
      response => {
        if (response.success) {
          console.log("updated");
          //let index = this.formaciones.findIndex((elem) =>elem.id == this.planActivo);
          this.formaciones[index].nombre = this.nuevoNombre;
          this.listaFormaciones.emit(this.formaciones);
          this.modificaPlan = false;
        }
    });
}


checkBorrar(idBorrar: number) {
  // Guardar el id del control a borrar
  this.idBorrar = idBorrar;
  // Crea el modal
  this.modal.titulo = 'borrarPlanT';
  this.modal.subtitulo = 'borrarPlanST';
  this.modal.eliminar = true;
  this.modal.visible = true;
}
  cerrarModal(event: boolean) {
    this.modal.visible = false;
    if (event) {
      let parametros = '?id=' + this.idBorrar+'&entidad=formaciones';
      this.servidor.deleteObject(URLS.STD_ITEM, parametros).subscribe(
        response => {
          if (response.success) {
            let indice = this.formaciones.findIndex((plan) => plan.id == this.idBorrar);
           // let indice = this.mantenimientos.indexOf(controlBorrar);
           this.formaciones.splice(indice, 1);
            this.planActivo = 0;
            this.formaciones = this.formaciones.slice();
            //this.planSeleccionado.emit(this.formaciones[0]);
          }
      });
    }
  }

eliminaPlan(){
      this.modal.titulo = 'borrarControlT';
    this.modal.subtitulo = 'borrarControlST';
    this.modal.eliminar = true;
    this.modal.visible = true;
}

  newItem() {
    console.log (this.plan);
    this.plan.fecha = new Date(Date.UTC(this.plan.fecha.getFullYear(), this.plan.fecha.getMonth(), this.plan.fecha.getDate()))
    this.plan.idempresa = this.empresasService.seleccionada;
    this.plan.orden = this.formaciones.length+1;
    let nombreOrigen = this.plan.nombre;
    //this.plan.periodicidad = this.mantenimientos[i].periodicidad;
    //this.addnewItem = this.nuevoItem;
    
    for (let x=0;x<this.cantidad;x++){
      this.plan.orden = this.formaciones.length+1+x;
      if (x>0) this.plan.nombre= nombreOrigen + x;
      this.addItem(this.plan,this.plan.nombre,this.formaciones.length+1+x).then(
        (valor)=>{
          this.cantidad--;
          console.log(this.cantidad,valor,typeof(valor))
          if (valor && this.cantidad == 0){
            this.plan = new Formacion(0,null,null,null,0,new Date(),'','','',0);
            console.log(this.formaciones);
            this.formaciones = this.formaciones.slice();
          }
        }
      )
  }
  }

  addItem(plan: Formacion, nombre,orden){
    return new Promise((resolve,reject)=>{
    let param = this.entidad;
    this.servidor.postObject(URLS.STD_ITEM, plan,param).subscribe(
      response => {
        if (response.success) {
          this.formaciones.push(new Formacion(response.id,plan.idempresa,nombre,plan.descripcion,plan.familia,
          plan.fecha,plan.periodicidad,plan.responsable,plan.doc,plan.supervisor,orden));
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


modificarItem(){
  this.nuevoNombre = this.formaciones[this.formaciones.findIndex((plan)=>plan.id==this.planActivo)].nombre;
(this.novoPlan)? this.novoPlan = null :this.modificaPlan = !this.modificaPlan;
}

saveAll(){
  for (let x=0;x<this.guardar.length;x++){
    if (this.guardar[x]==true) {
      let indice = this.formaciones.findIndex((myitem)=>myitem.id==x);
      console.log ("id",x,this.formaciones[indice]);
      this.saveItem(this.formaciones[indice],indice)
    }
  }
}

 saveItem(item: Formacion,i: number) {
  this.alertaGuardar['guardar'] = false;
  let indice = this.formaciones.findIndex((myitem)=>myitem.id==item.id);
    this.guardar[item.id] = false;
    let parametros = '?id=' + item.id+this.entidad;    
    item.fecha = new Date(Date.UTC(item.fecha.getFullYear(), item.fecha.getMonth(), item.fecha.getDate()))
    item.periodicidad = this.formaciones[indice].periodicidad; 
    //item.supervisor = this.formaciones[i].supervisor;
    console.log(item,i);
    this.servidor.putObject(URLS.STD_ITEM, parametros, item).subscribe(
      response => {
        if (response.success) {
          console.log('item updated');
        }
    });

  }






setPeriodicidad(periodicidad: string, idplan?: number, i?: number){
  this.viewPeriodicidad=null;
  if (!idplan){
  this.plan.periodicidad = periodicidad;
  console.log(this.plan.periodicidad);

  }else{
    // console.log(idmantenimiento,i);
    // this.itemEdited(idmantenimiento);
    // this.mantenimientos[i].periodicidad = periodicidad;
    this.itemEdited(idplan);
    let indice = this.formaciones.findIndex((item)=>item.id==idplan);
    this.formaciones[indice].periodicidad = periodicidad;
  }
  //this.nuevoMantenimiento  = new MantenimientosMaquina(0,0,'','');
}
openPeriodicidad(Plan,evento?){
  this.posY='';
  console.log('view Periodicidad Ok',Plan,evento);
  if (Plan.id == 0){
    this.viewPeriodicidad='true';
  }else{
    if(evento.view.scrollY > 180)
    this.posY=(evento.view.scrollY-150) + 'px';
    this.plan= Plan;
    this.viewPeriodicidad=Plan.periodicidad;
  }
}
closePeriodicidad(activo){
if (activo==false){
  this.plan  = new Formacion(0,null,null,null,0,new Date(),'','','',0);
  this.viewPeriodicidad=false;
}
}

setSupervisor(idUsuario: number,item: Formacion){
item.supervisor = idUsuario;
this.itemEdited(item.id);
}

///*******DRAG & DROP */
// dragStart(index:number){
// this.ordenPosInicio = index;
// console.log('dragStart',index);
// }

// dragEnd(){

// console.log('dragEnd');
// this.formaciones = this.formaciones.slice();
// }
// drop(index:number, dt:DataTable, evento:Event){
//   console.log('drop',index);
//   console.log('csv aplicado',dt.csvSeparator);
// this.ordenPosFin = index;

// // let miColumna:Column = new Column();//  = {'field':'orden','header':'orden','sortable':true,'sortField':'otro'}
// // miColumna.field= 'orden';
// // miColumna.header = 'orden';
// // miColumna.sortable = true;
// // miColumna.sortField = 'orden';
// if (this.ordenPosInicio < this.ordenPosFin){
//  this.formaciones[this.ordenPosInicio].orden= 1+this.ordenPosFin;
//  this.reordenarUP(this.ordenPosInicio,this.ordenPosFin).then(
//  )
// }else{
//  this.formaciones[this.ordenPosInicio].orden = 1+this.ordenPosFin;
//  this.reordenarDown(this.ordenPosInicio,this.ordenPosFin).then(
//  )
// }
// this.ordenPosInicio = null;
// this.ordenPosFin = null;
// }

///*******DRAG & DROP */

// setOrden(evento:Event, dt:DataTable){
// let miColumna:Column = new Column();//  = {'field':'orden','header':'orden','sortable':true,'sortField':'otro'}
// miColumna.field= 'orden';
// miColumna.header = 'orden';
// miColumna.sortable = true;
// miColumna.sortField = 'orden';
// //dt.reset();
// dt.sort(evento,miColumna);
// }

goUp(index:number,evento:Event,dt:DataTable){
if (index >0){
    this.formaciones[index].orden--;
    this.saveItem(this.formaciones[index],index);
    this.formaciones[index-1].orden++;
    this.saveItem(this.formaciones[index-1],index-1);
    let temp1:any = this.formaciones.splice(index-1,1);
    console.log(this.formaciones);
    this.formaciones.splice(index,0,temp1[0]);
    console.log(this.formaciones);
    
   this.formaciones = this.formaciones.slice();
  //   setTimeout(()=>{
  //     this.setOrden(evento,dt);
  //   },500);
}else{
  console.log('primer elemento');
}
}

goDown(index:number,evento:Event,dt:DataTable){
  if (index < this.formaciones.length-1){
    this.formaciones[index].orden++;
    this.saveItem(this.formaciones[index],index);
    this.formaciones[index+1].orden--;
    this.saveItem(this.formaciones[index+1],index+1);
    let temp1:any = this.formaciones.splice(index,1);
    
    console.log(this.formaciones);
    this.formaciones.splice(index+1,0,temp1[0]);
    console.log(this.formaciones);
  this.formaciones = this.formaciones.slice();

    // setTimeout(()=>{
    //   this.setOrden(evento,dt);
    // },500);
  }else{
    console.log('ultimo elemento');
  }
}

ordenar() {
  console.log('ORDENANDO')
  this.procesando = true;
  this.alertaGuardar['ordenar'] = false;
  this.formaciones.forEach((item) => {
    this.saveItem(item, 0);
  });
  this.formaciones = this.formaciones.slice();
  this.procesando = false;
}

editOrden(){
  if (!this.alertaGuardar['ordenar']){
    this.alertaGuardar['ordenar'] = true;
    this.setAlerta('alertas.nuevoOrden');
    }
}

exportData(tabla: DataTable){
  console.log(tabla);
  let origin_Value = tabla._value;

  tabla._value = tabla.dataToRender;
  tabla._value.map((plan)=>{
      (moment(plan.fecha).isValid())?plan.fecha = moment(plan.fecha).format("DD/MM/YYYY"):'';
      plan.periodicidad=this.checkPeriodo(plan.periodicidad);
      });

  tabla.csvSeparator = ";";
  tabla.exportFilename = "formaciones";
  tabla.exportCSV();
  tabla._value = origin_Value;
}

checkPeriodo(periodicidad: string): string{
  if (periodicidad){
    let valor:string;
    let periodo = JSON.parse(periodicidad);
    return periodo.repeticion;
    }else{
      return 'Nul';
    }
  }


// reordenarUP(inicio:number,fin:number){
//   return new Promise((resolve,reject)=>{
//   let x=fin;
//     while (x > inicio){
//     this.formaciones[x].orden --;
//     x--;
//   }
// let temp1:any = this.formaciones.splice(inicio,1);
// console.log(this.formaciones);
// this.formaciones.splice(fin,0,temp1[0])

// console.log(this.formaciones,temp1);
// resolve(true);
//   });
// }

// reordenarDown(inicio:number,fin:number){
//   return new Promise((resolve,reject)=>{
//   let x=fin;
//     while (x < inicio){
//     this.formaciones[x].orden ++
//     x++;
//   }
// let temp1:any = this.formaciones.splice(inicio,1);
// console.log(this.formaciones);
// this.formaciones.splice(fin,0,temp1[0])

// console.log(this.formaciones,temp1);
// resolve(true);
//   });
// }


// mouseUp(evento:Event){
//   console.log('mouse Up' , evento);
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
      //**** EXPORTAR DATA */

  async exportarTable(){
    this.exportando=true;
    this.informeData = await this.ConvertToCSV(this.cols, this.formaciones);
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
                this.translate.get('formaciones').subscribe((desc)=>{informe=desc});
                return {'cabecera':[informeCabecera],'rows':informeRows,'comentarios':[],'informes':informe};
    }

    getDropDownValor(tabla,valor){
      let Value;
      switch (tabla){
        case "pieza":
        break;
        case "tipo":
        break;
      }
      console.log(tabla,valor,Value);
      return Value;
    }



}