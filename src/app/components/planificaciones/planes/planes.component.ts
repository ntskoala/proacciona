import { Component, Input, OnInit,Output,EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { DataTable, Column } from 'primeng/primeng';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from '@ngx-translate/core';

import { EmpresasService } from '../../../services/empresas.service';
import { Servidor } from '../../../services/servidor.service';
import { URLS,cal } from '../../../models/urls';
import { Empresa } from '../../../models/empresa';
import { Planificacion } from '../../../models/planificacion';
import { Modal } from '../../../models/modal';
import {MatSelect,MatSnackBar} from '@angular/material';
import * as moment from 'moment';
export class Familia{
  constructor(
    public id: number,
    public idempresa: number,
    public nombre:string,
    public descripcion:string
  ){}
}
@Component({
  selector: 'app-planes',
  templateUrl: './planes.component.html',
  styleUrls: ['./planes.component.css']
})
export class PlanesComponent implements OnInit {
  @ViewChild('choicer') Choicer: MatSelect;
  //@ViewChild('saveTT') saveTT: matTooltip;
  //@Output() planSeleccionado: EventEmitter<Planificacion>=new EventEmitter<Planificacion>();
  @Output() listaPlanes: EventEmitter<Planificacion[]>=new EventEmitter<Planificacion[]>();

  public incidencia:any[];
  public subscription: Subscription;
  public planActivo: number = 0;
  public plan: Planificacion = new Planificacion(0,null,null,null,0,new Date(),'','',0);
  public planes: Planificacion[] = [];
  public cols:any[];
  public newRow:boolean=false;
  public guardar = [];
  public alertaGuardar:object={'guardar':false,'ordenar':false};
  public idBorrar:number;
  public cantidad:number=1;  
  public familias: Familia[];
  public alertas: object[]=[];
  public tipo:string="planificacion";
  public novoPlan: Planificacion;// = new Planificacion(0,0,'');
  public modal: Modal = new Modal();
  public modificaPlan: boolean;
  public nuevoNombre:string;
  public open:boolean;
  public import: boolean=false;
  public es;
  public entidad:string="&entidad=planificaciones";
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


  constructor(public servidor: Servidor, public empresasService: EmpresasService
    , public translate: TranslateService, private messageService: MessageService) {}

ngOnInit(){
  

 // this.subscription = this.empresasService.empresaSeleccionada.subscribe(x => this.loadChecklistList(x));
 if (this.empresasService.seleccionada) this.loadplanes(this.empresasService.seleccionada.toString());
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

     loadplanes(emp: Empresa | string) {
    let params = typeof(emp) == "string" ? emp : emp.id
    let parametros = '&idempresa=' + params+"&entidad=planificaciones&order=orden";
        //let parametros = '&idempresa=' + seleccionada.id;
        // Llamada al servidor para conseguir las checklists
        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            // Ocultar mostrar control checklists
            this.planActivo = 0;
            // Vaciar la lista actual
            this.planes = [];
            this.incidencia = []; 
            //this.planes.push(this.plan);
            if (response.success == 'true' && response.data) {
              let fecha;
              for (let element of response.data) {
                let periodicidad='true';
                if (element.periodicidad.length > 0) periodicidad = element.periodicidad;
                (moment(element.fecha).isValid())? fecha = new Date(element.fecha) : fecha = null;
                this.planes.push(new Planificacion(element.id,element.idempresa,element.nombre,element.descripcion,element.familia,fecha, periodicidad,element.responsable,element.supervisor,parseInt(element.orden)));
              this.incidencia[element.id]={'origen':'planificaciones','idOrigen':element.id}
              }
            }
          },
              (error) => {console.log(error)},
              ()=>{
              this.listaPlanes.emit(this.planes);
               //this.expand(this.Choicer.nativeElement);
              }
        );
   }
// loadFamilias(){
//   return new Promise((resolve,reject)=>{
//     let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=planificaciones_familias&order=nombre";
//         this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
//           response => {
//             this.familias = [];
//             if (response.success == 'true' && response.data) {
//               for (let element of response.data) {
//                 this.familias.push(new Familia(element.id,element.idempresa,element.nombre,element.descripcion));
//               }
//               resolve('ok');
//             }
//           },
//               (error) => {
//                 console.log(error)
//                 resolve(error)
//               },
//               ()=>{
//               }
//         );
//   });
// }


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
  let index = this.planes.findIndex((plan)=>plan.id == this.planActivo);

  let plan = this.planes[index];
  plan.nombre = this.nuevoNombre;
let param = "&entidad=planificaciones";
let parametros = '?id=' + this.planActivo+param;     
    this.servidor.putObject(URLS.STD_ITEM,parametros, plan).subscribe(
      response => {
        if (response.success) {
          console.log("updated");
          //let index = this.planes.findIndex((elem) =>elem.id == this.planActivo);
          this.planes[index].nombre = this.nuevoNombre;
          this.listaPlanes.emit(this.planes);
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
      let parametros = '?id=' + this.idBorrar+'&entidad=planificaciones';
      this.servidor.deleteObject(URLS.STD_ITEM, parametros).subscribe(
        response => {
          if (response.success) {
            let indice = this.planes.findIndex((plan) => plan.id == this.idBorrar);
           // let indice = this.mantenimientos.indexOf(controlBorrar);
           this.planes.splice(indice, 1);
            this.planActivo = 0;
            this.planes = this.planes.slice();
            //this.planSeleccionado.emit(this.planes[0]);
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
    this.plan.orden = this.planes.length+1;
    let nombreOrigen = this.plan.nombre;
    //this.plan.periodicidad = this.mantenimientos[i].periodicidad;
    //this.addnewItem = this.nuevoItem;
    
    for (let x=0;x<this.cantidad;x++){
      this.plan.orden = this.planes.length+1+x;
      if (x>0) this.plan.nombre= nombreOrigen + x;
      this.addItem(this.plan,this.plan.nombre,this.planes.length+1+x).then(
        (valor)=>{
          this.cantidad--;
          console.log(this.cantidad,valor,typeof(valor))
          if (valor && this.cantidad == 0){
            this.plan = new Planificacion(0,null,null,null,0,new Date(),'','',0);
            console.log(this.planes);
            this.planes = this.planes.slice();
          }
        }
      )
  }
  }

  addItem(plan: Planificacion, nombre,orden){
    return new Promise((resolve,reject)=>{
    let param = this.entidad;
    this.servidor.postObject(URLS.STD_ITEM, plan,param).subscribe(
      response => {
        if (response.success) {
          this.planes.push(new Planificacion(response.id,plan.idempresa,nombre,plan.descripcion,plan.familia,
          plan.fecha,plan.periodicidad,plan.responsable,plan.supervisor,orden));
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
  this.nuevoNombre = this.planes[this.planes.findIndex((plan)=>plan.id==this.planActivo)].nombre;
(this.novoPlan)? this.novoPlan = null :this.modificaPlan = !this.modificaPlan;
}

saveAll(){
  for (let x=0;x<this.guardar.length;x++){
    if (this.guardar[x]==true) {
      let indice = this.planes.findIndex((myitem)=>myitem.id==x);
      console.log ("id",x,this.planes[indice]);
      this.saveItem(this.planes[indice],indice)
    }
  }
}

 saveItem(item: Planificacion,i: number) {
  this.alertaGuardar['guardar'] = false;
  let indice = this.planes.findIndex((myitem)=>myitem.id==item.id);
    this.guardar[item.id] = false;
    let parametros = '?id=' + item.id+this.entidad;    
    item.fecha = new Date(Date.UTC(item.fecha.getFullYear(), item.fecha.getMonth(), item.fecha.getDate()))
    item.periodicidad = this.planes[indice].periodicidad; 
    //item.supervisor = this.planes[i].supervisor;
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
    let indice = this.planes.findIndex((item)=>item.id==idplan);
    this.planes[indice].periodicidad = periodicidad;
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
  this.plan  = new Planificacion(0,null,null,null,0,new Date(),'','',0);
  this.viewPeriodicidad=false;
}
}

setSupervisor(idUsuario: number,item: Planificacion){
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
// this.planes = this.planes.slice();
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
//  this.planes[this.ordenPosInicio].orden= 1+this.ordenPosFin;
//  this.reordenarUP(this.ordenPosInicio,this.ordenPosFin).then(
//  )
// }else{
//  this.planes[this.ordenPosInicio].orden = 1+this.ordenPosFin;
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
    this.planes[index].orden--;
    this.saveItem(this.planes[index],index);
    this.planes[index-1].orden++;
    this.saveItem(this.planes[index-1],index-1);
    let temp1:any = this.planes.splice(index-1,1);
    console.log(this.planes);
    this.planes.splice(index,0,temp1[0]);
    console.log(this.planes);
    
   this.planes = this.planes.slice();
  //   setTimeout(()=>{
  //     this.setOrden(evento,dt);
  //   },500);
}else{
  console.log('primer elemento');
}
}

goDown(index:number,evento:Event,dt:DataTable){
  if (index < this.planes.length-1){
    this.planes[index].orden++;
    this.saveItem(this.planes[index],index);
    this.planes[index+1].orden--;
    this.saveItem(this.planes[index+1],index+1);
    let temp1:any = this.planes.splice(index,1);
    
    console.log(this.planes);
    this.planes.splice(index+1,0,temp1[0]);
    console.log(this.planes);
  this.planes = this.planes.slice();

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
  this.planes.forEach((item) => {
    this.saveItem(item, 0);
  });
  this.planes = this.planes.slice();
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
  tabla.exportFilename = "Planificaciones";
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
//     this.planes[x].orden --;
//     x--;
//   }
// let temp1:any = this.planes.splice(inicio,1);
// console.log(this.planes);
// this.planes.splice(fin,0,temp1[0])

// console.log(this.planes,temp1);
// resolve(true);
//   });
// }

// reordenarDown(inicio:number,fin:number){
//   return new Promise((resolve,reject)=>{
//   let x=fin;
//     while (x < inicio){
//     this.planes[x].orden ++
//     x++;
//   }
// let temp1:any = this.planes.splice(inicio,1);
// console.log(this.planes);
// this.planes.splice(fin,0,temp1[0])

// console.log(this.planes,temp1);
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
    this.informeData = await this.ConvertToCSV(this.cols, this.planes);
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
                this.translate.get('Planificaciones').subscribe((desc)=>{informe=desc});
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
