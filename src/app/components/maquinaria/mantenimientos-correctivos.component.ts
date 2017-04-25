import { Component, OnInit, Input } from '@angular/core';


import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { Empresa } from '../../models/empresa';
 import { Maquina } from '../../models/maquina';
 import { CalendarioMantenimiento } from '../../models/calendariomantenimiento';
 import { MantenimientoRealizado } from '../../models/mantenimientorealizado';
 import { Periodicidad } from '../../models/periodicidad';

@Component({
  selector: 'mantenimientos-correctivos',
  templateUrl: './mantenimientos-correctivos.component.html',
  styleUrls:['ficha-maquina.css']
})

export class MantenimientosCorrectivosComponent implements OnInit {

@Input() maquina:Maquina;


public mantenimientos: MantenimientoRealizado[];
public es:any;
public guardar = [];
public nuevoMantenimiento: MantenimientoRealizado = new MantenimientoRealizado(0,0,'','','',new Date(),new Date());;
public date = new Date();
public url:string[]=[];
public verdoc: boolean = false;
public foto:string;
  constructor(public servidor: Servidor,public empresasService: EmpresasService) {}





  ngOnInit() {
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
  photoURL(i) {
    this.verdoc=!this.verdoc;
    this.foto = this.url[i];
  }
  ngOnChanges(){
    this.setMantenimientos();

}


  setMantenimientos(){
    let params = this.maquina.id;
    let parametros = '&tipomantenimiento=correctivo&idmaquina=' + params;
    //  let parametros = '&idempresa=' + this.empresasService.seleccionada; 
        this.servidor.getObjects(URLS.MANTENIMIENTOS_REALIZADOS, parametros).subscribe(
          response => {
            this.mantenimientos = [];
            if (response.success && response.data) {
              for (let element of response.data) {  
                  this.mantenimientos.push(new MantenimientoRealizado(element.idmantenimiento,element.idmaquina,element.maquina,element.mantenimiento,element.descripcion,new Date(element.fecha_prevista),new Date(element.fecha),element.tipo,element.elemento,element.causas,element.tipo2,element.doc,element.idusuario,element.responsable,element.id,element.tipo_evento,element.idempresa))
                   this.url.push(URLS.DOCS + this.empresasService.seleccionada + '/mantenimientos_realizados/' + element.id +'_'+element.doc);
             }
            }
        },
        error=>console.log(error),
        ()=> console.log("mantenimientos",this.mantenimientos)
        );
        
  }



  newItem() {
    console.log (this.nuevoMantenimiento);
    this.nuevoMantenimiento.idmaquina = this.maquina.id;
    this.nuevoMantenimiento.fecha = new Date(Date.UTC(this.nuevoMantenimiento.fecha.getFullYear(), this.nuevoMantenimiento.fecha.getMonth(), this.nuevoMantenimiento.fecha.getDate()))
    this.nuevoMantenimiento.tipo2 = "correctivo";
    this.nuevoMantenimiento.idempresa = this.empresasService.seleccionada;
    this.servidor.postObject(URLS.MANTENIMIENTOS_REALIZADOS, this.nuevoMantenimiento).subscribe(
      response => {
        if (response.success) {
          this.nuevoMantenimiento.id = response.id;
          this.mantenimientos.push(this.nuevoMantenimiento);
          this.nuevoMantenimiento = new MantenimientoRealizado(0,0,'','','',new Date(),new Date());
        }
    });
  }


    itemEdited(idMantenimiento: number) {
    this.guardar[idMantenimiento] = true;
    //console.log (fecha.toString());
  }
 saveItem(mantenimiento: MantenimientoRealizado) {

  // console.log ("evento",event);
    this.guardar[mantenimiento.id] = false;
    console.log ("actualizar_mantenimiento",mantenimiento);
    mantenimiento.fecha = new Date(Date.UTC(mantenimiento.fecha.getFullYear(), mantenimiento.fecha.getMonth(), mantenimiento.fecha.getDate()))
    let parametros = '?id=' + mantenimiento.id;        
    this.servidor.putObject(URLS.MANTENIMIENTOS_REALIZADOS, parametros, mantenimiento).subscribe(
      response => {
        if (response.success) {
          console.log('Mantenimiento updated');
        }
    });

  }

checkBorrar(){}

  uploadImg(event, idItem,i) {
    console.log(event)
    var target = event.target || event.srcElement; //if target isn't there then take srcElement
    let files = target.files;
    //let files = event.srcElement.files;
    let idEmpresa = this.empresasService.seleccionada.toString();
    this.servidor.postDoc(URLS.UPLOAD_DOCS, files,'mantenimientos_realizados',idItem, this.empresasService.seleccionada.toString()).subscribe(
      response => {
        console.log('doc subido correctamente',files[0].name);
        this.mantenimientos[i].doc = files[0].name;
        this.url[i]= URLS.DOCS + this.empresasService.seleccionada + '/mantenimientos_realizados/' +  idItem +'_'+files[0].name;
        // let activa = this.empresas.find(emp => emp.id == this.empresasService.seleccionada);
        // activa.logo = '1';
      }
    )
  }

}
