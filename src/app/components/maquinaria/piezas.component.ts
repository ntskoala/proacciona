import { Component, OnInit, Input, OnChanges } from '@angular/core';

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
public piezas: PiezasMaquina[] =[]; 
public nuevoPieza: PiezasMaquina = new PiezasMaquina(0,0,'');
public guardar =[];
public idBorrar;
public fotoSrc: string;
public modal2: boolean = false;;
public verdoc: boolean = false;
public url=[];
public foto:string;
  modal: Modal = new Modal();
  constructor(private servidor: Servidor,private empresasService: EmpresasService) {}

  ngOnInit() {
    //solo se carga el control si hay una maquina seleccionada, por eso no necesito controlar
 //   this.setMantenimientos();
    
  }
  photoURL(i) {
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
            }
        },
       error=>console.log(error),
        ()=> console.log("piezas",this.piezas)
        );
  }

    modificarItem(idItem: number) {
    this.guardar[idItem] = true;
  }

 actualizarItem(pieza: PiezasMaquina) {
    this.guardar[pieza.id] = false;

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
    this.servidor.postObject(URLS.PIEZAS, this.nuevoPieza).subscribe(
      response => {
        if (response.success) {
          this.nuevoPieza.id = response.id;
          this.piezas.push(this.nuevoPieza);
          this.nuevoPieza = new PiezasMaquina(0,0,'');
        }
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

  uploadImg(event, idItem,i) {
    console.log(event)
    var target = event.target || event.srcElement; //if target isn't there then take srcElement
    let files = target.files;
    //let files = event.srcElement.files;
    let idEmpresa = this.empresasService.seleccionada.toString();
    this.servidor.postDoc(URLS.UPLOAD_DOCS, files,'maquina_piezas',idItem, this.empresasService.seleccionada.toString()).subscribe(
      response => {
        console.log('doc subido correctamente',files[0].name);
        this.piezas[i].doc = files[0].name;
        this.url[i]= URLS.DOCS + this.empresasService.seleccionada + '/maquina_piezas/' +  idItem +'_'+files[0].name;
        // let activa = this.empresas.find(emp => emp.id == this.empresasService.seleccionada);
        // activa.logo = '1';
      }
    )
  }


}