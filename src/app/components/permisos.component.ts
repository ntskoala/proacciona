import { Component } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { EmpresasService } from '../services/empresas.service';
import { Servidor } from '../services/servidor.service';
import { URLS } from '../models/urls';
import { Usuario } from '../models/usuario';
import { Control } from '../models/control';
import { Checklist } from '../models/checklist';
import { PermissionUserControl } from '../models/permissionusercontrol';
import { PermissionUserChecklist } from '../models/permissionuserchecklist';

@Component({
  selector: 'tab-permisos',
  templateUrl: '../assets/html/permisos.component.html'
})
export class PermisosComponent {

  public subscription: Subscription;
  public usuario: Usuario = new Usuario(0, 'Seleccionar', '', '', '', 0)
  public usuarios: Usuario[] = [];
  public controles: Control[] = [];
  public checklists: Checklist[] = [];
  public permissionusercontrols: PermissionUserControl[] = [];
  public permissionuserchecklists: PermissionUserChecklist[] = [];
  public usuarioSeleccionado: number = 0;

  public checkControl: number | boolean[] = [];
  public checkChecklist: number | boolean[] = [];

  constructor(public servidor: Servidor, public empresasService: EmpresasService) {
    this.subscription = this.empresasService.empresaSeleccionada.subscribe(
      seleccionada => {
        this.seleccionarPermisos()
      },
      error => console.log("Error permisos",error)
    );
  }

  seleccionarPermisos() {
    this.usuarioSeleccionado = 0;
    let parametros = '&idempresa=' + this.empresasService.seleccionada;
    this.servidor.getObjects(URLS.USUARIOS, parametros).subscribe(
      response => {
        this.usuarios = [];
        this.usuarios.push(this.usuario);
        if (response.success && response.data) {
          for (let element of response.data) {
            this.usuarios.push(new Usuario(element.id, element.usuario, element.password,
              element.tipouser, element.nombre, element.idempresa));
          }
        }
    },
    error => console.log("error getting usuarios en permisos",error));
    // conseguir controles
    this.servidor.getObjects(URLS.CONTROLES, parametros).subscribe(
      response => {
        this.controles = [];
        if (response.success && response.data) {
          for (let element of response.data) {
            this.controles.push(new Control(element.id, element.nombre, element.pla, element.valorminimo,
              element.valormaximo, element.objetivo, element.tolerancia, element.critico,
              element.periodicidad, element.tipoperiodo, element.idempresa));
          }
        }
    });
    // conseguir checklists
    this.servidor.getObjects(URLS.CHECKLISTS, parametros).subscribe(
      response => {
        this.checklists = [];
        if (response.success && response.data) {
          for (let element of response.data) {
            this.checklists.push(new Checklist(element.id, element.idempresa, element.nombrechecklist,
              element.periodicidad, element.tipoperiodo));
          }
        }
    });
  }

  seleccionarUsuario(idUsuario: number) {
    this.usuarioSeleccionado = idUsuario;
    this.checkControl = [];
    this.checkChecklist = [];
    let parametros = '&idusuario=' + idUsuario;
    // conseguir permissionusercontrol
    this.servidor.getObjects(URLS.PERMISSION_USER_CONTROL, parametros).subscribe(
      response => {
        this.permissionusercontrols = [];
        if (response.success && response.data) {
          for (let element of response.data) {
            this.checkControl[element.idcontrol] = parseInt(element.id);
          }
        }
    });
    // conseguir permissionuserchecklist
    this.servidor.getObjects(URLS.PERMISSION_USER_CHECKLIST, parametros).subscribe(
      response => {
        this.permissionuserchecklists = [];
        if (response.success && response.data) {
          for (let element of response.data) {
            this.checkChecklist[element.idchecklist] = parseInt(element.id);
          }
        }
    });

  }

  changeControl(idControl: number) {
    let parametros = '?id=' + this.checkControl[idControl];
    if (this.checkControl[idControl]) {
      this.checkControl[idControl] = false;
      this.servidor.deleteObject(URLS.PERMISSION_USER_CONTROL, parametros).subscribe(
        response => {
          if (response.success) {
            console.log('Permiso deleted')
          }
      });
    }
    else {
      let nuevoPermiso = new PermissionUserControl(0, idControl, this.usuarioSeleccionado);
      this.servidor.postObject(URLS.PERMISSION_USER_CONTROL, nuevoPermiso).subscribe(
        response => {
          if (response.success) {
            this.checkControl[idControl] = response.id;
          }
      });
    }
  }

  changeChecklist(idChecklist: number) {
    let parametros = '?id=' + this.checkChecklist[idChecklist];
    if (this.checkChecklist[idChecklist]) {
      this.checkChecklist[idChecklist] = false;
      this.servidor.deleteObject(URLS.PERMISSION_USER_CHECKLIST, parametros).subscribe(
        response => {
          if (response.success) {
            console.log('Permiso deleted')
          }
      });
    }
    else {
      let nuevoPermiso = new PermissionUserChecklist(0, idChecklist, this.usuarioSeleccionado);
      this.servidor.postObject(URLS.PERMISSION_USER_CHECKLIST, nuevoPermiso).subscribe(
        response => {
          if (response.success) {
            this.checkChecklist[idChecklist] = response.id;
          }
      });
    }
  }

}
