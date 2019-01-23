import { Component, OnInit,ViewChild,ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Router,ActivatedRoute, ParamMap  } from '@angular/router';

import { TranslateService} from '@ngx-translate/core';

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
  templateUrl: '../assets/html/informe-checklists.component.html',
  styles:['.selected {background-color: #ffd740;}'],
})
export class InformeChecklistsComponent implements OnInit{
  @ViewChild ('listaChecklist') lista:ElementRef;
  public subscription: Subscription;
  checklistSeleccionada: number = 0;
  checklist: Checklist = new Checklist(0, 0, 'Seleccionar', 0, '');
  checklists: Checklist[];
  controlchecklists: ControlChecklist[];
  resultadoschecklist: ResultadoChecklist[];
  public selectedItem: any;
  columnas: Columna[];
  resultado: Object = {};
  tabla: Object[];
  fecha: Object = {"inicio":"","fin":""};
  idrs: string[] = [];
  modal: boolean = false;
  fotoSrc: string;
  exportar_informes: boolean =false;
  public exportando:boolean=false;
  public informeData:any;
public es;
  constructor(
    public servidor: Servidor, 
    public empresasService: EmpresasService, 
    public empresasComponent: EmpresasComponent, 
    public permisos: PermisosService,
    private route: ActivatedRoute,
    public translateService: TranslateService  
  ) {}

  ngOnInit() {
    console.log(this.route.params["_value"]["modulo"],this.route.params["_value"]["id"],this.route.params["_value"]["idOrigenasociado"])
    if (this.route.params["_value"]["idOrigenasociado"]>0){
      this.cambioChecklist(this.route.params["_value"]["idOrigenasociado"]);
      this.selectedItem = this.route.params["_value"]["id"];
      
    }
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
      if (this.route.params["_value"]["modulo"] == "Checklists" && this.route.params["_value"]["idOrigenasociado"] > 0){
        this.cambioChecklist(this.route.params["_value"]["idOrigenasociado"]);
     }else{
      if (!this.checklistSeleccionada)
      this.expand();
     }

    }
    );
  }

  cambioChecklist(idChecklist: number) {
    console.log('cambioChecklist');
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
              'idrc' +element.id,
              'fotocontrol'+ element.id,
              element.nombre
            ));
          }
          console.log(this.columnas,this.selectedItem);
        if (this.route.params["_value"]["modulo"] == "Checklists" && this.route.params["_value"]["id"] > 0){
            this.getDateInicio();
         }else{
          this.filtrarFechas(this.fecha);
         }
        }
    });
  }



  getDateInicio(){
    let parametros = '&idempresa=' + this.empresasService.seleccionada+'&entidad=resultadoschecklistcontrol&field=id&idItem='+this.route.params["_value"]["id"]; 
    this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
      response => {
        if (response.success && response.data) {
          for (let element of response.data) {
          let idChecklist = element.idresultadochecklist;

    let parametros = '&idempresa=' + this.empresasService.seleccionada+'&entidad=resultadoschecklist&field=id&idItem='+idChecklist; 
    this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
      response => {
        if (response.success && response.data) {
          for (let element of response.data) {
            this.fecha['inicio']= new Date(moment(element.fecha).format('YYYY-MM-DD')); //moment().subtract(7,'d').date();
            this.filtrarFechas(this.fecha);
          }
        }
    },
    error=>{console.log('Error getting checklist2',error)});
  }
    }
  },
  error=>{console.log('Error getting checklist1',error)});
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
                element.idchecklist,element.usuario, element.resultado, element.descripcion, moment(element.fecha).toDate(), element.foto, element.fotocontrol,element.idrc));
            if (this.idrs.indexOf(element.idr) == -1) this.idrs.push(element.idr);
          }
        }
        for (let idr of this.idrs) {
          let contador = 0;
          for (let resultado of this.resultadoschecklist) {
            if (idr == resultado.idr) {
              this.resultado['id'] = resultado.idr;
              this.resultado['idrc' + resultado.idcontrolchecklist] = resultado.idrc;
              this.resultado['usuario'] = resultado.usuario;
              //this.resultado['fecha'] =  this.formatFecha(resultado.fecha);
              this.resultado['fecha'] = moment(resultado.fecha).format('DD/MM/YYYY HH:mm');
              
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


excel2(fecha){
  console.log("send to excel");
var csvData = this.ConvertToCSV_OLD(this.columnas, this.tabla);
    var a = document.createElement("a");
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);
    var blob = new Blob([csvData], { type: 'text/csv' });
    var url= window.URL.createObjectURL(blob);
    a.href = url;
    a.download = 'InformeControles_del'+fecha.inicio.formatted+"_al_"+fecha.fin.formatted+'.csv';
    a.click();
}
async downloads(){
  
  let informeData = await this.ConvertToCSV(this.columnas, this.tabla);
  // let url ='https://script.google.com/a/proacciona.es/macros/s/AKfycbzIpotMyRcSxISIMvMLWN0-boPG8drRZ9wD8IQO5eQ/dev?idEmpresa='+this.empresasService.seleccionada;
  //let params = {'tabla':this.tabla};
}

async excel(fecha){
  this.exportando=true;
  this.informeData = await this.ConvertToCSV(this.columnas, this.tabla);
}


informeRecibido(resultado){
  console.log('informe recibido:',resultado);
  if (resultado){
    setTimeout(()=>{this.exportando=false},1500)
  }else{
    this.exportando=false;
  }
}

ConvertToCSV_OLD(controles,objArray){
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
              line += ((array[i][cabecera[x].id] !== undefined) ?  array[i][cabecera[x].id]+';':'x;');
              // line += array[i][cabecera[x].id] +';';
              line += ((array[i][cabecera[x].id2] !== undefined) ?  array[i][cabecera[x].id2] +';':';');
            }
            line = line.slice(0,-1);
                str += line + '\r\n';
            }
            return str;
            // let informeCabecera=[];
            // let informeRows=[];
            // let informeFotos=[];
            // let informeComentarios=[];
            //             var str = '';
            //             var row = "";
            //             row += "Usuario;Foto;Fecha;"
            //             for (var i = 0; i < cabecera.length; i++) {
            //               row += cabecera[i]["nombre"] + ';';
            //             }
            //             row = row.slice(0, -1);
            //             //append Label row with line break
            //             //str += row + '\r\n';
            //             informeCabecera = row.split(";");
            //             str='';
            //             for (var i = 0; i < array.length; i++) {
            //               let fotoUrl = ''
            //               let comentario='';
            //               if (array[i].foto){
            //                 fotoUrl = URLS.FOTOS + this.empresasService.seleccionada + '/checklist'+ array[i].id + '.jpg';
            //              }                            
            //              var line =array[i].usuario+";"+ fotoUrl+";"+array[i].fecha +";";
                            
            //               for (var x = 0; x < cabecera.length; x++) {
            //                 let columna = cabecera[x]["nombre"];
            //                 //let resultado = array[i][cabecera[x]];
            //                 let resultado = array[i]["nombre"];
            //                 if (array[i][cabecera[x].id2]) {
            //                   this.translateService.get(array[i][cabecera[x].id2]).subscribe((mensaje)=>{comentario += columna +": "+ mensaje + "\n"})
            //                 }
            //               line += ((array[i][cabecera[x].id] !== undefined) ?array[i][cabecera[x].id] + ';':';');
            //               //line += ((columna == resultado && array[i][cabecera[x]] !== undefined) ?array[i]["valor"] + ';':';');
            //             }
            //             line = line.slice(0,-1);
            //                 //str += line + '\r\n';
            //                 informeRows.push(line.split(";"))
            //                 informeComentarios.push(comentario);
            //             }
            //             //return str;
            //             let nombreChecklist = this.checklists.findIndex((item)=>item.id==this.checklistSeleccionada);
            //             let nomInforme = 'Checklist'+nombreChecklist;
            //             return {'cabecera':[informeCabecera],'rows':informeRows,'comentarios':informeComentarios,'informes':nomInforme};

          }


          ConvertToCSV(controles,objArray){
            var cabecera =  typeof controles != 'object' ? JSON.parse(controles) : controles;
            var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
                        // var str = '';
                        // var row = "";
                        // row += "Usuario;Fecha;"
                        // for (var i = 0; i < cabecera.length; i++) {
                        //   row += cabecera[i].nombre + ';descripcion;';
                        // }
                        // row = row.slice(0, -1);
                        // str += row + '\r\n';
             
                        // for (var i = 0; i < array.length; i++) {
                            
                        //     var line = array[i].usuario +";"+ array[i].fecha + ";";
            
                        //   for (var x = 0; x < cabecera.length; x++) {
                        //     let columna = cabecera[x].nombre;
                        //     let resultado = array[i][cabecera[x]];
                        //   line += ((array[i][cabecera[x].id] !== undefined) ?  array[i][cabecera[x].id]+';':'x;');
                        //   // line += array[i][cabecera[x].id] +';';
                        //   line += ((array[i][cabecera[x].id2] !== undefined) ?  array[i][cabecera[x].id2] +';':';');
                        // }
                        // line = line.slice(0,-1);
                        //     str += line + '\r\n';
                        // }
                        // return str;
                        let informeCabecera=[];
                        let informeRows=[];
                        let informeFotos=[];
                        let informeComentarios=[];
                                    var str = '';
                                    var row = "";
                                    row += "Usuario;Foto;Fecha;"
                                    for (var i = 0; i < cabecera.length; i++) {
                                      row += cabecera[i]["nombre"] + ';';
                                    }
                                    row = row.slice(0, -1);
                                    //append Label row with line break
                                    //str += row + '\r\n';
                                    informeCabecera = row.split(";");
                                    str='';
                                    for (var i = 0; i < array.length; i++) {
                                      let fotoUrl = ''
                                      let comentario='';
                                      if (array[i].foto){
                                        fotoUrl = URLS.FOTOS + this.empresasService.seleccionada + '/checklist'+ array[i].id + '.jpg';
                                     }                            
                                     var line =array[i].usuario+";"+ fotoUrl+";"+array[i].fecha +";";
                                        
                                      for (var x = 0; x < cabecera.length; x++) {
                                        let columna = cabecera[x]["nombre"];
                                        //let resultado = array[i][cabecera[x]];
                                        let resultado = array[i]["nombre"];
                                        if (array[i][cabecera[x].id2]) {
                                          this.translateService.get(array[i][cabecera[x].id2]).subscribe((mensaje)=>{comentario += columna +": "+ mensaje + "\n"})
                                        }

                                        switch (array[i][cabecera[x].id]){
                                          case "false":
                                          resultado = 'Incorrecto';
                                          break;
                                          case "true":
                                          resultado = 'Correcto';
                                          break;
                                          case "na":
                                          resultado = 'No aplica';
                                          break;
                                          default:
                                          resultado = array[i][cabecera[x].id];
                                          break
                                        }
                                        
                                      line += ((array[i][cabecera[x].id] !== undefined) ?resultado + ';':';');
                                      //line += ((columna == resultado && array[i][cabecera[x]] !== undefined) ?array[i]["valor"] + ';':';');
                                    }
                                    line = line.slice(0,-1);
                                        //str += line + '\r\n';
                                        informeRows.push(line.split(";"))
                                        informeComentarios.push(comentario);
                                    }
                                    //return str;
                                    let nombreChecklist = this.checklists.findIndex((item)=>item.id==this.checklistSeleccionada);
                                    let nomInforme = 'Checklist'+nombreChecklist;
                                    return {'cabecera':[informeCabecera],'rows':informeRows,'comentarios':informeComentarios,'informes':nomInforme};
            
                      }








formatFecha(fecha: Date):string{
let mifecha = ("0"+fecha.getUTCDate()).slice(-2) +"/"+("0"+(fecha.getUTCMonth()+1)).slice(-2)+"/"+fecha.getUTCFullYear()+ " - " +("0"+(fecha.getHours())).slice(-2)+":"+("0"+fecha.getUTCMinutes()).slice(-2);
console.log(mifecha);
  return mifecha;
}

unExpand(){
  console.log('unexpand');
  
  this.lista.nativeElement.size = 1;
 // this.lista.nativeElement.close();
}
expand(){
  let num = this.checklists.length;
  this.lista.nativeElement.size = num;
}

}
