import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from '@ngx-translate/core';

import { EmpresasService } from '../../services/empresas.service';
import { Servidor } from '../../services/servidor.service';
import { Empresa } from '../../models/empresa';
import { URLS,cal } from '../../models/urls';
import { Checklist } from '../../models/checklist';
import { ControlChecklist } from '../../models/controlchecklist';
import { templateCompany } from 'environments/environment';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.css']
})
export class TemplatesComponent implements OnInit, OnChanges {

@Input() template:string;
@Output() onCerrar: EventEmitter<boolean> = new EventEmitter<boolean>();
@Output() onTemplateSelected: EventEmitter<any> = new EventEmitter<any>();

public resultados:any[];
public templates:any[];
public subItems:any[];
public subEntidad:string='';
  constructor(
    public servidor: Servidor, 
    public empresasService: EmpresasService, 
    public translate: TranslateService, 
    private messageService: MessageService
  ) { }

  ngOnInit() {
  }

  ngOnChanges(){
    let parametros = '&idempresa='+templateCompany+'&entidad='+this.template;

    this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
      response => {
        this.resultados=[];
        this.templates=[];
        if (response.success == 'true' && response.data) {
          for (let element of response.data) {
            this.addToResultados(element);
            this.templates.push(element);
          }
          console.log(this.resultados)
        }
      },
error => console.log("error getting usuarios en permisos",error),
()=>{
}
)
}

getSubitems(id){
  let parametros = '&idempresa='+templateCompany+'&entidad='+this.subEntidad+'&idItem='+id;
  this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
    response => {
      this.subItems=[];
      if (response.success == 'true' && response.data) {
        for (let element of response.data) {
          this.subItems.push(element);
        }
        console.log(this.resultados)
      }
    },
error => console.log("error getting usuarios en permisos",error),
()=>{
}
)
}
addToResultados(element){

  switch(this.template){
    case "checklist":
    this.resultados.push({'id':element.id,'nombre':element.nombrechecklist,'descripcion':element.nombrechecklist,'periodicidad':this.getPeriodicidad(element.periodicidad2)});
    break;
  }

  }
  getPeriodicidad(periodicidad){
    let repeticion:string='';
    if (periodicidad){
      try{
        repeticion= JSON.parse(periodicidad).repeticion;
      }
      catch(e){
        console.log('error',e)
      }
    }
    return repeticion;
  }
  expanded(evento){
    console.log(evento);
    switch(this.template){
      case "checklist":
      this.subEntidad='controlchecklist&field=idChecklist';
      this.getSubitems(evento);
      break;
    }

  }
  collapsed(evento){
    console.log(evento);
  }

  addSelected(id){
    console.log(id);
    let elemento={};
    let indice = this.templates.findIndex((checklist)=>checklist.id==id);
    if (indice >-1){
    //  elemento['checklist']=this.templates[indice];
    //  elemento['controleschecklist']=this.subItems;
      this.onTemplateSelected.emit(this.templates[indice]);
    }
  }

  cerrarSideNav(){
    this.onCerrar.emit(false);
  }



}
