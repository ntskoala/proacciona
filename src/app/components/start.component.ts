import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { Servidor } from '../services/servidor.service';
import { PermisosService } from '../services/permisos.service';
import { EmpresasService } from '../services/empresas.service';
import { TranslateService } from '@ngx-translate/core';
import { URLS } from '../models/urls';
import { Modal } from '../models/modal';
import { usuario } from 'environments/environment'
@Component({
  selector: 'start',
  templateUrl: '../assets/html/start.component.html'
})
export class StartComponent implements OnInit {
// public usuario: Object = {"user":"","password":"","idioma":null};

// public  usuario: Object = {"user":"demo","password":"demo","idioma":null};

 //public  usuario: Object = {"user":"admin","password":"admin$2017","idioma":null};
public usuario = usuario;
 public  modal: Modal = new Modal();
  public logoEmpresa:string;
public gallery: string;
public idioma:string;
  constructor(public servidor: Servidor, public route: ActivatedRoute, public router: Router,
    public empresasService: EmpresasService, public translate: TranslateService, public permisos: PermisosService) {}

ngOnInit(){
      this.translate.setDefaultLang('cat');
      this.translate.use('cat');
    if (localStorage.getItem("idioma")){
      this.idioma = localStorage.getItem("idioma");
       this.empresasService.idioma = this.idioma;
      this.translate.use(this.idioma);
    }
  // this.gallery = "https://source.unsplash.com/1200x200/?food";
    //this.login(this.usuario);
    //console.log('*******',this.route.queryParams["value"]);
}

//   login(usuario) {
//     if (!localStorage.getItem("idioma")){
//     localStorage.setItem("idioma",usuario.idioma);
//     this.empresasService.idioma = usuario.idioma;
//      this.translate.use(usuario.idioma);
//     console.log ("idioma:", usuario.idioma);
//       }
//       console.log ("idioma:",this.idioma);
//     // Parámetros
//     let param = '?user=' + usuario.user + '&password=' + usuario.password; 
//     this.servidor.login(URLS.LOGIN, param).subscribe(
//       response => {
//         // Limpiar form
//         this.usuario = {};        
//         // Si el usuario es correcto
//         if (response.success == 'true') {
//           this.empresasService.userId = response.data[0].id;
//           this.empresasService.userName = response.data[0].usuario;
//           this.empresasService.userTipo = response.data[0].tipouser;
//           //this.empresasService.idioma = response.data[0].idioma;
//           // Guarda token en sessionStorage
//           sessionStorage.setItem('token', response.token);
//           // Redirección en función del tipo de usuario
//           switch (response.data[0].tipouser) {
//             case 'Administrador':
//               // Redirecciona a empresas
//               this.router.navigate(['empresas']);
//               this.empresasService.administrador = true;
//               break;
//             case "Mantenimiento":
            
//             case 'Gerente':
//               // Redirecciona a página de empresa
//               console.log("gerente o mantenimiento");
//               let idEmpresa = response.data[0].idempresa;
//               this.empresasService.empresaActiva = idEmpresa;
//               this.empresasService.administrador = false;
//               this.setPermisos(idEmpresa);
//               console.log(idEmpresa);
// //              this.router.navigate(['empresa', idEmpresa]);
//               this.router.navigate(['empresas']);
//               break;
//             default:

//               // Se queda en login
//               this.modal.titulo = 'Usuario sin permisos';
//               this.modal.visible = true;
//           }
//         } else {
//           // TODO: chequear si la sesión está caducada
//           // Usuario erróneo
//           this.modal.titulo = 'Usuario incorrecto';
//           this.modal.visible = true;
//         }
//       }
//     );
//   }

//   cerrarModal() {
//     this.modal.visible = false;
//   }


// setPermisos(idempresa){
//         let parametros = '&idempresa=' + idempresa; 
//         this.servidor.getObjects(URLS.OPCIONES_EMPRESA, parametros).subscribe(
//           response => {
            
//             if (response.success && response.data) {
//               for (let element of response.data) {
//                 //this.permisos.setOpciones(true,element.opcion);
//                 this.permisos.setOpciones(true,element.idopcion,'login');
//               }
//               console.log('setting permisos');
//               this.permisos.modulosFuente.next('login');
//             }
//         },
//         error => {console.log(error)});
// }

// test(){
//   return 5;
// }

}
