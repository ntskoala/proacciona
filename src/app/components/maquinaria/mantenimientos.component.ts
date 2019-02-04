import { Component, OnInit, Input, Output,ViewChild, OnChanges, EventEmitter } from '@angular/core';
//import { DatePickerOptions, DateModel } from 'ng2-datepicker';
import {DataTable} from 'primeng/primeng';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from '@ngx-translate/core';

import * as moment from 'moment';

import { Servidor } from '../../services/servidor.service';
import { URLS,cal } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { Empresa } from '../../models/empresa';
import { MantenimientosMaquina } from '../../models/mantenimientosmaquina';
 import { Maquina } from '../../models/maquina';
 import { Modal } from '../../models/modal';
import { ValueTransformer } from '@angular/compiler/src/util';
@Component({
  selector: 'mantenimientos',
  templateUrl: './mantenimientos.component.html',
  styleUrls: ['mantenimientos.css']
})
export class MantenimientosComponent implements OnInit, OnChanges {
@Input() maquina:Maquina;
@Input() Piezas;
@Output() onMantenimientosMaquina: EventEmitter<MantenimientosMaquina[]> = new EventEmitter;
@ViewChild('DT') dt: DataTable;
public pieza:object[]
momento: any;
//  date: DateModel[]=[];
 // options: DatePickerOptions;
public mantenimientos: MantenimientosMaquina[] =[]; 
public nuevoMantenimiento: MantenimientosMaquina = new MantenimientosMaquina(0,0,'','');
public newRow:boolean=false;
public guardar =[];
public alertaGuardar:object={'guardar':false,'ordenar':false};
public cantidad:number=1;  
public cols:any[];
public idBorrar;
public es:any=cal;
public procesando: boolean = false;
public viewPeriodicidad: any=null;
public posY='';
//***   EXPORT DATA */
public exportar_informes: boolean =false;
public exportando:boolean=false;
public informeData:any;
//***   EXPORT DATA */


public tipo:object[]=[{label:'Interno', value:'interno'},{label:'Externo', value:'externo'}];
  modal: Modal = new Modal();
  constructor(public servidor: Servidor,public empresasService: EmpresasService
    , public translate: TranslateService, private messageService: MessageService) {}

  ngOnInit() {
    //solo se carga el control si hay una maquina seleccionada, por eso no necesito controlar
  //  this.setMantenimientos();
 
        if (localStorage.getItem("idioma")=="cat") this.tipo=[{label:'Intern', value:'interno'},{label:'Extern', value:'externo'}];
        this.cols = [
          { field: 'nombre', header: 'Nombre', type: 'std', width:160,orden:true,'required':true },
          { field: 'fecha', header: 'fecha', type: 'fecha', width:120,orden:true,'required':true },
          { field: 'tipo', header: 'tipo', type: 'dropdown', width:115,orden:true,'required':true },
          { field: 'pieza', header: 'maquinas.pieza', type: 'dropdown', width:120,orden:false,'required':false },
          { field: 'cantidadPiezas', header: 'maquinas.cantidadPiezas', type: 'std', width:60,orden:false,'required':false },
          { field: 'periodicidad', header: 'periodicidad', type: 'periodicidad', width:90,orden:false,'required':false },
          { field: 'responsable', header: 'responsable', type: 'std', width:130,orden:true,'required':false }
        ];
        this.nuevoMantenimiento.pieza=0;
        this.nuevoMantenimiento.cantidadPiezas=0;
    }

ngOnChanges(){
    this.setMantenimientos();
    let valorTrans='';
    this.translate.get('maquinas.ninguna').subscribe((valor)=>valorTrans=valor)
    if(this.Piezas){
    this.pieza = this.Piezas.map((pieza)=>{return {'label':pieza["nombre"],'value':pieza["id"]}});
    this.pieza.unshift({'label':valorTrans,'value':0});
    }else{
      this.pieza =[{'label':valorTrans,'value':0}];
    }

}
getOptions(option){
if (option=='tipo'){
return this.tipo;
}else{
return this.pieza;
}
}


  setMantenimientos(){
    let params = this.maquina.id;
    let parametros = '&idmaquina=' + params;
       // let parametros = '&idempresa=' + seleccionada.id; 
        this.servidor.getObjects(URLS.MANTENIMIENTOS, parametros).subscribe(
          response => {
            this.mantenimientos = [];
            let i=0;
            
            this.momento = Date();
            if (response.success && response.data) {
              let orden:number = 0;

              for (let element of response.data) {
                let periodicidad='true';
                if (element.periodicidad.length > 0) periodicidad = element.periodicidad;
                if (element.orden == 0){
                  //this.itemEdited(element.id);
                  this.guardar[element.id] = true;
                  orden++;
                  }else{
                    orden=parseInt(element.orden);
                    this.guardar[element.id] = false;
                  }
                this.mantenimientos.push(new MantenimientosMaquina(element.id, element.idmaquina, element.nombre,new Date(element.fecha), element.tipo, periodicidad,
                  element.tipoperiodo, element.doc,element.usuario,element.responsable,0+orden,element.pieza,element.cantidadPiezas));
                
//                this.date.push({"day":"","month":"","year":"","formatted":element.fecha,"momentObj":this.moment}) 
                i++;
              }
             // console.log(this.guardar)
            // let widz = 430 + (this.mantenimientos.length*50);
            // if ( document.getElementById("testid") !== null)
            // document.getElementById("testid").style.minHeight= widz+"px";
            }
        },
       error=>console.log(error),
        ()=>{ 
        let widz = 430 + (this.mantenimientos.length*50);
            if ( document.getElementById("testid") !== null)
            document.getElementById("testid").style.minHeight= widz+"px";
           // console.log("mantenimientos preventivos",this.mantenimientos);
           this.onMantenimientosMaquina.emit(this.mantenimientos);
        }
        );
  }


  //   modificarMantenimiento(idMantenimiento: number, fecha?: any) {
  //   this.guardar[idMantenimiento] = true;
  //   //console.log (fecha.toString());
  // }
  onEdit(evento){
    this.itemEdited(evento.data.id);
    }

  itemEdited(idItem: number, fecha?: any) {
        this.guardar[idItem] = true;
        if (!this.alertaGuardar['guardar']){
          this.alertaGuardar['guardar'] = true;
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

saveAll(){
for (let x=0;x<this.guardar.length;x++){
  if (this.guardar[x]==true) {
    let indice = this.mantenimientos.findIndex((myitem)=>myitem.id==x);
    console.log ("id",x,this.mantenimientos[indice]);
    this.saveItem(this.mantenimientos[indice],indice)
  }
}
 
}

//  actualizarMantenimiento(mantenimiento: MantenimientosMaquina, i: number, event: any) {
  saveItem(mantenimiento: MantenimientosMaquina, i: number, event?: any) {
    let indice = this.mantenimientos.findIndex((myitem)=>myitem.id==mantenimiento.id);
  // console.log ("evento",event);
    this.guardar[mantenimiento.id] = false;
    this.alertaGuardar['guardar'] = false;
    console.log ("actualizar_mantenimiento",mantenimiento,this.mantenimientos[i].periodicidad);
    mantenimiento.fecha = new Date(Date.UTC(mantenimiento.fecha.getFullYear(), mantenimiento.fecha.getMonth(), mantenimiento.fecha.getDate()))
   
    mantenimiento.periodicidad = this.mantenimientos[indice].periodicidad;


    let parametros = '?id=' + mantenimiento.id;        
    this.servidor.putObject(URLS.MANTENIMIENTOS, parametros, mantenimiento).subscribe(
      response => {
        if (response.success) {
          this.setAlerta('alertas.saveOk');
          console.log('Mantenimiento updated');
        }
    });
  }

  crearMantenimiento() {
    console.log (this.nuevoMantenimiento);
    this.nuevoMantenimiento.idmaquina = this.maquina.id;
    this.nuevoMantenimiento.fecha = new Date(Date.UTC(this.nuevoMantenimiento.fecha.getFullYear(), this.nuevoMantenimiento.fecha.getMonth(), this.nuevoMantenimiento.fecha.getDate()))
    let nombreOrigen = this.nuevoMantenimiento.nombre;
    let orden;

    for (let x=0;x<this.cantidad;x++){
      if ( this.mantenimientos.length && this.mantenimientos[this.mantenimientos.length-1].orden >0){
       orden = this.nuevoMantenimiento.orden=this.mantenimientos[this.mantenimientos.length-1].orden+1+x;
      }else{
       orden = this.nuevoMantenimiento.orden=0;
      }
      if (x>0) this.nuevoMantenimiento.nombre= nombreOrigen + x;
      this.addItem(this.nuevoMantenimiento,nombreOrigen,orden).then(
        (valor)=>{
          this.cantidad--;
          console.log(this.cantidad,valor,typeof(valor))
          if (valor && this.cantidad == 0){
            this.nuevoMantenimiento = new MantenimientosMaquina(0,0,'','');
            this.nuevoMantenimiento.pieza=0;
            this.nuevoMantenimiento.cantidadPiezas=0;
            this.mantenimientos = this.mantenimientos.slice();
          }
        }
      )
  }
}

  addItem(item: MantenimientosMaquina, nombre,orden){
    return new Promise((resolve,reject)=>{
    this.servidor.postObject(URLS.MANTENIMIENTOS, item).subscribe(
      response => {
        if (response.success) {
          item.id = response.id;
          this.mantenimientos.push(new MantenimientosMaquina(response.id,item.idmaquina,nombre,item.fecha,item.tipo,
          item.periodicidad,item.tipo_periodo,item.doc,item.usuario,item.responsable,orden,item.pieza,item.cantidadPiezas));
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
      let parametros = '?id=' + this.idBorrar;
      this.servidor.deleteObject(URLS.MANTENIMIENTOS, parametros).subscribe(
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


setPeriodicidad(periodicidad: string, idmantenimiento?: number, i?: number){
  this.viewPeriodicidad=null;
  if (!idmantenimiento){
  this.nuevoMantenimiento.periodicidad = periodicidad;
  console.log(this.nuevoMantenimiento.periodicidad);

  }else{
    // console.log(idmantenimiento,i);
    // this.itemEdited(idmantenimiento);
    // this.mantenimientos[i].periodicidad = periodicidad;
    this.itemEdited(idmantenimiento);
    let indice = this.mantenimientos.findIndex((item)=>item.id==idmantenimiento);
    this.mantenimientos[indice].periodicidad = periodicidad;
  }
  //this.nuevoMantenimiento  = new MantenimientosMaquina(0,0,'','');
}
openPeriodicidad(Mantenimiento,evento?){
  this.posY='';
  console.log('view Periodicidad Ok',Mantenimiento);
  if (Mantenimiento.id == 0){
    this.viewPeriodicidad='true';
  }else{
    if(evento.view.scrollY > 180)
    this.posY=(evento.view.scrollY-150) + 'px';
    this.nuevoMantenimiento= Mantenimiento;
    this.viewPeriodicidad=Mantenimiento.periodicidad;

  }
}
closePeriodicidad(activo){
if (activo==false){
  this.nuevoMantenimiento  = new MantenimientosMaquina(0,0,'','');
  this.viewPeriodicidad=false;
}
}

// goUp(index:number,evento:Event){
//   if (index >0){
//       this.mantenimientos[index].orden--;
//       this.saveItem(this.mantenimientos[index],index);
//       this.mantenimientos[index-1].orden++;
//       this.saveItem(this.mantenimientos[index-1],index-1);
//       let temp1:any = this.mantenimientos.splice(index-1,1);
//       console.log(this.mantenimientos);
//       this.mantenimientos.splice(index,0,temp1[0]);
//       console.log(this.mantenimientos);
//      this.mantenimientos = this.mantenimientos.slice();
//   }else{
//     console.log('primer elemento');
//   }
//   }
  
  // goDown(index:number,evento:Event){
  //   if (index < this.mantenimientos.length-1){
  //     this.mantenimientos[index].orden++;
  //     this.saveItem(this.mantenimientos[index],index);
  //     this.mantenimientos[index+1].orden--;
  
  //     this.saveItem(this.mantenimientos[index+1],index+1);
  //     let temp1:any = this.mantenimientos.splice(index,1);
      
  //     console.log(this.mantenimientos);
  //     this.mantenimientos.splice(index+1,0,temp1[0]);
  //     console.log(this.mantenimientos);
  //   this.mantenimientos = this.mantenimientos.slice();
  //   }else{
  //     console.log('ultimo elemento');
  //   }
  // }
  goUp(index: number, evento: Event) {
    if (index > 0) {
      this.dt._value[index].orden--;
      this.saveItem(this.dt._value[index], index);
      this.dt._value[index - 1].orden++;
      this.saveItem(this.dt._value[index - 1], index - 1);
      let temp1: any = this.dt._value.splice(index - 1, 1);
      this.dt._value.splice(index, 0, temp1[0]);
      this.mantenimientos = this.mantenimientos.slice();
    } else {
      console.log('primer elemento');
    }
  }

  goDown(index: number, evento: Event) {
    if (index < this.mantenimientos.length - 1) {
      this.dt._value[index].orden++;
      this.saveItem(this.dt._value[index], index);
      this.dt._value[index + 1].orden--;
      this.saveItem(this.dt._value[index + 1], index + 1);
      let temp1: any = this.dt._value.splice(index, 1);
      console.log(this.dt._value);
      this.dt._value.splice(index + 1, 0, temp1[0]);
      console.log(this.dt._value);
      this.mantenimientos = this.mantenimientos.slice();
    } else {
      console.log('ultimo elemento');
    }
  }

exportData(tabla: DataTable){
  console.log(tabla);
  let origin_Value = tabla._value;

  tabla._value = tabla.dataToRender;
  tabla._value.map((maquina)=>{
      (moment(maquina.fecha).isValid())?maquina.fecha = moment(maquina.fecha).format("DD/MM/YYYY"):'';
      maquina.periodicidad=this.checkPeriodo(maquina.periodicidad);
      });

  tabla.csvSeparator = ";";
  tabla.exportFilename = "Mantenimietos_preventivos_ "+this.maquina.nombre;
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

  ordenar() {
    console.log('ORDENANDO')
    this.procesando = true;
    this.alertaGuardar['ordenar'] = false;
    this.mantenimientos.forEach((item) => {
      this.saveItem(item, 0);
    });
    this.mantenimientos = this.mantenimientos.slice();
    this.procesando = false;
  }

  editOrden(){
    if (!this.alertaGuardar['ordenar']){
      this.alertaGuardar['ordenar'] = true;
      this.setAlerta('alertas.nuevoOrden');
      }
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
                this.translate.get('maquinas.mantenimientos').subscribe((desc)=>{informe=desc});
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