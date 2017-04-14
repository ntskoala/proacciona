import { Component, OnInit, Input, OnChanges } from '@angular/core';

import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { LimpiezaRealizada } from '../../models/limpiezarealizada';
import { LimpiezaZona } from '../../models/limpiezazona';
import { Modal } from '../../models/modal';

@Component({
  selector: 'limpiezas-realizadas',
  templateUrl: './limpiezas-realizadas.component.html',
  styleUrls:['limpieza.component.css']
})

export class LimpiezasRealizadasComponent implements OnInit, OnChanges {
@Input() limpieza: LimpiezaZona;
@Input() nueva: number;
public items: LimpiezaRealizada[];
 public guardar = [];
public idBorrar;

  modal: Modal = new Modal();
entidad:string="&entidad=limpieza_realizada";
field:string="&field=idlimpiezazona&idItem=";
es
  constructor(private servidor: Servidor,private empresasService: EmpresasService) {}


 ngOnInit() {
      this.setItems();
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
      this.setItems();
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
                  this.items.push(new LimpiezaRealizada(element.idelemento,element.idlimpiezazona,element.nombre,element.descripcion,new Date(element.fecha_prevista),new Date(element.fecha),element.tipo,element.usuario,element.responsable,element.id,element.idempresa));
                  // this.url.push({"imgficha":this.baseurl + element.id +'_'+element.imgficha,"imgcertificado":this.baseurl + element.id +'_'+element.imgcertificado});
             }
            }

        });
       
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
   console.log ("evento",event);
    this.guardar[mantenimiento.id] = false;
    console.log ("actualizar_mantenimiento",mantenimiento);
    mantenimiento.fecha = new Date(Date.UTC(mantenimiento.fecha.getFullYear(), mantenimiento.fecha.getMonth(), mantenimiento.fecha.getDate()))
    //let parametros = '?id=' + mantenimiento.id;
    let parametros = '?id=' + mantenimiento.id+this.entidad;  
    this.servidor.putObject(URLS.STD_SUBITEM, parametros, mantenimiento).subscribe(
      response => {
        if (response.success) {
          console.log('Limpieza updated');
        }
    });
  }



}