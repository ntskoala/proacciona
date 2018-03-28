import { Component, OnInit, Input, Output,EventEmitter, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import {MatSnackBar} from '@angular/material';

import { Servidor } from '../../services/servidor.service';
import { PermisosService } from '../../services/permisos.service';
import { EmpresasService } from '../../services/empresas.service';
import { TranslateService } from 'ng2-translate';
import { URLS } from '../../models/urls';
import { Modal } from '../../models/modal';
import { usuario } from 'environments/environment'
import * as moment from 'moment/moment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {
@Output() loggedIn: EventEmitter<boolean> =  new EventEmitter<boolean>();
@Input() modeLogin:string;
  public usuario = usuario;
  public  modal: Modal = new Modal();
   public logoEmpresa:string;
 public idioma:string;
   constructor(public servidor: Servidor, public router: Router, public route: ActivatedRoute,
     public empresasService: EmpresasService, public translate: TranslateService, 
     public permisos: PermisosService, public snack: MatSnackBar) {}
 
 ngOnInit(){
       this.translate.setDefaultLang('cat');
       this.translate.use('cat');
     if (localStorage.getItem("idioma")){
       this.idioma = localStorage.getItem("idioma");
        this.empresasService.idioma = this.idioma;
       this.translate.use(this.idioma);
     }
     console.log('*******',this.route.queryParams["value"]["token"]);
     if(this.route.params["_value"]["token"]){
      this.isTokenValid(this.route.params["_value"]["token"]);
     }
     if (this.route.queryParams["value"]["token"]){
       this.isTokenValid(this.route.queryParams["value"]["token"]);
     }
     //this.login(this.usuario);
 }

 isTokenValid (token) {
  if (token){
            let expired:boolean;
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace('-', '+').replace('_', '/');
            //return JSON.parse(window.atob(base64));
            let jwt = JSON.parse(window.atob(base64));
            console.log (moment.unix(jwt.exp).isBefore(moment()));
            if (moment.unix(jwt.exp).isBefore(moment())) {
              expired = true;
            
           //return moment.unix(jwt.exp).isBefore(moment());
          }else{
            expired = false;
            sessionStorage.setItem('token', token);
            let user={
              'userId': jwt.jti,
              'userName': jwt.usr,
              'userTipo': jwt.rol,
              'idEmpresa': jwt.emp
             }
             this.procesLogedIn(user);
            //return true;
          }
        }
}

   login(usuario) {
     if (!localStorage.getItem("idioma")){
     localStorage.setItem("idioma",usuario.idioma);
     this.empresasService.idioma = usuario.idioma;
      this.translate.use(usuario.idioma);
     console.log ("idioma:", usuario.idioma);
       }
       console.log ("idioma:",this.idioma);
     // Parámetros
     let param = '?user=' + usuario.user + '&password=' + usuario.password; 
     this.servidor.login(URLS.LOGIN, param).subscribe(
       response => {
         // Limpiar form
         this.usuario = {};        
         // Si el usuario es correcto
         if (response.success == 'true') {
          sessionStorage.setItem('token', response.token);
           let user={
            'userId': response.data[0].id,
            'userName': response.data[0].usuario,
            'userTipo': response.data[0].tipouser,
            'idEmpresa': response.data[0].idempresa
           }
           this.procesLogedIn(user);
          // sessionStorage.setItem('userId', response.data[0].id);
          // sessionStorage.setItem('userName', response.data[0].usuario);
          // sessionStorage.setItem('userTipo', response.data[0].tipouser);

          //  this.empresasService.userId = response.data[0].id;
          //  this.empresasService.userName = response.data[0].usuario;
          //  this.empresasService.userTipo = response.data[0].tipouser;

          //  sessionStorage.setItem('token', response.token);

          //  switch (response.data[0].tipouser) {
          //    case 'Administrador':
          //    sessionStorage.setItem('administrador', 'true');
          //    this.empresasService.administrador = true;

          //      if (this.empresasService.login){
          //       window.open('../empresas','_parent')
          //      }else{
          //      this.router.navigate(['empresas']);
          //      }

          //      break;
          //    case "Mantenimiento":
             
          //    case 'Gerente':

          //      console.log("gerente o mantenimiento");
          //      let idEmpresa = response.data[0].idempresa;
          //      sessionStorage.setItem('idEmpresa', idEmpresa);
          //      this.empresasService.empresaActiva = idEmpresa;
          //      sessionStorage.setItem('administrador', 'false');
          //      this.empresasService.administrador = false;
          //      this.setPermisos(idEmpresa);
          //      console.log(idEmpresa);

          //     if (this.empresasService.login){
          //       window.open('../empresas','_parent')
          //     }else{
          //      this.router.navigate(['empresas']);
          //     }
          //      break;
          //    default:
          //      // Se queda en login
          //      if (this.empresasService.login){
          //       this.snack.open('Usuario sin permisos', 'ok', {
          //         duration: 3000,
          //       });
          //      }else{
          //      this.modal.titulo = 'Usuario sin permisos';
          //      this.modal.visible = true;
          //      }
          //  }
         } else {
           // TODO: chequear si la sesión está caducada
           // Usuario erróneo
           if (this.empresasService.login){
            this.snack.open('Usuario incorrecto', 'ok', {
              duration: 3000,
            });
           }else{
           this.modal.titulo = 'Usuario incorrecto';
           this.modal.visible = true;
           }
         }
       }
     );
   }
 procesLogedIn(user:any){
  sessionStorage.setItem('userId', user.userId);
  sessionStorage.setItem('userName', user.userName);
  sessionStorage.setItem('userTipo', user.userTipo);

   this.empresasService.userId = user.userId;
   this.empresasService.userName = user.userName;
   this.empresasService.userTipo = user.userTipo;

   //sessionStorage.setItem('token', response.token);
   console.log("procesLogedIn mode:",this.modeLogin);
   switch (user.userTipo) {
     case 'Administrador':
     console.log("gerente o mantenimiento");
     sessionStorage.setItem('administrador', 'true');
     this.empresasService.administrador = true;

//       if (this.empresasService.login){
//        window.open('../empresas','_parent')
//       }else{
         if (this.modeLogin == 'empresas'){
           
           this.loggedIn.emit(true);
         }else{
          this.router.navigate(['empresas']);
         }
//       }

       break;
     case "Mantenimiento":
     
     case 'Gerente':

       console.log("gerente o mantenimiento");
       let idEmpresa = user.idEmpresa;
       sessionStorage.setItem('idEmpresa', idEmpresa);
       this.empresasService.empresaActiva = idEmpresa;
       sessionStorage.setItem('administrador', 'false');
       this.empresasService.administrador = false;
       this.setPermisos(idEmpresa);
       console.log(idEmpresa);

//      if (this.empresasService.login){
//        window.open('../empresas','_parent')
//      }else{
        if (this.modeLogin == 'empresas'){
          this.loggedIn.emit(true);
        }else{
          this.router.navigate(['empresas']);
        }
//      }
       break;
     default:
       // Se queda en login
       if (this.empresasService.login){
        this.snack.open('Usuario sin permisos', 'ok', {
          duration: 3000,
        });
       }else{
       this.modal.titulo = 'Usuario sin permisos';
       this.modal.visible = true;
       }
   }
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
                 //this.permisos.setOpciones(true,element.opcion);
                 this.permisos.setOpciones(true,element.idopcion,'login');
               }
               console.log('setting permisos');
               this.permisos.modulosFuente.next('login');
             }
         },
         error => {console.log(error)});
 }
 
 test(){
   return 5;
 }
 
}
