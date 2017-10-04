import { Component, OnInit, Input, Output, EventEmitter  } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {MdSnackBar} from '@angular/material';

import { EmpresasService } from '../../services/empresas.service';
import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { Usuario } from '../../models/usuario';
import { Alerta } from '../../models/alertas';



@Component({
  selector: 'app-alertas',
  templateUrl: './alertas.component.html',
  styleUrls: ['./alertas.component.css']
})
export class AlertasComponent implements OnInit {
//@Input() items;
@Input() tipoControl;
@Output() onAlertas:EventEmitter<number> =new EventEmitter<number>();


public items: string[]=[];
public viewPermisos: boolean = false;
public usuarios: Usuario[] = [];
//public controles: Control[];
public alertas: Alerta[] = [];
public usuariosAlertas:any[]=[];
public alerta: Alerta;
public hayalerta: boolean;
public tabla: object[];
public cols: object[];
public procesando:boolean=true;
public cargaData: boolean[]=[false,false];
public entidad:string="&entidad=alertas";
//public field:string="&field=idelementolimpieza&idItem=";

  constructor(public servidor: Servidor,public empresasService: EmpresasService, public snack: MdSnackBar) { }

  ngOnInit() {
    this.items = ['Planificaciones'];
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

this.inicializa();
  }

inicializa(){
       this.carga().subscribe(
         (valor)=>{
                 switch(valor){
                  case "usuarios":
                    this.cargaData[0] = true;
                    break;
                  // case "controles":
                  // this.cargaData[1] = true;
                  // break;
                  case "alertas":
                  this.cargaData[1] = true;
                  break
                }
                console.log('1',this.cargaData)
                if (this.cargaData[0] && this.cargaData[1]){
                  console.log('e',this.cargaData)
                  this.mergeData();
                }else{
                  console.log('a',this.cargaData)
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
    this.getAlertas().then(
      (resultado)=>{
        if (resultado == 'alertas') {
          valor.next('alertas');
        }
        if (resultado == 'no hay alertas') {
          valor.next('no hay alertas');
          this.procesando=false;
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
        //this.hayalerta = [];
        if (response.success && response.data) {
          for (let element of response.data) {
            this.usuarios.push(new Usuario(element.id, element.usuario, element.password,
              element.tipouser, element.email, element.idempresa));
              //this.hayalerta.push(this.alertas.findIndex((alerta)=>alerta.idusuario ==element.id));
          }
          resolve('usuarios')
        }
    });
  });
}



getAlertas(){
      console.log('##########getPERMISOS########')
    
      return new Promise((resolve, reject) => {
      let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad; 
        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            this.alertas = [];
            this.usuariosAlertas = [];
            if (response.success && response.data) {
               if (response.data.length > 0) {
                 this.hayalerta=true;
              for (let element of response.data) { 
                console.log(element);
                  this.alertas.push(new Alerta(element.id,element.idempresa,element.modulo,element.tiempo_alerta,element.usuarios));
                  if (element.usuarios){
                  this.usuariosAlertas.push(JSON.parse(element.usuarios));
                  }else{
                    this.usuariosAlertas.push([]);
                  }
                  console.log("alertas",this.alertas);
             }
             resolve('alertas');   
            }else{
              resolve('no hay alertas');
              this.hayalerta=false;
            }
            }else{
              resolve('no hay alertas');
              this.hayalerta=false;
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



mergeData(){
  console.log('Inicio merge');
  this.tabla=[];
  this.cols=[];
  this.cols.push({field:'user',header:'Usuario'});
  this.items.forEach(modulo => {
  this.cols.push({field:modulo,header:modulo})
  });

  this.usuarios.forEach(user=>{
    let generalSwitch = true;
    let row= '{"user":"'+user.usuario+'","iduser":"'+user.id+'"'
  this.items.forEach(modulo => {
   let indice = this.alertas.findIndex((alerta)=> alerta.modulo == modulo);
   console.log('#####ALERTA:',indice,user,modulo,this.alertas,this.usuariosAlertas);
    let valor = this.usuariosAlertas[indice].indexOf(user.id);
   let check:boolean;
   if (valor<0){
     check=false;
     generalSwitch = false;
    }else{
      check=true
    };
  row += ',"'+modulo+'":'+check+''
  });
row += ',"generalSwitch":'+generalSwitch+'}';
  this.tabla.push(JSON.parse(row))

  })
  this.procesando=false;
}
setPermiso(user,event,col?){
  console.log('###',col,this.items);
  this.procesando=true;
  if (user==0){
    let modulo = col;
    let index = this.alertas.findIndex((alerta)=> alerta.modulo == modulo);
        this.saveAlerta(this.alertas[index]).then(
          (valor)=>{
            if (valor == 'ok'){
              console.log('ok')
              this.procesando=false;
            }else{
              console.log(valor);
              this.procesando=false;
            }
          }
        );
  }else{
  if (col){
  let modulo = this.items[col];
  console.log(user,col,modulo, event)
  if (event){
    this.addPermiso(user,col).then(
      (valor)=>{
        console.log(valor)
        //this.switchGeneral(user)
        this.procesando = false;
      }
    )
  }else{
    this.deletePermiso(user,col).then(
      (response)=>{
         console.log(response)
       // this.switchGeneral(user)
        this.procesando = false;
      }
    )
  }
  }
  }
// else{
//       this.items.forEach(control => {
//       let index = this.alertas.findIndex((alerta)=> alerta.idusuario == user && alerta.idplan == control.id);
//       if (event){
//       if (index == -1){
//         this.addPermiso(user,control['id']).then(
//           (response)=>{
//         this.switch(user,control['id'],true);
//         });
//       }
//        }else{
//         if (index >= 0){
//           this.deletePermiso(user,control['id']).then(
//             ()=>{
//         this.switch(user,control['id'],false);
//             }
//           )
//        }
//        }
//       });
//       setTimeout(()=>{
//         this.procesando=false;
//       },900);
//   } 
}

addPermiso(user,modulo){
  console.log('poner Alerta');
       return new Promise((resolve, reject) => {
      // let alerta = new Alerta(null,this.empresasService.seleccionada,idControl,'planificaciones',)
        let index = this.alertas.findIndex((alerta)=> alerta.modulo == modulo);
        if (this.usuariosAlertas[index]){
        let isUser = this.usuariosAlertas[index].indexOf(user);
        if (isUser <0){
          this.usuariosAlertas[index].push(user);
        }
        this.alertas[index].usuarios = JSON.stringify(this.usuariosAlertas[index]);
        this.saveAlerta(this.alertas[index]).then(
          (valor)=>{
            if (valor == 'ok'){
              resolve('ok')
            }else{
              console.log(valor);
              resolve(valor);
            }
          }
        );
        }

      resolve('alertas ok');
       }
       );
}

 deletePermiso(user,modulo){
   console.log('quitar permiso',user,modulo);
 return new Promise((resolve, reject) => {
        let index = this.alertas.findIndex((alerta)=> alerta.modulo == modulo);
        console.log('indice de alertas',index,this.alertas);
        if (this.usuariosAlertas[index]){
        let isUser = this.usuariosAlertas[index].indexOf(user);
        if (isUser >-1){
          this.usuariosAlertas[index].splice(isUser,1);
        }
        this.alertas[index].usuarios = JSON.stringify(this.usuariosAlertas[index]);
        this.saveAlerta(this.alertas[index]).then(
          (valor)=>{
            if (valor == 'ok'){
              console.log('ok');
              resolve('ok')
            }else{
              console.log(valor);
              resolve(valor);
            }
          }
        );
        }
resolve ('alertas ok');
});
 }
saveAlerta(alerta: Alerta){
  console.log('saving alerta',alerta);
  return new Promise((resolve, reject) => {
      let parametros = '?idempresa=' + this.empresasService.seleccionada+this.entidad+'&id=' + alerta.id; 
        this.servidor.putObject(URLS.STD_ITEM,parametros,alerta).subscribe(
          response => {
            if (response.success) {
              console.log("alertas",alerta);
              this.snack.open('ok',null, {duration: 2000});
             resolve('ok');
            }else{
              console.log('no se asigno elpermiso', response)
              resolve(response);
            }
        },
        error=>{
          resolve(error);
          console.log(error)
        },
        ()=>{   
        }
        );
  });

}
addAlerta(modulo){
  return new Promise((resolve, reject) => {
      let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad;
      let alerta = new Alerta(null,this.empresasService.seleccionada,modulo,0,JSON.stringify([]));
        this.servidor.postObject(URLS.STD_ITEM, alerta,parametros).subscribe(
          response => {
            if (response.success) {
            this.alertas.push(new Alerta(response.id,this.empresasService.seleccionada,modulo,0,JSON.stringify([])));  
              this.usuariosAlertas.push([]);
              console.log("alertas",alerta);
             resolve('alertas ok');
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
       });
}
deleteAlerta(modulo){
   
 return new Promise((resolve, reject) => {
    let valor = this.alertas.findIndex((alerta)=>alerta.idempresa == this.empresasService.seleccionada && alerta.modulo == modulo);
    let idAlerta = this.alertas[valor].id;
      let parametros = '?id=' + idAlerta+this.entidad;
      this.servidor.deleteObject(URLS.STD_ITEM, parametros).subscribe(
        response => {
          if (response.success) {
             let indice = this.alertas.findIndex((alerta) => alerta.id == idAlerta);
             this.alertas.splice(indice, 1);
            resolve('alertas ok');

          }else{
            console.log('no se cancelo elpermiso', response)
            resolve('error');
          }
      });
resolve ('alertas ok');
});
}
switchAlerta(event){
console.log(event);
if (event.checked){
this.addAlerta('Planificaciones').then(
  (resultado)=>{
    if (resultado =='alertas ok'){
      console.log('ok, creado->lets call carga');
      this.cargaData[1] = true;
      if (this.cargaData[0]){
       this.mergeData();
      }else{
        this.inicializa();
      }
    }
  }
)
}else{
this.deleteAlerta('Planificaciones').then(
  (resultado)=>{
    if (resultado=='alertas ok'){
      this.cargaData = [false,false];

      console.log('ok, borrado->lets descarga');
    }
  }
)
}
}
// switch(user,idControl,estado){
//   console.log(user,idControl,estado)
// let nombreControl = this.items[this.items.findIndex((control)=>control.id==idControl)].nombre;
// let index = this.tabla.findIndex((usuario)=>usuario['iduser'] == user);
// console.log(nombreControl,index)
// this.tabla[index][nombreControl]=estado;
// }
// switchGeneral(user){
// let index = this.tabla.findIndex((usuario)=>usuario['iduser'] == user);
// let generalSwitch= true;
// this.items.forEach(control => {
//   console.log(control.nombre,this.tabla[index][control.nombre])
//    if (this.tabla[index][control.nombre]==false) generalSwitch = false;
// });
//   console.log(this.tabla[index]['generalSwitch'],index,generalSwitch)
//  this.tabla[index]['generalSwitch']=generalSwitch; 
// }
}
