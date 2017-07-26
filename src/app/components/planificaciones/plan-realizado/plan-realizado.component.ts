import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'

import { Servidor } from '../../../services/servidor.service';
import { URLS } from '../../../models/urls';
import { EmpresasService } from '../../../services/empresas.service';
import { PlanRealizado } from '../../../models/planrealizado';
  import { Usuario } from '../../../models/usuario';
import { Modal } from '../../../models/modal';
import * as moment from 'moment';
import { Planificacion } from '../../../models/planificacion';

@Component({
  selector: 'app-plan-realizado',
  templateUrl: './plan-realizado.component.html',
  styleUrls: ['./plan-realizado.component.css']
})
export class PlanRealizadoComponent implements OnInit {
@Input() planRealizado: PlanRealizado;
@Output() opnenedmodal: EventEmitter<boolean>= new EventEmitter<boolean>();
public usuarios:Usuario[];
public guardar:boolean=false;

//imagen y pdf
public url; 
public baseurl;
public verdoc:boolean=false;
public image;
public foto;
//


public supervisar:object[]=[{"value":0,"label":"porSupervisar"},{"value":1,"label":"correcto"},{"value":2,"label":"incorrecto"}];
  modal: Modal = new Modal();
entidad:string="&entidad=planificaciones_realizadas";
//field:string="&field=idfamilia&idItem=";
es
  constructor(public servidor: Servidor,public empresasService: EmpresasService, public sanitizer: DomSanitizer) {}


 ngOnInit() {
      //this.loadSupervisores();
    this.baseurl = URLS.DOCS + this.empresasService.seleccionada + '/planificaciones_realizadas/';
    this.url = this.baseurl +'_'+this.planRealizado.doc;
    this.image= this.baseurl +this.planRealizado.id +"_"+this.planRealizado.imagen;
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
      this.baseurl = URLS.DOCS + this.empresasService.seleccionada + '/planificaciones_realizadas/';
    this.url = this.baseurl +'_'+this.planRealizado.doc;
    this.image= this.baseurl + this.planRealizado.id +"_"+this.planRealizado.imagen;
}


    verFoto(foto:string){
      console.log('ver Foto');
    this.verdoc =  true;
    if (foto=="ficha"){
    this.foto=this.url;
    }else{
      this.foto=this.baseurl + this.planRealizado.id + "_"+this.planRealizado.imagen;
      console.log('ver Foto',this.foto);
    }
  }
  photoURL() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
  }

  uploadFunciones(event:any,field?:string) {
    console.log( 'plan:' ,this.planRealizado.id)
    var target = event.target || event.srcElement; //if target isn't there then take srcElement
    let files = target.files;
    //let files = event.srcElement.files;
    let idEmpresa = this.empresasService.seleccionada.toString();
    this.servidor.postDoc(URLS.UPLOAD_DOCS, files,'planificaciones_realizadas', this.planRealizado.id.toString(), this.empresasService.seleccionada.toString(),field).subscribe(
      response => {
        console.log('doc subido correctamente');
        if (field == 'planRealizado') this.image= this.baseurl + "_"+this.planRealizado.id+".jpg";
        // let activa = this.empresas.find(emp => emp.id == this.empresasService.seleccionada);
        // activa.logo = '1';
      }
    )
  }

  cerrarModal(){
    this.opnenedmodal.emit(false);
  }

  itemEdited(item){

  }
}
