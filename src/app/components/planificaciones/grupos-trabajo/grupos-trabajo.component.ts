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

export class Permiso {
  constructor(
    public id: number,
    public idtrabajador: number,
    public idgrupo: number,
    public idempresa: number
  ) { }
}

export class Grupo {
  constructor(
    public id: number,
    public idempresa: number,
    public nombre: string
  ) {}
}

@Component({
  selector: 'app-grupos-trabajo',
  templateUrl: './grupos-trabajo.component.html',
  styleUrls: ['./grupos-trabajo.component.css']
})
export class GruposTrabajoComponent implements OnInit, OnChanges {
  @Input() items;
  @Input() trabajadores;
  //@Input() tipoControl;
  @Output() onPermisos: EventEmitter<number> = new EventEmitter<number>();
public grupos:any[];
public nuevoGrupo:string=null;
  public viewPermisos: boolean = false;
  public usuarios: any[] = [];
  //public controles: Control[];
  public permisos: any[] = [];
  public permiso: any;
  public haypermiso: number[] = [];
  public tabla: object[];
  public cols: object[];
  public procesando: boolean = false;
  public cargaData: boolean[] = [false, false];
  public entidad: string = "&entidad=trabajadores_grupos";
  constructor(
    public servidor: Servidor,
    public empresasService: EmpresasService,
    private route: ActivatedRoute,
    public translate: TranslateService, 
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.loadGrupos().subscribe(
      (resultado)=>{
        if (resultado == 'grupos') {
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
console.log('TRABAJADORES CHANGED:',this.trabajadores);
}

  loadGrupos(){
    return new Observable<string>((valor)=>{
    let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad;
    this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
      response => {
        this.grupos = [];
  
        if (response.success && response.data) {
          for (let element of response.data) {  
              this.grupos.push(new Grupo(element.id,element.idempresa,element.nombre));
            }
            valor.next('grupos');
        }
    });
  })
  }


newGrupo(){
let newGrupo= new Grupo(null,this.empresasService.seleccionada,this.nuevoGrupo)
  let param = this.entidad+"&idempresa="+this.empresasService.seleccionada;
  this.servidor.postObject(URLS.STD_ITEM, newGrupo,param).subscribe(
    response => {
      if (response.success) {
        this.grupos.push(newGrupo);
        this.grupos[this.grupos.length-1].id= response.id;
        //this.setProdsElemtento(response.id);
        this.mergeData();
      }
  },
  error =>console.log(error),
  () =>  {}
  );
}

// saveGrupo(){
//   let parametros = '?id=' + trabajador.id+this.entidad;  
//   this.servidor.putObject(URLS.STD_SUBITEM, parametros, trabajador).subscribe(
//     response => {
//       if (response.success) {
//         resolve(true);
//         console.log('Trabajadfor updated');
//       }
//   });
// }

deleteGrupo(grupo){

  //DESASIGNAR TRABAJADORES DEL GRUPO
  this.checkPermisosGrupo(grupo).then(
    (valor)=>{
      if (valor=='delete'){
        let parametros = '?id=' + grupo.id+this.entidad;
        this.servidor.deleteObject(URLS.STD_SUBITEM, parametros).subscribe(
          response => {
            if (response.success) {
              let indice = this.grupos.indexOf(grupo);
              this.grupos.splice(indice, 1);
              this.grupos = this.grupos.slice();
              this.setAlerta('alertas.borrar');
              this.mergeData();
            }
        });
      }else{
        this.setAlerta('¡Hay usuarios en este grupo!')
      }
    }
  )
}

checkPermisosGrupo(grupo){
  return new Promise((resolve)=>{
let index = this.permisos.findIndex((permiso)=>permiso.idgrupo == grupo.id);
if (index >-1){
  resolve('hayPermisos');
}else{
  resolve('delete');
}
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
    this.cols.push({ field: 'user', header: 'Usuario' });

    this.grupos.forEach(grupo => {
      this.cols.push({ field: grupo.id, header: grupo.nombre })
    });

    this.trabajadores.forEach(user => {
      let generalSwitch = true;
      let row = '{"user":"' + user.nombre + '","iduser":"' + user.id + '"'

      this.grupos.forEach(grupo => {
        let valor = this.permisos.findIndex((permiso) => permiso.idtrabajador == user.id && permiso.idgrupo == grupo.id);
        console.log(valor);
        //let valor = -1;
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


  setPermiso(iduser,checked,idGroup,user){
    console.log(iduser,checked,idGroup,user)
    if (checked){
      this.addToGroup(iduser,idGroup)
    }else{
      this.deleteFromGroup(iduser,idGroup)
    }
  }

  addToGroup(iduser,idGroup){
    let param = '&idempresa=' + this.empresasService.seleccionada+"&entidad=trabajadores_pertenencia_grupos";
    let permiso = new Permiso(null,iduser,idGroup, this.empresasService.seleccionada)
    this.servidor.postObject(URLS.STD_ITEM, permiso,param).subscribe(
      response => {
        if (response.success) {
          this.permisos.push(permiso);
          this.permisos[this.permisos.length-1].id= response.id;
        }
    },
    error =>console.log(error),
    () =>  {}
    );
  }

  deleteFromGroup(iduser,idGroup){
    let indexPermisos = this.permisos.findIndex((permiso) => permiso.idtrabajador == iduser && permiso.idgrupo == idGroup);
    let idElem = this.permisos[indexPermisos].id;
    let parametros = '?id=' + idElem +"&entidad=trabajadores_pertenencia_grupos";

    this.servidor.deleteObject(URLS.STD_SUBITEM, parametros).subscribe(
      response => {
        if (response.success) {
          //let indice = this.grupos.indexOf(elem);
          this.permisos.splice(indexPermisos, 1);
          this.permisos = this.permisos.slice();
        }
    });
  }
}
