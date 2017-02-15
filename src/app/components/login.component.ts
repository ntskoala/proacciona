import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Servidor } from '../services/servidor.service';
import { PermisosService } from '../services/permisos.service';
import { EmpresasService } from '../services/empresas.service';
import { TranslateService } from 'ng2-translate';
import { URLS } from '../models/urls';
import { Modal } from '../models/modal';

@Component({
  selector: 'login',
  templateUrl: '../assets/html/login.component.html'
})
export class LoginComponent implements OnInit {
  usuario: Object = {"user":"","password":""};
//  usuario: Object = {"user":"demo","password":"demo","idioma":"es"};
  modal: Modal = new Modal();

  constructor(private servidor: Servidor, private router: Router,
    private empresasService: EmpresasService, private translate: TranslateService, private permisos: PermisosService) {}

ngOnInit(){
      this.translate.setDefaultLang('cat');
      this.translate.use('cat');
}

  login(usuario) {
    this.empresasService.idioma = usuario.idioma;
     this.translate.use(usuario.idioma);
    console.log ("idioma:", usuario.idioma);
    // Parámetros
    let param = '?user=' + usuario.user + '&password=' + usuario.password; 
    this.servidor.login(URLS.LOGIN, param).subscribe(
      response => {
        // Limpiar form
        this.usuario = {};        
        // Si el usuario es correcto
        if (response.success == 'true') {
          this.empresasService.userId = response.data[0].id;
          this.empresasService.userName = response.data[0].usuario;
          this.empresasService.userTipo = response.data[0].tipouser;
          // Guarda token en sessionStorage
          sessionStorage.setItem('token', response.token);
          // Redirección en función del tipo de usuario
          switch (response.data[0].tipouser) {
            case 'Administrador':
              // Redirecciona a empresas
              this.router.navigate(['empresas']);
              this.empresasService.administrador = true;
              break;
            case 'Gerente':
              // Redirecciona a página de empresa
              console.log("gerente");
              let idEmpresa = response.data[0].idempresa;
              this.empresasService.empresaActiva = idEmpresa;
              this.empresasService.administrador = false;
              this.setPermisos(idEmpresa);
              console.log(idEmpresa);
//              this.router.navigate(['empresa', idEmpresa]);
              this.router.navigate(['empresas']);
              break;
            default:

              // Se queda en login
              this.modal.titulo = 'Usuario sin permisos';
              this.modal.visible = true;
          }
        } else {
          // TODO: chequear si la sesión está caducada
          // Usuario erróneo
          this.modal.titulo = 'Usuario incorrecto';
          this.modal.visible = true;
        }
      }
    );
  }

  cerrarModal() {
    this.modal.visible = false;
  }


setPermisos(idempresa){
        let parametros = '&idempresa=' + idempresa; 
        this.servidor.getObjects(URLS.OPCIONES_EMPRESA, parametros).subscribe(
          response => {
            
            if (response.success && response.data) {
              for (let element of response.data) {
//                console.log(element.idopcion, typeof(element.idopcion))
                switch (element.idopcion){
                  case "1":
                    this.empresasService.setOpciones(true);
                    break;
                  case "2":
                    this.permisos.setOpciones(true,'fichas_maquinaria');
                    break;
                }
                //this.guardar[element.id] = false;
              }
            }
        },
        error => {console.log(error)});
}

test(){
  return 5;
}

}
