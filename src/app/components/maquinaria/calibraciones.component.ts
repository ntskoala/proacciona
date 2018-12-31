import { Component, OnInit, Input, OnChanges, ViewChild, Output, EventEmitter } from '@angular/core';

import { DataTable } from 'primeng/primeng';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from '@ngx-translate/core';

import * as moment from 'moment';

import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { Empresa } from '../../models/empresa';
import { CalibracionesMaquina } from '../../models/calibracionesmaquina';
import { Maquina } from '../../models/maquina';
import { Modal } from '../../models/modal';
import { Usuario } from '../../models/usuario';
@Component({
  selector: 'calibraciones',
  templateUrl: './calibraciones.component.html',
  styleUrls: ['mantenimientos.css']
})
export class CalibracionesComponent implements OnInit, OnChanges {
  @Input() maquina: Maquina;
  @Output() onCalibracionesMaquina: EventEmitter<CalibracionesMaquina[]> = new EventEmitter;
  @ViewChild('DT') dt: DataTable;
  public nuevaFecha: Date;
  public calibraciones: CalibracionesMaquina[] = [];
  public nuevoCalibracion: CalibracionesMaquina = new CalibracionesMaquina(0, 0, '', this.nuevaFecha);
  public cols:any[];
  public newRow:boolean=false;
  public guardar = [];
  public alertaGuardar:object={'guardar':false,'ordenar':false};
  public cantidad:number=1;
  public idBorrar;
  public modal2: boolean = false;
  public es: any;
  usuarios: Usuario[] = [];
  modal: Modal = new Modal();
  public procesando: boolean = false;
  public viewPeriodicidad: any=null;
  public minHeight:number = 0;
  //***   EXPORT DATA */
  public exportar_informes: boolean =false;
  public exportando:boolean=false;
  public informeData:any;
  //***   EXPORT DATA */

  public tipo: object[] = [{ label: 'interno', value: 'interno' }, { label: 'externo', value: 'externo' }];

  constructor(public servidor: Servidor, public empresasService: EmpresasService
    , public translate: TranslateService, private messageService: MessageService) { }

  ngOnInit() {
    //solo se carga el control si hay una maquina seleccionada, por eso no necesito controlar
    //  this.setMantenimientos();
    this.es = {
      monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
        'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      dayNames: ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'],
      dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
      dayNamesMin: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
      firstDayOfWeek: 1
    };
    this.cols = [
      { field: 'nombre', header: 'Nombre', type: 'std', width:160,orden:true,'required':true },
      { field: 'fecha', header: 'fecha', type: 'fecha', width:120,orden:true,'required':true },
      { field: 'tipo', header: 'tipo', type: 'dropdown', width:115,orden:true,'required':true },
      { field: 'periodicidad', header: 'periodicidad', type: 'periodicidad', width:90,orden:false,'required':false },
      { field: 'responsable', header: 'responsable', type: 'std', width:130,orden:true,'required':false }
    ];
    if (localStorage.getItem("idioma")=="cat") this.tipo=[{label:'intern', value:'interno'},{label:'extern', value:'externo'}];

  }

  ngOnChanges() {
    this.setMantenimientos();
  }
  getOptions(option){
    if (option=='tipo'){
    return this.tipo;
    }
    }
  setMantenimientos() {
    let params = this.maquina.id;
    let parametros = '&idmaquina=' + params;
    // let parametros = '&idempresa=' + seleccionada.id; 
    this.servidor.getObjects(URLS.CALIBRACIONES, parametros).subscribe(
      response => {
        this.calibraciones = [];
        if (response.success && response.data) {
          let orden: number = 0;
          for (let element of response.data) {
            if (element.orden == 0) {
              //this.itemEdited(element.id);
              this.guardar[element.id] = true;
              orden++;
            } else {
              orden = parseInt(element.orden);
              this.guardar[element.id] = false;
            }
            this.calibraciones.push(new CalibracionesMaquina(element.id, element.idmaquina, element.nombre, new Date(element.fecha), element.tipo, element.periodicidad,
              element.tipo_periodo, element.doc, element.usuario, element.responsable, 0 + orden));
            this.guardar[element.id] = false;
          }
          this.onCalibracionesMaquina.emit(this.calibraciones);
        }

      },
      error => console.log(error),
      () => {
        console.log('calibraciones ok')
      }
    );
  }

  //   modificarMantenimiento(idMantenimiento: number) {
  //   this.guardar[idMantenimiento] = true;
  // }
  onEdit(evento) {
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
        let indice = this.calibraciones.findIndex((myitem)=>myitem.id==x);
        console.log ("id",x,this.calibraciones[indice]);
        this.saveItem(this.calibraciones[indice],indice)
      }
    }
     
    }


  saveItem(mantenimiento: CalibracionesMaquina, i: number) {
    let indice = this.calibraciones.findIndex((myitem) => myitem.id == mantenimiento.id);
    mantenimiento.periodicidad = this.calibraciones[indice].periodicidad;

    this.guardar[mantenimiento.id] = false;
    mantenimiento.fecha = new Date(Date.UTC(mantenimiento.fecha.getFullYear(), mantenimiento.fecha.getMonth(), mantenimiento.fecha.getDate()))
    let parametros = '?id=' + mantenimiento.id;
    this.servidor.putObject(URLS.CALIBRACIONES, parametros, mantenimiento).subscribe(
      response => {
        if (response.success) {
          console.log('Mantenimiento updated');
          this.setAlerta('alertas.saveOk');
          this.alertaGuardar['guardar'] = false;
        }
      });
  }
  crearMantenimiento() {
    this.nuevoCalibracion.idmaquina = this.maquina.id;
    this.nuevoCalibracion.fecha = new Date(Date.UTC(this.nuevoCalibracion.fecha.getFullYear(), this.nuevoCalibracion.fecha.getMonth(), this.nuevoCalibracion.fecha.getDate()))
    //this.nuevoCalibracion.orden = this.newOrden(this.calibraciones);
    let nombreOrigen = this.nuevoCalibracion.nombre;
    let orden;

    for (let x=0;x<this.cantidad;x++){
      orden = this.newOrden(x);
      // if ( this.calibraciones.length && this.calibraciones[this.calibraciones.length-1].orden >0){
      //  orden = this.nuevoCalibracion.orden=this.calibraciones[this.calibraciones.length-1].orden+1+x;
      // }else{
      //  orden = this.nuevoCalibracion.orden=0;
      // }
      if (x>0) this.nuevoCalibracion.nombre= nombreOrigen + x;
      this.addItem(this.nuevoCalibracion,this.nuevoCalibracion.nombre,orden).then(
        (valor)=>{
          this.cantidad--;
          console.log(this.cantidad,valor,typeof(valor))
          if (valor && this.cantidad == 0){
            this.nuevoCalibracion = new CalibracionesMaquina(0, 0, '', this.nuevaFecha);
            this.calibraciones = this.calibraciones.slice();
          }
        }
      )
  }
  }

  addItem(item: CalibracionesMaquina, nombre,orden){
    return new Promise((resolve,reject)=>{
    this.servidor.postObject(URLS.CALIBRACIONES, item).subscribe(
      response => {
        if (response.success) {
          item.id = response.id;
          this.calibraciones.push(new CalibracionesMaquina(response.id,item.idmaquina,nombre,item.fecha,item.tipo,
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
    this.modal.titulo = 'borrarControlT';
    this.modal.subtitulo = 'borrarControlST';
    this.modal.eliminar = true;
    this.modal.visible = true;
  }

  cerrarModal(event: boolean) {
    this.modal.visible = false;
    if (event) {
      let parametros = '?id=' + this.idBorrar;
      this.servidor.deleteObject(URLS.CALIBRACIONES, parametros).subscribe(
        response => {
          if (response.success) {
            let controlBorrar = this.calibraciones.find(mantenimiento => mantenimiento.id == this.idBorrar);
            let indice = this.calibraciones.indexOf(controlBorrar);
            this.reordenar(this.dt._value.findIndex((elem) => elem.id == this.idBorrar));
            this.calibraciones.splice(indice, 1);
            this.calibraciones = this.calibraciones.slice();


          }
        });
    }
  }


  // setPeriodicidad(periodicidad: string, idmantenimiento?: number, i?: number){
  //   if (!idmantenimiento){
  //   this.nuevoCalibracion.periodicidad = periodicidad;
  //   console.log(this.nuevoCalibracion.periodicidad);

  //   }else{
  //     console.log(idmantenimiento,i);
  //     this.itemEdited(idmantenimiento);
  //     this.calibraciones[i].periodicidad = periodicidad;

  //   }
  // }
  // setPeriodicidad(periodicidad: string, idmantenimiento?: number, i?: number) {
  //   if (!idmantenimiento) {
  //     this.nuevoCalibracion.periodicidad = periodicidad;
  //     console.log(this.nuevoCalibracion.periodicidad);

  //   } else {
  //     // console.log(idmantenimiento,i);
  //     // this.itemEdited(idmantenimiento);
  //     // this.mantenimientos[i].periodicidad = periodicidad;
  //     this.itemEdited(idmantenimiento);
  //     let indice = this.calibraciones.findIndex((item) => item.id == idmantenimiento);
  //     this.calibraciones[indice].periodicidad = periodicidad;
  //   }
  // }

  setPeriodicidad(periodicidad: string, idmantenimiento?: number, i?: number){
    this.viewPeriodicidad=null;
    this.minHeight=0;
    if (!idmantenimiento){
    this.nuevoCalibracion.periodicidad = periodicidad;
    console.log(this.nuevoCalibracion.periodicidad);
  
    }else{
      // console.log(idmantenimiento,i);
      // this.itemEdited(idmantenimiento);
      // this.mantenimientos[i].periodicidad = periodicidad;
      this.itemEdited(idmantenimiento);
      let indice = this.calibraciones.findIndex((item)=>item.id==idmantenimiento);
      this.calibraciones[indice].periodicidad = periodicidad;
    }
    this.nuevoCalibracion  = new CalibracionesMaquina(0,0,'','');
  }
  openPeriodicidad(Mantenimiento){
    console.log('view Periodicidad Ok',Mantenimiento);
    this.minHeight=500;
    if (Mantenimiento.id == 0){
      this.viewPeriodicidad='true';
    }else{
      this.nuevoCalibracion= Mantenimiento;
      this.viewPeriodicidad=Mantenimiento.periodicidad;
    }
  }
  closePeriodicidad(activo){
    console.log('CLOSING',activo);
  if (activo==false){
    console.log('CLOSING')
    this.minHeight=0;
    this.nuevoCalibracion  = new CalibracionesMaquina(0,0,'','');
    this.viewPeriodicidad=false;
  }
  }
  goUp(index: number, evento: Event) {
    if (index > 0) {
      this.dt._value[index].orden--;
      this.saveItem(this.dt._value[index], index);
      this.dt._value[index - 1].orden++;
      this.saveItem(this.dt._value[index - 1], index - 1);
      let temp1: any = this.dt._value.splice(index - 1, 1);
      this.dt._value.splice(index, 0, temp1[0]);
      this.calibraciones = this.calibraciones.slice();
    } else {
      console.log('primer elemento');
    }
  }

  goDown(index: number, evento: Event) {
    if (index < this.calibraciones.length - 1) {
      this.dt._value[index].orden++;
      this.saveItem(this.dt._value[index], index);
      this.dt._value[index + 1].orden--;
      this.saveItem(this.dt._value[index + 1], index + 1);
      let temp1: any = this.dt._value.splice(index, 1);
      console.log(this.dt._value);
      this.dt._value.splice(index + 1, 0, temp1[0]);
      console.log(this.dt._value);
      this.calibraciones = this.calibraciones.slice();
    } else {
      console.log('ultimo elemento');
    }
  }


  exportData(tabla: DataTable) {
    console.log(tabla);
    let origin_Value = tabla._value;

    tabla._value = tabla.dataToRender;
    tabla._value.map((calibracion) => {
      (moment(calibracion.fecha).isValid()) ? calibracion.fecha = moment(calibracion.fecha).format("DD/MM/YYYY") : '';
      calibracion.periodicidad = this.checkPeriodo(calibracion.periodicidad);
    });

    tabla.csvSeparator = ";";
    tabla.exportFilename = "Calibraciones_" + this.maquina.nombre;
    tabla.exportCSV();
    tabla._value = origin_Value;
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

  newOrden(i): number {
    let x: number;
    if (this.dt._value.length  && this.dt._value[this.dt._value.length - 1].orden > 0) {
      let valor = this.dt._value[this.dt._value.length - 1].orden;
      x = ++valor +i;
    } else {
      x = 0;
    }
    return x;
  }

  ordenar() {
    console.log('ORDENANDO')
    this.procesando = true;
    this.alertaGuardar['ordenar'] = false;
    this.calibraciones.forEach((item) => {
      this.saveItem(item, 0);
    });
    this.calibraciones = this.calibraciones.slice();
    this.procesando = false;
  }
  editOrden(){
    if (!this.alertaGuardar['ordenar']){
      this.alertaGuardar['ordenar'] = true;
      this.setAlerta('alertas.nuevoOrden');
      }
  }
  

  reordenar(indice) {
    this.procesando = true;
    for (let x = indice; x < this.dt._value.length; x++) {
      this.dt._value[x].orden = x;
      this.saveItem(this.dt._value[x], 0);
    }
    this.procesando = false;
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
      this.informeData = await this.ConvertToCSV(this.cols, this.calibraciones);
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
                  this.translate.get('maquinas.calibraciones').subscribe((desc)=>{informe=desc});
                  return {'cabecera':[informeCabecera],'rows':informeRows,'comentarios':[],'informes':informe};
      }
  
      getDropDownValor(tabla,valor){
        let Value;
        switch (tabla){
          case "tipo":
          Value = valor;
          break;
        }
        console.log(tabla,valor,Value);
        return Value;
      }

}