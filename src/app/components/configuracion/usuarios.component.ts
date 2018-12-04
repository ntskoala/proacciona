import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from '@ngx-translate/core';

import { EmpresasService } from '../../services/empresas.service';
import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { Usuario } from '../../models/usuario';
import { Empresa } from '../../models/empresa';
import { Modal } from '../../models/modal';

@Component({
  selector: 'tab-usuarios',
  templateUrl: './usuarios.component.html'
})
export class UsuariosComponent implements OnInit {

  public subscription: Subscription;
  usuarios: Usuario[] = [];
  guardar = [];
  public alertaGuardar:object={'guardar':false,'ordenar':false};  
  nuevoUsuario: Object = {tipouser: 'Operario',superuser:0};
  idBorrar: number;
  modal: Modal = new Modal();
  procesando:boolean=false;
  public tipos:object[]=[{label:'Operario', value:'Operario'},{label:'Gerente', value:'Gerente'},{label:'Mantenimiento', value:'Mantenimiento'}];
  public superusers:object[]=[{label:'Activado', value:1},{label:'Desactivado', value:0}];
  
  constructor(public servidor: Servidor, public empresasService: EmpresasService
    , public translate: TranslateService, private messageService: MessageService) {}

  ngOnInit() {
    console.log (this.empresasService.seleccionada);
    if (this.empresasService.seleccionada > 0) this.setEmpresa(this.empresasService.seleccionada.toString());
    this.subscription = this.empresasService.empresaSeleccionada.subscribe(
      emp => {
        this.setEmpresa(emp);
    });
    if (this.empresasService.administrador == false) {
      this.setEmpresa(this.empresasService.empresaActiva.toString());
    }
    this.traduceOpciones();
  }
  traduceOpciones(){
    if (localStorage.idioma=='cat'){
    this.tipos=[{label:'Operari', value:'Operario'},{label:'Gerent', value:'Gerente'},{label:'Manteniment', value:'Mantenimiento'}];
    this.superusers=[{label:'Activat', value:1},{label:'Desactivat', value:0}];
    } 
  }
  setEmpresa(emp: Empresa | string) {
    let params = typeof(emp) == "string" ? emp : emp.id
    let parametros = '&idempresa=' + params;
    // llamada al servidor para conseguir los usuarios
    this.servidor.getObjects(URLS.USUARIOS, parametros).subscribe(
      response => {
        this.usuarios = [];
        if (response.success && response.data) {
          let orden=0;
          for (let element of response.data) {
            if (element.orden == 0){
              this.guardar[element.id] = true;
              orden++;
              }else{orden=parseInt(element.orden);}
            this.usuarios.push(new Usuario(element.id, element.usuario, element.password,
              element.tipouser, element.email, element.idempresa,0+orden,element.superuser));
            this.guardar[element.id] = false;
          }
        }
    });
    
  }

  crearUsuario(usuario) {
    let usuarioCrear = new Usuario(0, usuario.usuario, usuario.password,
      usuario.tipouser, usuario.email, this.empresasService.seleccionada,this.newOrden(),usuario.superuser);
    this.servidor.postObject(URLS.USUARIOS, usuarioCrear).subscribe(
      response => {
        if (response.success == "true") {
          usuarioCrear.id = response.id;
          this.usuarios.push(usuarioCrear);
          this.usuarios = this.usuarios.slice();
          this.setAlerta('alertas.saveOk','success','alertas.tituloAlertaInfo');
        }else{
          this.setAlerta('alertas.saveNotOk','error','alertas.tituloAlertaInfo',response.error);
        }
    },
    (error)=>{
      this.setAlerta('alertas.saveNotOk','error','alertas.tituloAlertaInfo');
    });
    // limpiar form
    this.nuevoUsuario = {usuario: '', password: '', tipouser: 'Operario'}  
  }
  
  newOrden():number{
    let orden;
    if ( this.usuarios.length && this.usuarios[this.usuarios.length-1].orden >0){
      orden = this.usuarios[this.usuarios.length-1].orden+1;
     }else{
      orden = 0;
     }
     return orden;
  }
  checkBorrar(idBorrar: number) {
    // Guardar el id del usuario a borrar
    this.idBorrar = idBorrar;
    // Crea el modal
    this.modal.titulo = 'borrarUsuarioT';
    this.modal.subtitulo = 'borrarUsuarioST';
    this.modal.eliminar = true;
    this.modal.visible = true;
  }

  cerrarModal(event: boolean) {
    this.modal.visible = false;
    if (event) {
      let parametros = '?id=' + this.idBorrar;
      this.servidor.deleteObject(URLS.USUARIOS, parametros).subscribe(
        response => {
          if (response.success) {
            let usuarioBorrar = this.usuarios.find(usuario => usuario.id == this.idBorrar);
            let indice = this.usuarios.indexOf(usuarioBorrar);
            this.usuarios.splice(indice, 1);
            this.usuarios = this.usuarios.slice();
            this.setAlerta('alertas.saveOk','success','alertas.tituloAlertaInfo');
          }else{
            this.setAlerta('alertas.saveNotOk','error','alertas.tituloAlertaInfo');
          }
      },
      (error)=>{
        this.setAlerta('alertas.saveNotOk','error','alertas.tituloAlertaInfo');
      });
    }
  }


  onEdit(evento){
    this.itemEdited(evento.data.id);
    }
    itemEdited(idUsuario: number) {
    this.guardar[idUsuario] = true;
    if (!this.alertaGuardar['guardar']){
      this.alertaGuardar['guardar'] = true;
      this.setAlerta('alertas.guardar','warn','alertas.tituloAlertaInfo');
      }
  }

  setAlerta(concept:string,tipo:string,titulo:string, extraInfo?:string){
    let concepto;
    let sumary;
    this.translate.get(concept).subscribe((valor)=>concepto=valor)  
    this.translate.get(titulo).subscribe((valor)=>sumary=valor)  
    
    this.messageService.clear();this.messageService.add(
      {severity:tipo,//success | info | warn | error  
      summary:sumary, 
      detail: concepto + ' ' + extraInfo
      }
    );
  }

  saveItem(idUsuario: number) {
    let modUsuario = this.usuarios.find(usuario => usuario.id == idUsuario);
    let parametros = '?id=' + idUsuario;        
    this.servidor.putObject(URLS.USUARIOS, parametros, modUsuario).subscribe(
      response => {
        if (response.success =="true") {
          console.log('User updated');
          this.guardar[idUsuario] = false;
          this.alertaGuardar['guardar'] = false;
          this.usuarios = this.usuarios.slice();
          this.setAlerta('alertas.saveOk','success','alertas.tituloAlertaInfo');
        }else{
          this.setAlerta('alertas.saveNotOk','error','alertas.tituloAlertaInfo');
        }
    },
    (error)=>{
      this.setAlerta('alertas.saveNotOk','error','alertas.tituloAlertaInfo');
    });
  }

  ordenar() {
    console.log('ORDENANDO')
    this.procesando = true;
    this.alertaGuardar['ordenar'] = false;
    this.usuarios.forEach((item) => {
      this.saveItem(item.id);
    });
    this.usuarios = this.usuarios.slice();
    this.procesando = false;
  }
  
  editOrden(){
    if (!this.alertaGuardar['ordenar']){
      this.alertaGuardar['ordenar'] = true;
      this.setAlerta('alertas.nuevoOrden','info','alertas.tituloAlertaInfo');
      }
  }
}
