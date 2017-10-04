import { Component, OnInit, Input, OnChanges } from '@angular/core';
import {DataTable} from 'primeng/primeng';


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
public items: LimpiezaRealizada[];
public usuarios:Usuario[];
 public guardar = [];
public idBorrar;
public motivo:boolean[]=[];
public supervisar:object[]=[{"value":0,"label":"porSupervisar"},{"value":1,"label":"correcto"},{"value":2,"label":"incorrecto"}];
  modal: Modal = new Modal();
entidad:string="&entidad=limpieza_realizada";
field:string="&field=idlimpiezazona&idItem=";
es
  constructor(public servidor: Servidor,public empresasService: EmpresasService) {}


 ngOnInit() {
      //this.loadSupervisores();
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
            if (response.success && response.data) {
              for (let element of response.data) {  
                let fecha;
                (moment(new Date(element.fecha_supervision)).isValid())? fecha = new Date(element.fecha_supervision): fecha = null;
                let supervisor = ''; 
                (element.idsupervisor>0)? supervisor = this.findSupervisor(element.idsupervisor):supervisor =  '';
                  this.items.push(new LimpiezaRealizada(element.idelemento,element.idlimpiezazona,element.nombre,element.descripcion,
                  new Date(element.fecha_prevista),new Date(element.fecha),element.tipo,element.usuario,element.responsable,element.id,
                  element.idempresa,element.idsupervisor,fecha,element.supervision,element.detalles_supervision,supervisor));
                  this.motivo.push(false);
                  // this.url.push({"imgficha":this.baseurl + element.id +'_'+element.imgficha,"imgcertificado":this.baseurl + element.id +'_'+element.imgcertificado});
             }
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
let user = this.usuarios[index].usuario;
//console.log(user);
return user;
}

onEdit(event){
  console.log(event);
  this.itemEdited(event.data.id);
}
    itemEdited(idMantenimiento: number) {
    this.guardar[idMantenimiento] = true;
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
            this.items.splice(indice, 1);
          }
      });
    }
  }



 saveItem(mantenimiento: LimpiezaRealizada) {
   
   //console.log ("evento",event);
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
          console.log('Limpieza updated');
        }
    });
  }

detalleSupervision(idMantenimiento: number,index:number){
this.motivo[index] = !this.motivo[index];
}
setSupervision($event){

}


  expandir(dt: any,row:number,event:any){
    console.log(dt,row,event)

    dt.toggleRow(row);
  }

exportData(tabla: DataTable){
  console.log(tabla);
  let origin_Value = tabla._value;

  tabla._value = tabla.dataToRender;
  tabla._value.map((limpieza)=>{
      (moment(limpieza.fecha_prevista).isValid())?limpieza.fecha_prevista = moment(limpieza.fecha_prevista).format("DD/MM/YYYY"):'';
      (moment(limpieza.fecha).isValid())?limpieza.fecha = moment(limpieza.fecha).format("DD/MM/YYYY"):'';
      (moment(limpieza.fecha_supervision).isValid())?limpieza.fecha_supervision= moment(limpieza.fecha_supervision).format("DD/MM/YYYY"):'';    
      });

  tabla.csvSeparator = ";";
  tabla.exportFilename = "Limpiezas_Realizadas_del_"+tabla.dataToRender[0].fecha+"_al_"+tabla.dataToRender[tabla.dataToRender.length-1].fecha+"";
  tabla.exportCSV();
  tabla._value = origin_Value;
}

}