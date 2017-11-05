import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from 'ng2-translate';

import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { Empresa } from '../../models/empresa';
 import { Maquina } from '../../models/maquina';

 
@Component({
  selector: 'ficha-maquina',
  templateUrl: './ficha-maquina.component.html',
  styleUrls: ['ficha-maquina.css']
})
export class FichaMaquinaComponent implements OnInit, OnChanges {
@Input() maquina:Maquina;
public camposArray: string[] =[];
public guardar:boolean=false;
public alertaGuardar:boolean=false;
public url; 
public baseurl;
public verdoc:boolean=false;
public image;
public foto;

  constructor(public servidor: Servidor,public empresasService: EmpresasService, public sanitizer: DomSanitizer
    , public translate: TranslateService, private messageService: MessageService) {}

  ngOnInit() {
   // this.campos2Array();
    this.baseurl = URLS.DOCS + this.empresasService.seleccionada + '/maquinaria/';
    this.url = this.baseurl + this.maquina.id +'_'+this.maquina.doc;
    this.image= this.baseurl + this.maquina.id+"_"+this.maquina.id+".jpg";
    console.log("#"+this.empresasService.userTipo+"#");
  }

  ngOnChanges(changes: SimpleChanges){
    this.baseurl = URLS.DOCS + this.empresasService.seleccionada + '/maquinaria/';
    this.url = this.baseurl + this.maquina.id +'_'+this.maquina.doc;
    this.image= this.baseurl + this.maquina.id+"_"+this.maquina.id+".jpg";
     console.log("#"+this.empresasService.userTipo+"#");
  }

  verFoto(foto:string){
    this.verdoc =  true;
    if (foto=="ficha"){
    this.foto=this.url;
    }else{
      this.foto=this.baseurl + this.maquina.id+"_"+this.maquina.id+".jpg";
    }
  }
  photoURL() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
  }

cerrarFoto(){
  this.verdoc = false;
}

itemEdited() {
  this.guardar = true;
  if (!this.alertaGuardar){
  this.alertaGuardar = true;
  this.setAlerta('alertas.guardar_Ficha');
  }
}
setAlerta(concept:string){
  let concepto;
  this.translate.get(concept).subscribe((valor)=>concepto=valor) 
  this.messageService.add(
    {severity:'warn', 
    summary:'Info', 
    detail: concepto
    }
  );
}


udateMaquina(valor:any){
  console.log('myMachine',this.maquina);
    let parametros = '?id=' + this.maquina.id;        
    this.servidor.putObject(URLS.MAQUINAS, parametros, this.maquina).subscribe(
      response => {
        if (response.success) {
          console.log('Maquina updated');
          this.guardar = false;
          this.alertaGuardar = false;
        }
    });
}
  // openDoc(doc){
  //   window.open(URLS.DOCS + this.empresasService.seleccionada + '/maquinaria/' + this.maquina.id +'_'+doc,'_BLANK');
  // }
  uploadFunciones(event:any,field?:string) {
    var target = event.target || event.srcElement; //if target isn't there then take srcElement
    let files = target.files;
    //let files = event.srcElement.files;
    let idEmpresa = this.empresasService.seleccionada.toString();
    this.servidor.postDoc(URLS.UPLOAD_DOCS, files,'maquinaria', this.maquina.id.toString(), this.empresasService.seleccionada.toString(),field).subscribe(
      response => {
        console.log('doc subido correctamente');
        if (field == 'fotomaquina') {
          this.image= this.baseurl + this.maquina.id+"_"+this.maquina.id+".jpg";
        }else{
          this.maquina.doc = files[0].name;
          this.url = this.baseurl + this.maquina.id +'_'+this.maquina.doc;          
        }
        // let activa = this.empresas.find(emp => emp.id == this.empresasService.seleccionada);
        // activa.logo = '1';
      }
    )
  }

}