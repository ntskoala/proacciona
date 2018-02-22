import { Component, OnInit,ViewChild,ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { Servidor } from '../services/servidor.service';
import { EmpresasService } from '../services/empresas.service';
import { PermisosService } from '../services/permisos.service';
import { EmpresasComponent } from './empresas.component';

import { URLS } from '../models/urls';
import { Checklist } from '../models/checklist';
import { ControlChecklist } from '../models/controlchecklist';
import { ResultadoChecklist } from '../models/resultadochecklist';
import { Columna } from '../models/columna';
import * as moment from 'moment';
@Component({
  selector: 'informe-checklists',
  templateUrl: '../assets/html/informe-checklists.component.html'
})
export class InformeChecklistsComponent implements OnInit{
  @ViewChild ('listaChecklist') lista:ElementRef;
  public subscription: Subscription;
  checklistSeleccionada: number = 0;
  checklist: Checklist = new Checklist(0, 0, 'Seleccionar', 0, '');
  checklists: Checklist[];
  controlchecklists: ControlChecklist[];
  resultadoschecklist: ResultadoChecklist[];
  columnas: Columna[];
  resultado: Object = {};
  tabla: Object[];
  fecha: Object = {"inicio":"","fin":""};
  idrs: string[] = [];
  modal: boolean = false;
  fotoSrc: string;
  exportar_informes: boolean =false;
public es;
  constructor(public servidor: Servidor, public empresasService: EmpresasService, public empresasComponent: EmpresasComponent, public permisos: PermisosService) {}

  ngOnInit() {
    // Conseguir checklists
    this.fecha['inicio']= new Date(moment().subtract(7,'d').format('YYYY-MM-DD')); //moment().subtract(7,'d').date();
    this.fecha['fin']= new Date();//moment().date();
    this.getChecklists();
    this.subscription = this.empresasService.empresaSeleccionada.subscribe(x => this.getChecklists());
    this.subscription = this.empresasService.opcionesFuente.subscribe(x => this.exportar_informes = x);
    this.es = {
      monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
          'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
          monthNamesShort: [ "Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic" ],              
      dayNames: ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'],
      dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
      dayNamesMin: ["Do","Lu","Ma","Mi","Ju","Vi","Sa"],
      firstDayOfWeek: 1
  }; 
  }

  getChecklists() {
    this.tabla = [];
    this.controlchecklists = [];
    this.columnas = [];
        let parametros = '&idempresa=' + this.empresasService.seleccionada;
        // llamada al servidor para conseguir las checklists
        this.servidor.getObjects(URLS.CHECKLISTS, parametros).subscribe(
          response => {
            this.checklists = [];
            this.checklists.push(this.checklist);
            if (response.success && response.data) {
              for (let element of response.data) {
                this.checklists.push(new Checklist(element.id, element.idempresa, element.nombrechecklist,
                  element.periodicidad, element.tipoperiodo));
              }
            }
          },
    error => console.log("error getting usuarios en permisos",error),
    ()=>{
      this.expand();
    }
    );
  }

  cambioChecklist(idChecklist: number) {
    this.unExpand();
    this.tabla = [];
    this.checklistSeleccionada = idChecklist;
    let parametros = '&idchecklist=' + idChecklist;
    // Conseguir las controlchecklist
    this.servidor.getObjects(URLS.CONTROLCHECKLISTS, parametros).subscribe(
      response => {
        this.controlchecklists = [];
        this.columnas = [];
        if (response.success && response.data) {
          for (let element of response.data) {
            this.controlchecklists.push(new ControlChecklist(element.id, element.idchecklist,
              element.nombre));
            this.columnas.push(new Columna(
              'id' + element.id,
              'id2' + element.id,
              'fotocontrol'+ element.id,
              element.nombre
            ));
          }
        }
    });
  }

  filtrarFechas(fecha) {
    this.idrs = [];
    // Conseguir resultadoschecklist
    let parametros = '&idchecklist=' + this.checklistSeleccionada + 
    //'&fechainicio=' + fecha.inicio.formatted + '&fechafin=' + fecha.fin.formatted;
          '&fechainicio=' + moment(fecha.inicio).format('YYYY-MM-DD') + '&fechafin=' + moment(fecha.fin).format('YYYY-MM-DD');

    this.servidor.getObjects(URLS.RESULTADOS_CHECKLIST, parametros).subscribe(
      response => {
        this.resultadoschecklist = [];
        this.tabla = [];
        if (response.success && response.data) {
          for (let element of response.data) {
            let fecha = new Date(element.fecha);
              this.resultadoschecklist.push(new ResultadoChecklist(element.idr, element.idcontrolchecklist,
                element.idchecklist,element.usuario, element.resultado, element.descripcion, new Date(element.fecha), element.foto, element.fotocontrol));
            if (this.idrs.indexOf(element.idr) == -1) this.idrs.push(element.idr);
          }
        }
        for (let idr of this.idrs) {
          let contador = 0;
          for (let resultado of this.resultadoschecklist) {
            if (idr == resultado.idr) {
              this.resultado['id'] = resultado.idr;
              this.resultado['usuario'] = resultado.usuario;
              this.resultado['fecha'] =  this.formatFecha(resultado.fecha);
              if (resultado.foto == 'true') this.resultado['foto'] = true;
//              if (resultado.resultado == 'true') {
//                this.resultado['id' + resultado.idcontrolchecklist] = true;
                  this.resultado['id' + resultado.idcontrolchecklist] = resultado.resultado;
//              }
              if (resultado.descripcion) {
                this.resultado['id2' + resultado.idcontrolchecklist] = resultado.descripcion;
              }
               if (resultado.fotocontrol != "false") {
                this.resultado['fotocontrol' + resultado.idcontrolchecklist] =  resultado.idcontrolchecklist + "_" + resultado.idr;
              }                
              contador++;
            }
          }
          this.tabla.push(this.resultado);
          this.resultado = {};
          console.log("tabla",this.tabla);
        }
    });
  }

  ventanaFoto(idResultado: number, tipocontrol: string) {
    this.fotoSrc = URLS.FOTOS + this.empresasService.seleccionada + '/'+ tipocontrol + idResultado + '.jpg'
    this.modal = true;
  }

  cerrarFoto() {
    this.modal = false;
  }
scroll(){
  console.log("dateclicked");

  this.empresasComponent.scrolldown();

}


excel(fecha){
  console.log("send to excel");
var csvData = this.ConvertToCSV(this.columnas, this.tabla);
    var a = document.createElement("a");
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);
    var blob = new Blob([csvData], { type: 'text/csv' });
    var url= window.URL.createObjectURL(blob);
    //window.open(url,'_blank');
    a.href = url;
    a.download = 'InformeControles_del'+fecha.inicio.formatted+"_al_"+fecha.fin.formatted+'.csv';
    a.click();
}
ConvertToCSV(controles,objArray){
var cabecera =  typeof controles != 'object' ? JSON.parse(controles) : controles;
var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
            var str = '';
            var row = "";
            row += "Usuario;Fecha;"
            for (var i = 0; i < cabecera.length; i++) {
              row += cabecera[i].nombre + ';descripcion;';
            }
            row = row.slice(0, -1);
            //append Label row with line break
            str += row + '\r\n';
 
            for (var i = 0; i < array.length; i++) {
                
                var line = array[i].usuario +";"+ array[i].fecha + ";";

              for (var x = 0; x < cabecera.length; x++) {
                let columna = cabecera[x].nombre;
                let resultado = array[i][cabecera[x]];
              //line += ((array[i][cabecera[x].id] !== undefined) ?  'ok;':'x;');
              line += array[i][cabecera[x].id] +';';
              line += ((array[i][cabecera[x].id2] !== undefined) ?  array[i][cabecera[x].id2] +';':';');
            }
            line = line.slice(0,-1);
                str += line + '\r\n';
            }
            return str;
}
formatFecha(fecha: Date):string{
let mifecha = ("0"+fecha.getUTCDate()).slice(-2) +"/"+("0"+(fecha.getUTCMonth()+1)).slice(-2)+"/"+fecha.getUTCFullYear()+ " - " +("0"+(fecha.getHours())).slice(-2)+":"+("0"+fecha.getUTCMinutes()).slice(-2);
console.log(mifecha);
  return mifecha;
}

unExpand(){
  this.lista.nativeElement.size = 1;
}
expand(){
  let num = this.checklists.length;
  this.lista.nativeElement.size = num;
}

}
