import { Component } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { Servidor } from '../services/servidor.service';
import { EmpresasService } from '../services/empresas.service';
import { URLS } from '../models/urls';
import { Empresa } from '../models/empresa';
import { Modal } from '../models/modal';

@Component({
  selector: 'seleccionar-empresa',
  templateUrl: '../assets/html/seleccionar-empresa.component.html'
})

export class SeleccionarEmpresaComponent {
  
  // subscription: Subscription;
  // //empresas: Empresa[] = [];
  // empresa: Empresa = new Empresa('Seleccionar empresa', '0', 0);
   modal: Modal = new Modal();
  // formdata: FormData = new FormData();
  public Premium: boolean;

  constructor(public servidor: Servidor, public empresasService: EmpresasService) {}



  selecciona(empresa: Empresa){
    this.empresasService.seleccionarEmpresa(empresa);
    //console.log("informes",this.empresasService.empresa.exportar_informes);
  }

  checkBorrar() {
    if (this.empresasService.seleccionada != 0) {
      this.modal.titulo = 'borrarEmpresaT';
      this.modal.subtitulo = 'borrarEmpresaST';
      this.modal.eliminar = true;
      this.modal.visible = true;
    }
  }

  cerrarModal(event: boolean) {
    this.modal.visible = false;
    if (event) {
      let parametros = '?id=' +  this.empresasService.seleccionada;
      this.servidor.deleteObject(URLS.EMPRESAS, parametros).subscribe(
        response => {
          if (response.success) {
            console.log('empresa Borrada');
//PENDIENTE LIMPIAR DESPLEGABLE DE EMPRESAS            
            // let empresaBorrar = this.empresas.find(emp => emp.id == this.empresasService.seleccionada);
            // let indice = this.empresas.indexOf(empresaBorrar);
            // this.empresas.splice(indice, 1);
            // this.empresasService.seleccionada = 0;
          }
      },
      error => console.log(error));
    }
  }

  uploadLogo(event) {
    var target = event.target || event.srcElement; //if target isn't there then take srcElement
    let files = target.files;
    //let files = event.srcElement.files;
    let idEmpresa = this.empresasService.seleccionada.toString();
    this.servidor.postLogo(URLS.UPLOAD_LOGO, files, idEmpresa).subscribe(
      response => {
        console.log('logo subido correctamente');
        // let activa = this.empresas.find(emp => emp.id == this.empresasService.seleccionada);
        // activa.logo = '1';
      }
    )
  }
premium(){
  this.Premium = !this.Premium;
}
}
