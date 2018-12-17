import { Component, OnInit,Input,Output,EventEmitter, OnChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { EmpresasService } from '../../services/empresas.service';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-ver-docs',
  templateUrl: './ver-docs.component.html',
  styleUrls: ['./ver-docs.component.css']
})
export class VerDocsComponent implements OnInit, OnChanges {
//******IMAGENES */
//public url; 
@Input() doc:string;
@Output() onBotonCerrar:EventEmitter<boolean>= new EventEmitter;
public baseurl;
public verdoc:boolean=false;
public pdfSrc: string=null;
public paginaPdf:number=1;
public maxPdf:number=1;
public zoomPdf:number=1;
public image;
public foto;
public top = '50px';
//************** */
  constructor(
    public empresasService: EmpresasService, 
    public sanitizer: DomSanitizer,
    public translate: TranslateService, 
    private messageService: MessageService,
  ) { }

  ngOnInit() {
  }

ngOnChanges(){
  console.log(this.doc);
  if(this.doc.substr(this.doc.length-3,3)=='pdf'){  
    //window.open(this.docs[idItem],"_blank")
    this.pdfSrc = 'pdf';
  }else{
    this.pdfSrc = 'img';
}
}


  PageAnterior(){
    if (this.paginaPdf >1)
    this.paginaPdf--
  }
  PageSiguiente(){
    if (this.paginaPdf < this.maxPdf)
    this.paginaPdf++;
  }
  onPDFError(event){
  console.log('ERROR PDF:',event)
  }
  onProgress(event){
    console.log('Progress',event)
  }
  zoomIn(){
  this.zoomPdf+=0.2
  }
  zoomOut(){
    this.zoomPdf-=0.2
  }
  pdfLoaded(event){
    console.log('Loaded',event)
    this.maxPdf = event._pdfInfo.numPages;
  }
  cerrarPdf(){
    this.onBotonCerrar.emit(true);
  }
}
