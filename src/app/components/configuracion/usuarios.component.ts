import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

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
  nuevoUsuario: Object = {tipouser: 'Operario'};
  idBorrar: number;
  modal: Modal = new Modal();
  public tipos:object[]=[{label:'Operario', value:'Operario'},{label:'Gerente', value:'Gerente'},{label:'Mantenimiento', value:'Mantenimiento'}];
  
  constructor(public servidor: Servidor, public empresasService: EmpresasService) {}

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
  }

  setEmpresa(emp: Empresa | string) {
    let params = typeof(emp) == "string" ? emp : emp.id
    let parametros = '&idempresa=' + params;
    // llamada al servidor para conseguir los usuarios
    this.servidor.getObjects(URLS.USUARIOS, parametros).subscribe(
      response => {
        this.usuarios = [];
        if (response.success && response.data) {
          for (let element of response.data) {
            this.usuarios.push(new Usuario(element.id, element.usuario, element.password,
              element.tipouser, element.email, element.idempresa));
            this.guardar[element.id] = false;
          }
        }
    });
    
  }

  crearUsuario(usuario) {
    let usuarioCrear = new Usuario(0, usuario.usuario, usuario.password,
      usuario.tipouser, usuario.email, this.empresasService.seleccionada);
    this.servidor.postObject(URLS.USUARIOS, usuarioCrear).subscribe(
      response => {
        if (response.success == "true") {
          usuarioCrear.id = response.id;
          this.usuarios.push(usuarioCrear);
        }
        else{
          alert(response.error);
        }
    });
    // limpiar form
    this.nuevoUsuario = {usuario: '', password: '', tipouser: 'Operario'}  
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
          }
      });
    }
  }

  onEdit(evento){
    this.itemEdited(evento.data.id);
    }
    itemEdited(idUsuario: number) {
    this.guardar[idUsuario] = true;
  }

  actualizarUsuario(idUsuario: number) {
    this.guardar[idUsuario] = false;
    let modUsuario = this.usuarios.find(usuario => usuario.id == idUsuario);
    let parametros = '?id=' + idUsuario;        
    this.servidor.putObject(URLS.USUARIOS, parametros, modUsuario).subscribe(
      response => {
        if (response.success =="true") {
          console.log('User updated');
        }else{
          alert(response.error);
        }
    });
  }

}
