import { Component, OnInit, Input, Output, EventEmitter  } from '@angular/core';
import {Observable} from 'rxjs/Observable';


import { EmpresasService } from '../../services/empresas.service';
import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { Usuario } from '../../models/usuario';
import { PermissionUserPlan } from '../../models/permissionuserplan';
import { PermissionUserLimpieza } from '../../models/permissionuserlimpieza';
import { PermissionUserControl } from '../../models/permissionusercontrol';
import { PermissionUserChecklist } from '../../models/permissionuserchecklist';

export class Permiso{
  constructor(
    public id: number,
    public idplan: number,
    public idusuario: number,
    public idempresa: number
  ) {}
}
export class Control{
  constructor(
    public id: number,
    public nombre: string,
    public idfamilia: number,
    public familia: string
  ) {}
}
@Component({
  selector: 'app-permisos',
  templateUrl: './permisos.component.html',
  styleUrls: ['./permisos.component.css']
})
export class PermisosGeneralComponent implements OnInit {
//@Input() limpieza: number;
//@Input() supervisor: number;
@Input() items;
@Input() tipoControl;
@Output() onPermisos:EventEmitter<number> =new EventEmitter<number>();
//public observer: Observable<string>;

public viewPermisos: boolean = false;
public usuarios: Usuario[] = [];
//public controles: Control[];
public permisos: Permiso[] = [];
public permiso: Permiso;
public haypermiso: number[]=[];
public tabla: object[];
public cols: object[];
public procesando:boolean=true;
public cargaData: boolean[]=[false,false];
public entidad:string="&entidad=permissionlimpieza";
public field:string="&field=idelementolimpieza&idItem=";
  constructor(public servidor: Servidor,public empresasService: EmpresasService) { }

  ngOnInit() {

    switch(this.tipoControl){
      case "planes":
      this.entidad="&entidad=permissionplanificaciones";
      break;
      case "limpiezas":
      this.entidad="&entidad=permissionlimpieza";
      break;

      case "conroles":

      break;
      case "checklists":
      break;
    }

       this.carga().subscribe(
         (valor)=>{
                 switch(valor){
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
                if (this.cargaData = [true,true]){
                  this.mergeData();
                }
         }
       )
  }

carga(){
return new Observable<string>((valor)=>{
    this.getUsuarios().then(
      (resultado)=>{
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
      (resultado)=>{
        if (resultado == 'permisos') {
          valor.next('permisos');
        }
      }
    );
})
}

getUsuarios(){
  return new Promise((resolve, reject) => {
    let parametros = '&idempresa=' + this.empresasService.seleccionada;
    this.servidor.getObjects(URLS.USUARIOS, parametros).subscribe(
      response => {
        this.usuarios = [];
        this.haypermiso = [];
        if (response.success && response.data) {
          for (let element of response.data) {
            this.usuarios.push(new Usuario(element.id, element.usuario, element.password,
              element.tipouser, element.email, element.idempresa));
              this.haypermiso.push(this.permisos.findIndex((permiso)=>permiso.idusuario ==element.id));
          }
          resolve('usuarios')
        }
    });
  });
}


getPermisos(){
      console.log('##########getPERMISOS########')
    
      return new Promise((resolve, reject) => {
      let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad; 
        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            this.permisos = [];
            if (response.success && response.data) {
              for (let element of response.data) { 
                console.log(element);
                  this.permisos.push(new Permiso(element.id,element.idplan,element.idusuario,element.idempresa));
                  console.log("permisos",this.permisos);
             }
             resolve('permisos');   
            }
        },
        error=>{
          resolve(error);
          console.log(error)
        },
        ()=>{   
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

mergeData(){
  this.tabla=[];
  this.cols=[];
  this.cols.push({field:'user',header:'usuario'});
  this.items.forEach(control => {
  this.cols.push({field:control.nombre,header:control.nombre})
  });

  this.usuarios.forEach(user=>{
    let generalSwitch = true;
    let row= '{"user":"'+user.usuario+'","iduser":"'+user.id+'"'
  this.items.forEach(control => {
   let valor = this.permisos.findIndex((permiso)=>permiso.idusuario == user.id && permiso.idplan == control.id);
   let check:boolean;
   if (valor<0){
     check=false;
     generalSwitch = false;
    }else{
      check=true
    };
  row += ',"'+control.nombre+'":'+check+''
  });
row += ',"generalSwitch":'+generalSwitch+'}';
  this.tabla.push(JSON.parse(row))

  })
  this.procesando=false;
}
setPermiso(user,event,col?){
  this.procesando=true;
  if (col){
  let index = this.items.findIndex((control)=>control.nombre==col)
  if (index >= 0){
  let idControl = this.items[index].id;
  console.log(user,col,idControl, event)
  if (event){
    this.addPermiso(user,idControl).then(
      (valor)=>{
        console.log(valor)
        this.switchGeneral(user)
        this.procesando = false;
      }
    )
  }else{
    this.deletePermiso(user,idControl).then(
      (response)=>{
        this.switchGeneral(user)
        this.procesando = false;
      }
    )
  }
  }
  }else{
      this.items.forEach(control => {
      let index = this.permisos.findIndex((permiso)=> permiso.idusuario == user && permiso.idplan == control.id);
      if (event){
      if (index == -1){
        this.addPermiso(user,control['id']).then(
          (response)=>{
        this.switch(user,control['id'],true);
        });
      }
       }else{
        if (index >= 0){
          this.deletePermiso(user,control['id']).then(
            ()=>{
        this.switch(user,control['id'],false);
            }
          )
       }
       }
      });
      setTimeout(()=>{
        this.procesando=false;
      },900);
  } 
}

addPermiso(user,idControl){
      return new Promise((resolve, reject) => {
      let permiso = new Permiso(null,idControl,user,this.empresasService.seleccionada)


      let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad; 
        this.servidor.postObject(URLS.STD_ITEM, permiso,parametros).subscribe(
          response => {
            if (response.success) {
            this.permisos.push(new Permiso(response.id,permiso.idplan,permiso.idusuario,permiso.idempresa));  
            let index = this.tabla.findIndex((usuario)=>usuario['iduser'] == user);    
            let nombre = this.items[this.items.findIndex((control)=>control.id==idControl)].nombre;
            this.tabla[index][nombre]= true;        
              console.log("permisos",permiso);
             resolve('permisos ok');
            }else{
              console.log('no se asigno elpermiso', response)
            }
        },
        error=>{
          resolve(error);
          console.log(error)
        },
        ()=>{   
        }
        );
      }
      );
}

deletePermiso(user,idControl){
return new Promise((resolve, reject) => {
    let valor = this.permisos.findIndex((permiso)=>permiso.idusuario == user && permiso.idplan == idControl);
    let idPermiso = this.permisos[valor].id;
      let parametros = '?id=' + idPermiso+this.entidad;
      this.servidor.deleteObject(URLS.STD_ITEM, parametros).subscribe(
        response => {
          if (response.success) {
             let indice = this.permisos.findIndex((permiso) => permiso.id == idPermiso);
             this.permisos.splice(indice, 1);
            let index = this.tabla.findIndex((usuario)=>usuario['iduser'] == user);    
            let nombre = this.items[this.items.findIndex((control)=>control.id==idControl)].nombre;
            this.tabla[index][nombre]= false; 
            resolve('permisos ok');

          }else{
            console.log('no se cancelo elpermiso', response)
            resolve('error');
          }
      });
});
}

switch(user,idControl,estado){
  console.log(user,idControl,estado)
let nombreControl = this.items[this.items.findIndex((control)=>control.id==idControl)].nombre;
let index = this.tabla.findIndex((usuario)=>usuario['iduser'] == user);
console.log(nombreControl,index)
this.tabla[index][nombreControl]=estado;
}
switchGeneral(user){
let index = this.tabla.findIndex((usuario)=>usuario['iduser'] == user);
let generalSwitch= true;
this.items.forEach(control => {
  console.log(control.nombre,this.tabla[index][control.nombre])
   if (this.tabla[index][control.nombre]==false) generalSwitch = false;
});
  console.log(this.tabla[index]['generalSwitch'],index,generalSwitch)
 this.tabla[index]['generalSwitch']=generalSwitch; 
}
}
