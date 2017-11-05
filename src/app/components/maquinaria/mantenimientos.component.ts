import { Component, OnInit, Input, OnChanges } from '@angular/core';
//import { DatePickerOptions, DateModel } from 'ng2-datepicker';
import {DataTable} from 'primeng/primeng';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from 'ng2-translate';

import * as moment from 'moment';

import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { Empresa } from '../../models/empresa';
import { MantenimientosMaquina } from '../../models/mantenimientosmaquina';
 import { Maquina } from '../../models/maquina';
 import { Modal } from '../../models/modal';
@Component({
  selector: 'mantenimientos',
  templateUrl: './mantenimientos.component.html',
  styleUrls: ['mantenimientos.css']
})
export class MantenimientosComponent implements OnInit, OnChanges {
@Input() maquina:Maquina;
momento: any;
//  date: DateModel[]=[];
 // options: DatePickerOptions;
public mantenimientos: MantenimientosMaquina[] =[]; 
public nuevoMantenimiento: MantenimientosMaquina = new MantenimientosMaquina(0,0,'','');
public guardar =[];
public alertaGuardar:boolean=false;
public cantidad:number=1;  

public idBorrar;
public es:any;

public tipos:object[]=[{label:'interno', value:'interno'},{label:'externo', value:'externo'}];
  modal: Modal = new Modal();
  constructor(public servidor: Servidor,public empresasService: EmpresasService
    , public translate: TranslateService, private messageService: MessageService) {}

  ngOnInit() {
    //solo se carga el control si hay una maquina seleccionada, por eso no necesito controlar
  //  this.setMantenimientos();
           this.es = {
            monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
                'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            dayNames: ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'],
            dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
            dayNamesMin: ["Do","Lu","Ma","Mi","Ju","Vi","Sa"],
            firstDayOfWeek: 1
        }; 
    }

ngOnChanges(){
    this.setMantenimientos();

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
                if (element.orden == 0){
                  //this.itemEdited(element.id);
                  this.guardar[element.id] = true;
                  orden++;
                  }else{
                    orden=parseInt(element.orden);
                    this.guardar[element.id] = false;
                  }
                this.mantenimientos.push(new MantenimientosMaquina(element.id, element.idmaquina, element.nombre,new Date(element.fecha), element.tipo, element.periodicidad,
                  element.tipoperiodo, element.doc,element.usuario,element.responsable,0+orden));
                
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
            console.log("mantenimientos preventivos",this.mantenimientos);
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
        if (!this.alertaGuardar){
          this.alertaGuardar = true;
          this.setAlerta('alertas.guardar');
          }

      }
      setAlerta(concept:string){
        let concepto;
        this.translate.get(concept).subscribe((valor)=>concepto=valor)  
        this.messageService.add(
          {severity:'warn', 
          summary:'Info', 
          detail: concepto
          }
        );
      }



//  actualizarMantenimiento(mantenimiento: MantenimientosMaquina, i: number, event: any) {
  saveItem(mantenimiento: MantenimientosMaquina, i: number, event?: any) {
    let indice = this.mantenimientos.findIndex((myitem)=>myitem.id==mantenimiento.id);
  // console.log ("evento",event);
    this.guardar[mantenimiento.id] = false;
    this.alertaGuardar = false;
    console.log ("actualizar_mantenimiento",mantenimiento,this.mantenimientos[i].periodicidad);
    mantenimiento.fecha = new Date(Date.UTC(mantenimiento.fecha.getFullYear(), mantenimiento.fecha.getMonth(), mantenimiento.fecha.getDate()))
   
    mantenimiento.periodicidad = this.mantenimientos[indice].periodicidad;


    let parametros = '?id=' + mantenimiento.id;        
    this.servidor.putObject(URLS.MANTENIMIENTOS, parametros, mantenimiento).subscribe(
      response => {
        if (response.success) {
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
      this.addItem(this.nuevoMantenimiento,nombreOrigen + x,orden).then(
        (valor)=>{
          this.cantidad--;
          console.log(this.cantidad,valor,typeof(valor))
          if (valor && this.cantidad == 0){
            this.nuevoMantenimiento = new MantenimientosMaquina(0,0,'','');
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
          item.periodicidad,item.tipo_periodo,item.doc,item.usuario,item.responsable,orden));
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
}

goUp(index:number,evento:Event){
  if (index >0){
      this.mantenimientos[index].orden--;
      this.saveItem(this.mantenimientos[index],index);
      this.mantenimientos[index-1].orden++;
      this.saveItem(this.mantenimientos[index-1],index-1);
      let temp1:any = this.mantenimientos.splice(index-1,1);
      console.log(this.mantenimientos);
      this.mantenimientos.splice(index,0,temp1[0]);
      console.log(this.mantenimientos);
      
     this.mantenimientos = this.mantenimientos.slice();
    //   setTimeout(()=>{
    //     this.setOrden(evento,dt);
    //   },500);
  }else{
    console.log('primer elemento');
  }
  }
  
  goDown(index:number,evento:Event){
    if (index < this.mantenimientos.length-1){
      this.mantenimientos[index].orden++;
      this.saveItem(this.mantenimientos[index],index);
      this.mantenimientos[index+1].orden--;
  
      this.saveItem(this.mantenimientos[index+1],index+1);
      let temp1:any = this.mantenimientos.splice(index,1);
      
      console.log(this.mantenimientos);
      this.mantenimientos.splice(index+1,0,temp1[0]);
      console.log(this.mantenimientos);
    this.mantenimientos = this.mantenimientos.slice();
  
      // setTimeout(()=>{
      //   this.setOrden(evento,dt);
      // },500);
    }else{
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



}