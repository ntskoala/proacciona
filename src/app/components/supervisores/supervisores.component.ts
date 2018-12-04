import { Component, OnInit,OnChanges, Input, Output, EventEmitter  } from '@angular/core';
import {Observable} from 'rxjs/Observable';


import { EmpresasService } from '../../services/empresas.service';
import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { Usuario } from '../../models/usuario';

export class Supervisor{
  constructor(
    public id: number,
    public supervisor: number
  ) {}
}


@Component({
  selector: 'app-supervisores',
  templateUrl: './supervisores.component.html',
  styleUrls: ['./supervisores.component.css']
})
export class SupervisoresComponent implements OnInit, OnChanges {
@Input() items;

@Input() tipoControl;
@Output() onPermisos:EventEmitter<number> =new EventEmitter<number>();

public usuarios: Usuario[] = [];
//public controles: Control[];
public supervisores: Supervisor[] = [];
public permiso: Supervisor;
public haypermiso: number[]=[];
public tabla: object[];
public cols: object[];
public cargaData: boolean[]=[false,false];
public procesando:boolean=false;
public entidad:string="&entidad=";
public field:string="&field=";
public idItem:number;
public ancho:string;

  constructor(public servidor: Servidor,public empresasService: EmpresasService) { }

  ngOnInit() {
  }
  ngOnChanges(){
   
      this.procesando=true;
    let num = (this.items.length * 45)
    this.ancho = num + 'px';
    
        switch(this.tipoControl){
      case "planes":
      this.entidad="&entidad=planificaciones";
      this.field = "&field=idempresa&idItem="+this.empresasService.seleccionada;
      break;
      case "limpiezas":
      if (this.items.length>=1){
      this.entidad="&entidad=limpieza_elemento";
      this.field = "&field=idlimpiezazona&idItem="+this.items[0].idlimpiezazona;
    }
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
    this.getSupervisiones().then(
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
              this.haypermiso.push(this.supervisores.findIndex((supervisor)=>supervisor.supervisor ==element.id));
          }
          resolve('usuarios')
        }
    });
  });
}


getSupervisiones(){
      console.log('##########getSupervisiones########')
      if (this.items.length>=1){
      this.idItem = this.items[0].idlimpiezazona;
      }
      return new Promise((resolve, reject) => {
      //let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad; 
      let parametros = '&idempresa=' + this.empresasService.seleccionada +this.entidad + this.field; 

        //this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
        this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
          
          response => {
            this.supervisores = [];
            if (response.success && response.data) {
              for (let element of response.data) { 
                console.log(element);
                  this.supervisores.push(new Supervisor(element.id,element.supervisor));
                  console.log("permisos",this.supervisores);
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

mergeData(){
  this.tabla=[];
  this.cols=[];
  this.cols.push({field:'user',header:'Usuario'});
  this.items.forEach(control => {
  this.cols.push({field:control.nombre,header:control.nombre})
  });

  this.usuarios.forEach(user=>{
    let generalSwitch = true;
    let row= '{"user":"'+user.usuario+'","iduser":"'+user.id+'"'
  this.items.forEach(control => {
   let valor = this.supervisores.findIndex((supervisor)=>supervisor.supervisor == user.id && supervisor.id == control.id);
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
      let index = this.supervisores.findIndex((supervisor)=> supervisor.supervisor == user && supervisor.id == control.id);
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
      let plan = new Supervisor(idControl,user)


      let parametros = '?idempresa=' + this.empresasService.seleccionada+this.entidad+"&id="+plan.id; 
        this.servidor.putObject(URLS.STD_ITEM,parametros,plan).subscribe(
          response => {
            if (response.success) {
            //this.permisos.push(new Permiso(response.id,permiso.idplan,permiso.idusuario,permiso.idempresa));
            let indexSupervisores = this.supervisores.findIndex((supervision)=>supervision.id==idControl);
            this.supervisores[indexSupervisores].supervisor = user; 
            let index = this.tabla.findIndex((usuario)=>usuario['iduser'] == user);
            let nombre = this.items[this.items.findIndex((control)=>control.id==idControl)].nombre;
            this.tabla[index][nombre]= true;     
            this.swithTheOthers(user,idControl); 
             // console.log("permisos",permiso);
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
      let plan = new Supervisor(idControl,0)


      let parametros = '?idempresa=' + this.empresasService.seleccionada+this.entidad+"&id="+plan.id; 
        this.servidor.putObject(URLS.STD_ITEM,parametros,plan).subscribe(
          response => {
            if (response.success) {
            //this.permisos.push(new Permiso(response.id,permiso.idplan,permiso.idusuario,permiso.idempresa));  
            let indexSupervisores = this.supervisores.findIndex((supervision)=>supervision.id==idControl);
            this.supervisores[indexSupervisores].supervisor = 0; 
            let index = this.tabla.findIndex((usuario)=>usuario['iduser'] == user);
            let nombre = this.items[this.items.findIndex((control)=>control.id==idControl)].nombre;
            this.tabla[index][nombre]= true;        
             // console.log("permisos",permiso);
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

swithTheOthers(user,idControl){
  let x=0;
  let nombreControl = this.items[this.items.findIndex((control)=>control.id==idControl)].nombre;
this.usuarios.forEach(usuario =>{
  if (usuario.id != user){
    this.tabla[x][nombreControl]=false;
    this.tabla[x]['generalSwitch']=false;
  }
x++;
});
}
//****** */
}
