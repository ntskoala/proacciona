import { Component, OnInit, OnChanges , Input, Output, EventEmitter  } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Router,ActivatedRoute, ParamMap  } from '@angular/router';
  
import { DomSanitizer } from '@angular/platform-browser';

import {DataTable,Column} from 'primeng/primeng';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from '@ngx-translate/core';

import { Servidor } from '../../../services/servidor.service';
import { URLS,cal } from '../../../models/urls';
import { EmpresasService } from '../../../services/empresas.service';
import { Trabajador } from '../../../models/trabajadores';
import { FormacionRealizada } from '../../../models/formaciones-realizadas'
export class Permiso {
  constructor(
    public id: number,
    public idtrabajador: number,
    public idgrupo: number,
    public idempresa: number
  ) { }
}

export class Entidad {
  constructor(
    public id: number,
    public idempresa: number,
    public nombre: string,
    public tipo:string
  ) {}
}
export class Convocado {
  constructor(
    public idTrabajador: number,
    public idCurso: number,
    public fecha: Date
  ) {}
}
@Component({
  selector: 'app-convocatorias-formacion',
  templateUrl: './convocatorias-formacion.component.html',
  styleUrls: ['./convocatorias-formacion.component.css']
})
export class ConvocatoriasFormacionComponent implements OnInit {
  @Input() items;
  @Input() cursos;
  @Input() trabajadores:Trabajador[];
  public grupos:any[];
public nuevoGrupo:string=null;
  public viewPermisos: boolean = false;
  public usuarios: any[] = [];
  public convocados: Convocado[]=[];
  //public controles: Control[];
  public permisos: any[] = [];
  public permiso: any;
  public haypermiso: number[] = [];
  public tabla: object[];
  public cols: object[];
  public procesando: boolean = false;
  public cargaData: boolean[] = [false, false];
  public entidad: string = "&entidad=trabajadores_grupos";
  public es;

  constructor(
    public servidor: Servidor,
    public empresasService: EmpresasService,
    private route: ActivatedRoute,
    public translate: TranslateService, 
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.es=cal;
    console.log('CURSOS:',this.cursos)
    this.loadGrupos().subscribe(
      (resultado)=>{
        if (resultado == 'grupos') {
          this.trabajadores.forEach((trabajador)=>{
            this.grupos.push(new Entidad(trabajador.id,trabajador.idempresa,trabajador.nombre + ' ' + trabajador.apellidos,'Trabajador'))
          })
          this.cargaData[0] = true;
          this.cargaDatos();
        }
      })

      this.loadMiembrosPorGrupo().subscribe(
        (resultado)=>{
          if (resultado  == 'permisos'){
            this.cargaData[1] = true;
            this.cargaDatos();
          } 
        })
    //console.log('TRABAJADORES INIT:',this.trabajadores);
  }


  cargaDatos(){
    console.log('CARGADATOS',this.grupos,this.permisos);
    if (this.cargaData[0] && this.cargaData[1]){
      console.log('mergeData...');
    this.mergeData();
    }

  }

ngOnChanges(){
console.log('TRABAJADORES CHANGED:',this.trabajadores, this.cursos);
}

  loadGrupos(){
    return new Observable<string>((valor)=>{
    let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad;
    this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
      response => {
        this.grupos = [];
  
        if (response.success && response.data) {
          for (let element of response.data) {  
              this.grupos.push(new Entidad(element.id,element.idempresa,element.nombre,'Grupo'));
            }
            valor.next('grupos');
        }
    });
  })
  }



  loadMiembrosPorGrupo(){
    return new Observable<string>((valor)=>{
      let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=trabajadores_pertenencia_grupos";
      this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
        response => {
          this.permisos = [];
    
          if (response.success && response.data) {
            for (let element of response.data) {  
                this.permisos.push(new Permiso(element.id,element.idtrabajador,element.idgrupo,element.idempresa));
              }
              valor.next('permisos');
          }
      });
    })
  }
  


  mergeData() {
    this.tabla = [];
    this.cols = [];
    this.cols.push({ field: 'curso', header: 'Curso' },{ field: 'fecha', header: 'Fecha' });



    this.grupos.forEach(grupo => {
      this.cols.push({ field: grupo.id, header: grupo.nombre })
    });

    this.cursos.forEach(curso => {
      let generalSwitch = true;
      let row = '{"curso":"' + curso.nombre + '","idcurso":"' + curso.id + '","fecha":' + null + ''

      this.grupos.forEach(grupo => {
       // let valor = this.permisos.findIndex((permiso) => permiso.idtrabajador == user.id && permiso.idgrupo == grupo.id);
       // console.log(valor);
        let valor = -1;
        let check: boolean;
        if (valor < 0) {
          check = false;
          generalSwitch = false;
        } else {
          check = true
        };
        row += ',"' + grupo.nombre + '":' + check + ''
      });
      row += ',"generalSwitch":' + generalSwitch + '}';
      this.tabla.push(JSON.parse(row))

    })
    console.log(this.tabla);
    this.procesando = false;
  }

  setConvocado(idCurso,checked,curso){
    console.log(idCurso,checked),curso
  }

  convocar(){
    this.convocados=[];
    this.tabla.forEach((reg)=>{
      //console.log(reg);
      this.cols.forEach((col)=>{
        if (reg[col["header"]]){
         // console.log(col["header"],reg[col["header"]])

         let index = this.grupos.findIndex((grupo)=>grupo["nombre"] == col["header"]);
          if(this.grupos[index].tipo == 'Grupo'){
            //this.callGrupo(this.grupos[index].id);
            this.permisos.filter((permiso)=>{return permiso.idgrupo == this.grupos[index].id}).forEach((permiso)=>{
              this.convocaIndividuo(permiso.idtrabajador,reg["fecha"],reg["curso"],reg["idcurso"]);
            })
          }else{
            this.convocaIndividuo(this.grupos[index].id,reg["fecha"],reg["curso"],reg["idcurso"]);
          }
        }
      })

    });
    console.log('CONVOCADOS:',this.convocados)
  }
  
  convocaIndividuo(idTrabajador,fecha,curso,idcurso){
    console.log('TRABAJADOR:',idTrabajador,fecha,curso,idcurso)
    let indice = this.convocados.findIndex((convocado)=>convocado.idCurso==idcurso && convocado.idTrabajador == idTrabajador)
    if (indice == -1){
      this.convocados.push(new Convocado(idTrabajador,idcurso,fecha));
      this.postToFormacionesREalizadas(idTrabajador,idcurso,fecha,curso);
    }
  }

postToFormacionesREalizadas(idTrabajador,idcurso,fecha,curso){
  let param = "&entidad=formaciones_realizadas";
  let formacion:FormacionRealizada=new FormacionRealizada(null,idcurso,1,this.empresasService.seleccionada,curso,curso,fecha,null,null,idTrabajador,null)
  this.servidor.postObject(URLS.STD_ITEM, formacion,param).subscribe(
    response => {
      if (response.success) {

      }
  },
  error =>{
    console.log(error);
  },
  () =>  {}
  );
}
}
