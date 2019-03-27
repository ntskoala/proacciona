import { Component, OnInit, OnChanges , Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';


import { EmpresasService } from '../../services/empresas.service';
import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { Usuario } from '../../models/usuario';
import { PermissionUserPlan } from '../../models/permissionuserplan';
import { PermissionUserLimpieza } from '../../models/permissionuserlimpieza';
import { PermissionMaquinaria,PermissionCalibracion } from '../../models/permissionmaquinaria';
import { PermissionUserControl } from '../../models/permissionusercontrol';
import { PermissionUserChecklist } from '../../models/permissionuserchecklist';

export class Permiso {
  constructor(
    public id: number,
    public idItem: number,
    public idusuario: number,
    public idempresa: number
  ) { }
}
export class Control {
  constructor(
    public id: number,
    public nombre: string,
    public idfamilia: number,
    public familia: string
  ) { }
}
@Component({
  selector: 'app-permisos',
  templateUrl: './permisos.component.html',
  styleUrls: ['./permisos.component.css']
})
export class PermisosGeneralComponent implements OnInit, OnChanges {
  //@Input() limpieza: number;
  //@Input() supervisor: number;
  @Input() items;
  @Input() tipoControl;
  @Output() onPermisos: EventEmitter<number> = new EventEmitter<number>();
  //public observer: Observable<string>;
  public viewPermisos: boolean = false;
  public usuarios: Usuario[] = [];
  //public controles: Control[];
  public permisos: Permiso[] = [];
  public permiso: Permiso;
  public plan: PermissionUserPlan;
  public limpieza: PermissionUserLimpieza;
  public haypermiso: number[] = [];
  public tabla: object[];
  public cols: object[];
  public procesando: boolean = false;
  public cargaData: boolean[] = [false, false];
  public entidad: string = "&entidad=permissionlimpieza";
  public field: string = "&field=idelementolimpieza&idItem=";
  public ancho:string;
  public correctivos:boolean;
  constructor(public servidor: Servidor, public empresasService: EmpresasService) { }

  ngOnInit() {

  }
    ngOnChanges(){
      if (this.items.length>=1){
      this.procesando=true;
      let num = 100+(this.items.length * 37)
      this.ancho = num + 'px';
      
    switch (this.tipoControl) {
      case "Planificaciones":
        this.entidad = "&entidad=permissionplanificaciones";
        break;
      case "Limpiezas":
        this.entidad = "&entidad=permissionlimpieza";
        break;
        case "maquinas.mantenimientos":
        this.entidad = "&entidad=permissionMaquinaria";
        break;
        case "maquinas.calibracion":
        this.entidad = "&entidad=permissionCalibracion";
        break;
      case "conroles":

        break;
      case "checklists":
        break;
    }

    this.carga().subscribe(
      (valor) => {
        switch (valor) {
          case "usuarios":
            this.cargaData[0] = true;
            break;
          // case "controles":
          // this.cargaData[1] = true;
          // break;
          case "permisos":
            this.cargaData[1] = true;
            break
        }
        if (this.cargaData = [true, true]) {
          this.mergeData();
        }
      }
    )
  }
  }

  carga() {
    return new Observable<string>((valor) => {
      this.getUsuarios().then(
        (resultado) => {
          if (resultado == 'usuarios') {
            valor.next('usuarios');
          }
        }
      );
      // this.getControles('planificaciones').then(
      //   (resultado)=>{
      //     if (resultado == 'controles') {
      //       valor.next('controles');
      //     }
      //   }
      // );
      this.getPermisos().then(
        (resultado) => {
          if (resultado == 'permisos') {
            valor.next('permisos');
          }
        }
      );
    })
  }

  getUsuarios() {
    return new Promise((resolve, reject) => {
      let parametros = '&idempresa=' + this.empresasService.seleccionada;
      this.servidor.getObjects(URLS.USUARIOS, parametros).subscribe(
        response => {
          this.usuarios = [];
          this.haypermiso = [];
          if (response.success && response.data) {
            for (let element of response.data) {
              this.usuarios.push(new Usuario(element.id, element.usuario, element.password,
                element.tipouser, element.email, element.idempresa,element.orden,parseInt(element.superuser)));
              this.haypermiso.push(this.permisos.findIndex((permiso) => permiso.idusuario == element.id));
            }
            resolve('usuarios')
          }
        });
    });
  }


  getPermisos() {
    console.log('##########getPERMISOS########')

    return new Promise((resolve, reject) => {
      let parametros = '&idempresa=' + this.empresasService.seleccionada + this.entidad;
      this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
        response => {
          this.permisos = [];
          if (response.success && response.data) {
            for (let element of response.data) {
             // console.log(element);
              let idItem;
              switch (this.tipoControl) {
                case "Planificaciones":
                  idItem = element.idplan;
                  break;
                case "Limpiezas":
                  idItem = element.idelementolimpieza;
                  break;
                case "maquinas.mantenimientos":
                  idItem = element.idmantenimiento;
                  break;
                case "maquinas.calibracion":
                  idItem = element.idcalibracion;
                  break;
                case "conroles":

                  break;
                case "checklists":
                  break;
              }
              this.permisos.push(new Permiso(element.id, idItem, element.idusuario, element.idempresa));
              console.log("permisos", this.permisos);
            }
            resolve('permisos');
          }
        },
        error => {
          resolve(error);
          console.log(error)
        },
        () => {
        }

      );
    }
    );
  }


  // getControles(entidad:string){
  //   return new Promise((resolve, reject) => {
  // entidad = 'planificaciones'
  //     let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad="+entidad+"&order=nombre";

  //         this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
  //           response => {
  //             this.controles = [];
  //             if (response.success == 'true' && response.data) {
  //               for (let element of response.data) {
  //                 this.controles.push(new Control(element.id,element.nombre,element.familia,''));
  //               }
  //               resolve('controles');   
  //             }
  //           },
  //               (error) => {console.log(error);
  //               resolve(error);   },
  //               ()=>{
  //               }
  //         );
  //   });
  // }

  mergeData() {
    this.tabla = [];
    this.cols = [];
    this.cols.push({ field: 'user', header: 'Usuario' });
    if (this.tipoControl=='maquinas.mantenimientos'){
      this.cols.push({ field: 'Correctivos', header: 'Correctivos' });
    }
    this.items.forEach(control => {
      this.cols.push({ field: control.nombre, header: control.nombre })
    });

    this.usuarios.forEach(user => {
      let generalSwitch = true;
      let row = '{"user":"' + user.usuario + '","iduser":"' + user.id + '"'
      if (this.tipoControl=='maquinas.mantenimientos'){
        row += ',"Correctivos":"' + user.superuser + '"'
      }
      this.items.forEach(control => {
        let valor = this.permisos.findIndex((permiso) => permiso.idusuario == user.id && permiso.idItem == control.id);
        let check: boolean;
        if (valor < 0) {
          check = false;
          generalSwitch = false;
        } else {
          check = true
        };
        row += ',"' + control.nombre + '":' + check + ''
      });
      row += ',"generalSwitch":' + generalSwitch + '}';
      this.tabla.push(JSON.parse(row))

    })
    this.procesando = false;
  }
  setPermiso(user, event, col?) {

    this.procesando = true;
    if (col) {
      let index = this.items.findIndex((control) => control.nombre == col)
      if (index >= 0) {
        let idControl = this.items[index].id;
        console.log(this.items[index]);
        console.log(user, col, idControl, event)
        if (event) {
          this.addPermiso(user, idControl).then(
            (valor) => {
              console.log(valor)
              this.tabla = this.tabla.slice();
              this.permisos = this.permisos.slice();
              this.switchGeneral(user)
              this.procesando = false;
            }
          )
        } else {
          this.deletePermiso(user, idControl).then(
            (response) => {
              console.log(response);
              this.tabla = this.tabla.slice();
              this.permisos = this.permisos.slice();
              this.switchGeneral(user)
              this.procesando = false;
            }
          )
        }
      }
    } else {
      this.items.forEach(control => {
        let index = this.permisos.findIndex((permiso) => permiso.idusuario == user && permiso.idItem == control.id);
        if (event) {
          if (index == -1) {
            this.addPermiso(user, control['id']).then(
              (response) => {
                this.switch(user, control['id'], true);
              });
          }
        } else {
          if (index >= 0) {
            this.deletePermiso(user, control['id']).then(
              () => {
                this.switch(user, control['id'], false);
              }
            )
          }
        }
      });
      this.tabla = this.tabla.slice();
      this.permisos = this.permisos.slice();
      setTimeout(() => {
        this.procesando = false;
      }, 900);
    }
  }

  addPermiso(user, idControl) {
    return new Promise((resolve, reject) => {
      let permiso;
      switch (this.tipoControl) {
      case "Planificaciones":
        permiso = new PermissionUserPlan(null, idControl, user, this.empresasService.seleccionada);
        break;
      case "Limpiezas":
        permiso = new PermissionUserLimpieza(null,user, idControl, this.empresasService.seleccionada);
        break;
      case "maquinas.mantenimientos":
        permiso = new PermissionMaquinaria(null,user, idControl, this.empresasService.seleccionada);
        break;
        case "maquinas.calibracion":
        permiso = new PermissionCalibracion(null,user, idControl, this.empresasService.seleccionada);
        break;
      case "conroles":
        break;
      case "checklists":
        break;
    }
      //let permiso = new Permiso(null, idControl, user, this.empresasService.seleccionada)
    console.log(this.tipoControl,permiso);

      let parametros = '&idempresa=' + this.empresasService.seleccionada + this.entidad;
      this.servidor.postObject(URLS.STD_ITEM, permiso, parametros).subscribe(
        response => {
          if (response.success) {
            this.permisos.push(new Permiso(response.id, permiso.idItem, permiso.idusuario, permiso.idempresa));
            let index = this.tabla.findIndex((usuario) => usuario['iduser'] == user);
            let nombre = this.items[this.items.findIndex((control) => control.id == idControl)].nombre;
            this.tabla[index][nombre] = true;
            console.log("permisos", permiso);
            resolve('permisos ok');
          } else {
            console.log('no se asigno elpermiso', response)
          }
        },
        error => {
          resolve(error);
          console.log(error)
        },
        () => {
        }
      );
    }
    );
  }



  deletePermiso(user, idControl) {
    return new Promise((resolve, reject) => {
      console.log(this.permisos);
      let valor = this.permisos.findIndex((permiso) => permiso.idusuario == user && permiso.idItem == idControl);
      if (valor>-1){
      let idPermiso = this.permisos[valor].id;
      let parametros = '?id=' + idPermiso + this.entidad;
      this.servidor.deleteObject(URLS.STD_ITEM, parametros).subscribe(
        response => {
          if (response.success) {
            let indice = this.permisos.findIndex((permiso) => permiso.id == idPermiso);
            this.permisos.splice(indice, 1);
            let index = this.tabla.findIndex((usuario) => usuario['iduser'] == user);
            let nombre = this.items[this.items.findIndex((control) => control.id == idControl)].nombre;
            console.log(index,nombre);
            this.tabla[index][nombre] = false;
            resolve('permisos ok');
          } else {
            console.log('no se cancelo elpermiso', response)
            resolve('error');
          }
        });
      }
      resolve('no encontré');
    });
}

setPermisoCorrectivos(iduser,event){
console.log(iduser,event)
let indexUser=this.usuarios.findIndex((usuario)=>usuario.id==iduser);
this.usuarios[indexUser].superuser=event;
console.log(this.usuarios[indexUser]);
let parametros = '?idempresa=' + this.empresasService.seleccionada+'&id='+this.usuarios[indexUser].id;
this.servidor.putObject(URLS.USUARIOS,parametros,this.usuarios[indexUser]).subscribe(
  response => {
    console.log(response);
  });
}

switch(user, idControl, estado) {
    console.log(user, idControl, estado)
    let nombreControl = this.items[this.items.findIndex((control) => control.id == idControl)].nombre;
    let index = this.tabla.findIndex((usuario) => usuario['iduser'] == user);
    console.log(nombreControl, index)
    this.tabla[index][nombreControl] = estado;
  }

  switchGeneral(user) {
    let index = this.tabla.findIndex((usuario) => usuario['iduser'] == user);
    let generalSwitch = true;
    this.items.forEach(control => {
      console.log(control.nombre, this.tabla[index][control.nombre])
      if (this.tabla[index][control.nombre] == false) generalSwitch = false;
    });
    console.log(this.tabla[index]['generalSwitch'], index, generalSwitch)
    this.tabla[index]['generalSwitch'] = generalSwitch;
  }
}
