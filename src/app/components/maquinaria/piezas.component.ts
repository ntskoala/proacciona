import { Component, OnInit, Input,Output, OnChanges, EventEmitter } from '@angular/core';

import {DataTable} from 'primeng/primeng';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from '@ngx-translate/core';

import * as moment from 'moment';

import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { Empresa } from '../../models/empresa';
import { PiezasMaquina } from '../../models/piezasmaquina';
 import { Maquina } from '../../models/maquina';
 import { Modal } from '../../models/modal';
@Component({
  selector: 'piezas',
  templateUrl: './piezas.component.html',
  styleUrls:['ficha-maquina.css']
})
export class PiezasComponent implements OnInit, OnChanges {
@Input() maquina:Maquina;
@Output() onPiezas:EventEmitter<PiezasMaquina[]>= new EventEmitter();
public piezas: PiezasMaquina[] =[]; 
public nuevoPieza: PiezasMaquina = new PiezasMaquina(0,0,'');
public guardar =[];
public alertaGuardar:boolean=false;
public cantidad:number=1;
public idBorrar;
public fotoSrc: string;
public modal2: boolean = false;;
public verdoc: boolean = false;
public url=[];
public foto:string;
public top:string;
  modal: Modal = new Modal();
  constructor(public servidor: Servidor,public empresasService: EmpresasService
    , public translate: TranslateService, private messageService: MessageService) {}

  ngOnInit() {
    //solo se carga el control si hay una maquina seleccionada, por eso no necesito controlar
 //   this.setMantenimientos();
    
  }
  photoURL(i) {
   
    let calc = window.scrollY;
    this.top = calc + 'px';
    console.log(this.url[i],this.top)
    this.verdoc=!this.verdoc;
    this.foto = this.url[i];
  }

ngOnChanges(){
    this.setMantenimientos();
}
  setMantenimientos(){
    let params = this.maquina.id;
    let parametros = '&idmaquina=' + params;
       // let parametros = '&idempresa=' + seleccionada.id; 
        this.servidor.getObjects(URLS.PIEZAS, parametros).subscribe(
          response => {
            this.piezas = [];
            if (response.success && response.data) {
              for (let element of response.data) {
                this.piezas.push(new PiezasMaquina(element.id, element.idmaquina, element.nombre, element.cantidad,element.material, element.doc));
                this.guardar[element.id] = false;
                this.url.push(URLS.DOCS + this.empresasService.seleccionada + '/maquina_piezas/' + element.id +'_'+element.doc);
              }
              this.onPiezas.emit(this.piezas);
            }
        },
       error=>console.log(error),
        ()=> console.log("piezas",this.piezas)
        );
  }

  onEdit(evento){
    this.itemEdited(evento.data.id);
    }
    itemEdited(idItem: number) {
    this.guardar[idItem] = true;
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

 saveItem(pieza: PiezasMaquina) {
    this.guardar[pieza.id] = false;
    this.alertaGuardar = false;
    let parametros = '?id=' + pieza.id;        
    this.servidor.putObject(URLS.PIEZAS, parametros, pieza).subscribe(
      response => {
        if (response.success) {
          console.log('Pieza updated');
        }
    });
  }
  crearItem() {
    this.nuevoPieza.idmaquina = this.maquina.id;
    let nombreOrigen = this.nuevoPieza.nombre;
    for (let x=0;x<this.cantidad;x++){
      if (x>0) this.nuevoPieza.nombre= nombreOrigen + x;
      this.addItem(this.nuevoPieza,this.nuevoPieza.nombre).then(
        (valor)=>{
          this.cantidad--;
          console.log(this.cantidad,valor,typeof(valor))
          if (valor && this.cantidad == 0){
            this.nuevoPieza = new PiezasMaquina(0,0,'');
            this.piezas = this.piezas.slice();
          }
        }
      )
  }
  }

  addItem(item: PiezasMaquina, nombre){
    return new Promise((resolve,reject)=>{
      this.servidor.postObject(URLS.PIEZAS, this.nuevoPieza).subscribe(
      response => {
        if (response.success) {
          item.id = response.id;
          this.piezas.push(new PiezasMaquina(response.id,item.idmaquina,nombre,item.cantidad,item.material));
          this.url.push('');
          resolve(true);
        }
    },
    error =>{
      console.log(error);
      resolve(true);
    },
    () =>  {}
    );
  });
  }

  checkBorrar(idBorrar: number) {
    // Guardar el id del control a borrar
    this.idBorrar = idBorrar;
    // Crea el modal
    this.modal.titulo = 'borrar Pieza';
    this.modal.subtitulo = 'borrar Pieza';
    this.modal.eliminar = true;
    this.modal.visible = true;
  }

  cerrarModal(event: boolean) {
    this.modal.visible = false;
    if (event) {
      let parametros = '?id=' + this.idBorrar;
      this.servidor.deleteObject(URLS.PIEZAS, parametros).subscribe(
        response => {
          if (response.success) {
            let controlBorrar = this.piezas.find(pieza => pieza.id == this.idBorrar);
            let indice = this.piezas.indexOf(controlBorrar);
            this.piezas.splice(indice, 1);
          }
      });
    }
  }

  ventanaFoto(pieza: PiezasMaquina, entidad: string) {
    this.fotoSrc = URLS.DOCS + this.empresasService.seleccionada + '/'+ entidad + "/" + pieza.id+ "_"+ pieza.doc;
    this.modal2 = true;
  }

  uploadImg(event, idItem,i,tipo) {
    console.log(event)
    var target = event.target || event.srcElement; //if target isn't there then take srcElement
    let files = target.files;
    //let files = event.srcElement.files;
    let idEmpresa = this.empresasService.seleccionada.toString();
    this.servidor.postDoc(URLS.UPLOAD_DOCS, files,'maquina_piezas',idItem, this.empresasService.seleccionada.toString(),tipo).subscribe(
      response => {
        console.log('doc subido correctamente',files[0].name);
        this.piezas[i].doc = files[0].name;
        this.url[i]= URLS.DOCS + this.empresasService.seleccionada + '/maquina_piezas/' +  idItem +'_'+files[0].name;
        // let activa = this.empresas.find(emp => emp.id == this.empresasService.seleccionada);
        // activa.logo = '1';
      }
    )
  }

  exportData(tabla: DataTable){
    console.log(tabla);
    let origin_Value = tabla._value;
    tabla._value = tabla.dataToRender;
    //tabla._value.map((maquina)=>{});
    tabla.csvSeparator = ";";
    tabla.exportFilename = "Mantenimietos_preventivos_ "+this.maquina.nombre;
    tabla.exportCSV();
    tabla._value = origin_Value;
  }

}