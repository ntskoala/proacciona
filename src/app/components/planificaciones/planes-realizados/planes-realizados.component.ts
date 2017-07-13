import { Component, OnInit, Input, OnChanges } from '@angular/core';

import { Servidor } from '../../../services/servidor.service';
import { URLS } from '../../../models/urls';
import { EmpresasService } from '../../../services/empresas.service';
import { LimpiezaRealizada } from '../../../models/limpiezarealizada';
//import { Planificacion } from '../../../models/limpiezazona';
  import { Usuario } from '../../../models/usuario';

import { Modal } from '../../../models/modal';
import * as moment from 'moment';
import { Planificacion } from '../../../models/planificacion';


@Component({
  selector: 'app-planes-realizados',
  templateUrl: './planes-realizados.component.html',
  styleUrls: ['./planes-realizados.component.css']
})
export class PlanesRealizadosComponent implements OnInit {

@Input() nuevo: number;

@Input() plan: Planificacion;

public items: LimpiezaRealizada[];
public usuarios:Usuario[];
 public guardar = [];
public idBorrar;
public motivo:boolean[]=[];
public supervisar:object[]=[{"value":0,"label":"porSupervisar"},{"value":1,"label":"correcto"},{"value":2,"label":"incorrecto"}];
  modal: Modal = new Modal();
entidad:string="&entidad=planificaciones_realizadas";
//field:string="&field=idfamilia&idItem=";
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
      console.log('paso3',this.nuevo);
  }


  setItems(){
  //  let params = this.maquina.id;
  //  let parametros = '&idmaquina=' + params;
      let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+"&order=fecha DESC"; 
        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
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


    itemEdited(idMantenimiento: number) {
    this.guardar[idMantenimiento] = true;
  }


  checkBorrar(idBorrar: number) {
    // Guardar el id del control a borrar
    this.idBorrar = idBorrar;
    // Crea el modal
    this.modal.titulo = 'plan.borrarLimpiezaR';
    this.modal.subtitulo = 'plan.borrarLimpiezaR';
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
   console.log ("evento",event);
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
          console.log('plan updated');
        }
    });
  }

detalleSupervision(idMantenimiento: number,index:number){
this.motivo[index] = !this.motivo[index];
}
setSupervision($event){

}

}
