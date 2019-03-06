import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DomSanitizer} from '@angular/platform-browser';
import { Servidor } from '../../../services/servidor.service';
import { EmpresasService } from '../../../services/empresas.service';
import { URLS } from '../../../models/urls';
import * as moment from 'moment';


@Component({
  selector: 'app-download-informe',
  templateUrl: './download-informe.component.html',
  styleUrls: ['./download-informe.component.css']
})
export class DownloadInformeComponent implements OnInit {
@Input() informeData:any;
@Output() informeRecibido: EventEmitter<boolean> = new EventEmitter();
public exportar_informes: boolean =false;
public exportando:boolean=false;
public innerHtml='';
public xls:boolean;
public pdf: boolean;
public html;
public progreso:number=0;
public speed=500;
  constructor(
    public servidor: Servidor, 
    public empresasService: EmpresasService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
  }

  ngOnChanges(){
   // this.downloads();
  }

async downloads(){
    this.progress(10);
     let url ='https://script.google.com/a/proacciona.es/macros/s/AKfycbzIpotMyRcSxISIMvMLWN0-boPG8drRZ9wD8IQO5eQ/dev?idEmpresa='+this.empresasService.seleccionada;
    this.innerHtml += 'Solicitado<br>...';
    this.servidor.postSimple(url,this.informeData).subscribe(
      async (respuesta)=>{
        console.log('########',respuesta.json());
        this.innerHtml += respuesta.json()["contenido"];
        let descargaUrl = respuesta.json()["url"]; 
        let descargaPdf = respuesta.json()["urlPdf"]; 
        let id = respuesta.json()["id"]; 
        let time=0;
      if (this.pdf){
        this.innerHtml += 'Descarga Pdf...<br>';
        time=6000;
        let aPdf = document.createElement('a');
        await this.downloadInforme(descargaPdf,aPdf,'aPdf')
        this.pdf = false;
        if (!this.pdf && !this.xls) 
        this.informeRecibido.emit(true);
        }
        if (this.xls){
          this.innerHtml += 'Descarga Xls...<br>';
          let aXls = document.createElement('a');
          setTimeout(async()=>{
          await  this.downloadInforme(descargaUrl,aXls,'aXls')
          this.xls = false;
                  if (!this.pdf && !this.xls) 
                  this.informeRecibido.emit(true);
                },time)
              }
              let deleteFile={'accion':'delete','id':id}
              console.log(deleteFile);
              this.servidor.postSimple(url,deleteFile).subscribe(
                (resultado)=>{
                  console.log(resultado);
                });
        },
        (error)=>{console.log('ERROR SCRIPTING ',error);},
        ()=>{
          this.progress(80);
        }
    )
  }
  progress(start){
    clearInterval();
    this.progreso=start;
    //for (let x=start;x<100;x++){
      setInterval(()=>{
        this.progreso+=1
        if (this.progreso>50 && this.progreso<80) this.speed = 1000;
        if (this.progreso>60 && this.progreso<80) this.speed = 1500;
        if (this.progreso>70 && this.progreso<80) this.speed = 3000;
        if (this.progreso>99 ) clearInterval();
        },this.speed)
    //}
  }

  downloadInforme(file_path,a,id){

    a.href = file_path;
    a.download = file_path.substr(file_path.lastIndexOf('/') + 1);
    a.id=id;
    console.log(a,file_path);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    this.innerHtml += 'descargado<br>';
    clearInterval();
    this.progreso=100;
    return (true);
  }
  close(){
    console.log('close');
    this.informeRecibido.emit(true);
  }
  downloadInforme_old(file_path,a,id){
    return new Promise((resolve)=>{
    //let a = document.createElement('a');
    a.href = file_path;
    a.download = file_path.substr(file_path.lastIndexOf('/') + 1);
    a.id=id;
    console.log(a,file_path);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
          resolve (true);
  });
  }

test(){
  let url ='https://script.google.com/a/proacciona.es/macros/s/AKfycbzIpotMyRcSxISIMvMLWN0-boPG8drRZ9wD8IQO5eQ/dev?idEmpresa='+this.empresasService.seleccionada;
  this.innerHtml += 'solicitado<br>...';
  // this.servidor.getSimple(url,'').subscribe(
  //   (respuesta)=>{
  //     this.html=respuesta    });
}
htmlEntities(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

}
