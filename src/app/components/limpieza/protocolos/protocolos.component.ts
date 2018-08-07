import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from '@ngx-translate/core';

import { Servidor } from '../../../services/servidor.service';
import { URLS } from '../../../models/urls';
import { EmpresasService } from '../../../services/empresas.service';
import { LimpiezaElemento } from '../../../models/limpiezaelemento';
import { LimpiezaZona } from '../../../models/limpiezazona';
import { Modal } from '../../../models/modal';
import { Protocolo } from '../../../models/limpiezaprotocolo';


@Component({
  selector: 'app-protocolos',
  templateUrl: './protocolos.component.html',
  styleUrls: ['./protocolos.component.css']
})
export class ProtocolosComponent implements OnInit {
  @Output() onProtocolosReady:EventEmitter<Protocolo[]>=new EventEmitter<Protocolo[]>();
  
  public nuevoItem: Protocolo = new Protocolo(null,this.empresasService.seleccionada,'','','');
  public items: Protocolo[];
  public protocolo:Object[][]=[];
  public alertaGuardar:boolean=false;
  public nuevoProcedimiento:string[]=[];
  public hayCambios:boolean[]=[];
  public idBorrar:number;
  public entidad:string="&entidad=limpieza_protocolos";
  public modal: Modal = new Modal();
  public widthLista:string;
  //public url=[];
  public verdoc: boolean = false;
  public foto:string;
  public baseurl = URLS.DOCS + this.empresasService.seleccionada + '/limpieza_protocolos/';



    constructor(public servidor: Servidor,public empresasService: EmpresasService
      , public translate: TranslateService, private messageService: MessageService) {}
  
    ngOnInit() {
      this.setItems().then(
        (resultado)=>{
        if(resultado) {
            // try{
            // this.protocolo = JSON.parse(this.parentProtocol);
            // }
            // catch (e){
            //     console.log (e);
            // }
            this.onProtocolosReady.emit(this.items);
            console.log(this.protocolo);
        }
      });
  }
    ngOnChanges(){     
    }


    setItems(){
      return new Promise((resolve, reject) => {
      let x = 0;
      this.items = [];
      this.hayCambios = [];
      this.protocolo[x]=[];
      this.nuevoProcedimiento =[];
    //  let parametros = '&idmaquina=' + params;
        let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+"&order=id"; 
          this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
            response => {
              if (response.success && response.data) {
                for (let element of response.data) {  
                    this.items.push(new Protocolo(element.id,element.idempresa,element.protocolo,element.nombre,element.doc));
                    this.hayCambios.push(false);
                    this.nuevoProcedimiento.push(null);
                    if (element.protocolo) {
                      this.protocolo[x]= JSON.parse(element.protocolo);
                    }else{
                      this.protocolo[x]=[];
                    }
                    x++;
                    // this.url.push({"imgficha":this.baseurl + element.id +'_'+element.imgficha,"imgcertificado":this.baseurl + element.id +'_'+element.imgcertificado});
               }
                  resolve(true);
              }else{
                resolve(false);
              }
               console.log("protocolos",this.items,this.protocolo);
               this.widthLista = (285 * x) + 'px';
          });
      });
    }

newItem(){
    console.log (this.nuevoItem);
    let param = this.entidad
    this.servidor.postObject(URLS.STD_ITEM, this.nuevoItem,param).subscribe(
      response => {
        if (response.success) {
          this.nuevoItem.id = response.id;
          this.items.push(this.nuevoItem);
          this.hayCambios.push(false);
          this.nuevoProcedimiento.push(null);
          this.protocolo.push([]);
          this.items = this.items.slice();
          this.nuevoItem = new Protocolo(null,this.empresasService.seleccionada,'','','');
          this.onProtocolosReady.emit(this.items);
          this.widthLista = (285 * this.items.length) + 'px';
        }
    });
  }


    itemEdited(x: number) {
    this.hayCambios[x] = true;
    //console.log (fecha.toString());
    if (!this.alertaGuardar){
      this.alertaGuardar = true;
      this.setAlerta('alertas.guardar');
      }
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
 saveItem(item: Protocolo,x:number) {
    //this.guardar[item.id] = false;
    this.alertaGuardar = false;
    let parametros = '?id=' + item.id+this.entidad;        
    this.servidor.putObject(URLS.STD_ITEM, parametros, item).subscribe(
      response => {
        if (response.success) {
          console.log('item updated');
          this.hayCambios[x] = false;
          this.nuevoProcedimiento[x] = null;
          this.onProtocolosReady.emit(this.items);
        }
      });
 }

 checkBorrar(idBorrar: number) {
this.idBorrar = idBorrar;
  // Crea el modal
  this.modal.titulo = 'borrarProtocoloT';
  this.modal.subtitulo = 'borrarProtocoloST';
  this.modal.eliminar = true;
  this.modal.visible = true;
}
cerrarModal(event: boolean) {
  this.modal.visible = false;
  if (event) {
    let parametros = '?id=' + this.idBorrar+this.entidad;
    this.servidor.deleteObject(URLS.STD_ITEM, parametros).subscribe(
      response => {
        if (response.success) {
          let indice = this.items.findIndex(protocolo => protocolo.id == this.idBorrar);
          //let indice = this.items.indexOf(controlBorrar);
          this.items.splice(indice, 1);
          this.protocolo.splice(indice, 1);
          this.hayCambios.splice(indice,1);
          this.nuevoProcedimiento.splice(indice,1)
          this.items = this.items.slice();
          this.onProtocolosReady.emit(this.items);
          this.widthLista = (300 * this.items.length) + 'px';
        }
    });
  }
}


uploadImg(event, idItem,i,field) {
  console.log(idItem,i)
  var target = event.target || event.srcElement; //if target isn't there then take srcElement
  let files = target.files;
  let idEmpresa = this.empresasService.seleccionada.toString();
  this.servidor.postDoc(URLS.UPLOAD_DOCS, files,'limpieza_protocolos',idItem, this.empresasService.seleccionada.toString(),field).subscribe(
    response => {
      console.log('doc subido correctamente',idItem,i,this.items[i],files[0].name);
      this.items[i].doc = files[0].name;
    }
  )
}


photoURL(i,tipo) {
  console.log(i)
  let extension = this.items[i].doc.substr(this.items[i].doc.length-3);
  let url = this.baseurl+this.items[i].id +"_"+this.items[i].doc;
  if (extension == 'jpg' || extension == 'epg' || extension == 'gif' || extension == 'png'){
  this.verdoc=!this.verdoc;
  this.foto = url
  }else{
    window.open(url,'_blank');
  }
}


    addProcedimiento(x){
      console.log(x,this.protocolo);
      this.protocolo[x].push({"descripcion":this.nuevoProcedimiento[x]});
      this.nuevoProcedimiento[x]=null;
      this.itemEdited(x);
      }
      removeProcedimiento(n,i){
          this.protocolo[i].splice(n,1);
          this.itemEdited(i);
      }
      setProtocolo(indice:number){
        //let json = {'protocolo': this.protocolo[indice]};
        this.items[indice].protocolo = JSON.stringify(this.protocolo[indice]);
        this.saveItem(this.items[indice],indice);
         // this.protocolEmitter.emit(JSON.stringify(this.protocolo));
      }
      

}
