import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Servidor } from '../../../services/servidor.service';
import { URLS } from '../../../models/urls';
import { Usuario } from '../../../models/usuario';
import { PermissionUserLimpieza } from '../../../models/permissionuserlimpieza';
import { EmpresasService } from '../../../services/empresas.service';

@Component({
  selector: 'app-permisos-limpieza',
  templateUrl: './permisos-limpieza.component.html',
  styleUrls: ['./permisos-limpieza.component.css']
})
export class PermisosLimpiezaComponent implements OnInit {
@Input() limpieza: number;
@Input() supervisor: number;
@Output() setSupervisor:EventEmitter<number> =new EventEmitter<number>();
public viewPermisos: boolean = false;
public usuarios: Usuario[] = [];
public permisos: PermissionUserLimpieza[] = [];
public haypermiso: number[]=[];
public entidad:string="&entidad=permissionlimpieza";
public field:string="&field=idelementolimpieza&idItem=";
  constructor(public servidor: Servidor,public empresasService: EmpresasService) { }

  ngOnInit() {
    if(this.limpieza){
      this.getPermisos().then(
      (resultado) =>{
        console.log("ltadoresu",resultado);
        if (resultado){
          this.getUsuarios();
        }
      }
    );
    }else{
      this.permisos.push(new PermissionUserLimpieza(null,this.supervisor,null));
      this.getUsuarios();
    
    }
  }

getUsuarios(){
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
        }
    });
}

getPermisos(){
      console.log('##########getPERMISOS########')
      return new Promise((resolve, reject) => {
      let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+this.field+this.limpieza; 
        this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
          response => {
            this.permisos = [];
            if (response.success && response.data) {
              for (let element of response.data) { 
                console.log(element);
                  this.permisos.push(new PermissionUserLimpieza(element.id,element.idusuario,element.idelementolimpieza));
                  console.log("permisos",this.permisos);
             }
             
            }
        },
        error=>{
          resolve(error);
          console.log(error)
        },
        ()=>{  resolve(true);    
        }

        );
      }
      );
}

verPermisos(){
  this.viewPermisos = !this.viewPermisos;
}


cambiaEstadoPermiso(usuario:Usuario,i:number){
  console.log(usuario,this.limpieza)
if (this.limpieza){
  this.guardaEstadoPermiso(usuario,i);  
}else{
  this.setSupervision(usuario,i);
}
}

guardaEstadoPermiso(usuario:Usuario,i:number){
    console.log(this.haypermiso)
   // let indice = this.permisos.findIndex((permiso) => permiso.idusuario == usuario.id);
   // console.log("indice:",indice,this.permisos[indice])
   let nuevoPermiso = new PermissionUserLimpieza(null,usuario.id,this.limpieza);
     let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad;
     if (this.haypermiso[i]<0){
    this.servidor.postObject(URLS.PERMISSION_USER_LIMPIEZA,nuevoPermiso,parametros).subscribe(
      response => {
        if (response.success) {
          this.permisos.push(new PermissionUserLimpieza(response.id,usuario.id,this.limpieza));
          this.haypermiso[i]=this.permisos.length -1
        }
    });
     }else{
       let indice = this.permisos.findIndex((permiso) => permiso.idusuario == usuario.id);
       console.log("indice:",indice,this.permisos[indice],this.permisos)
       parametros = '?id=' + this.permisos[indice].id+this.entidad;
      this.servidor.deleteObject(URLS.PERMISSION_USER_LIMPIEZA, parametros).subscribe(
        response => {
          if (response.success) {
            this.permisos.splice(indice,1);
            this.haypermiso[i]=-1;
          }
      });
     }
}

setSupervision(usuario:Usuario,i:number){
console.log(usuario.id);
this.permisos=[];
this.haypermiso = this.haypermiso.map((element)=>element=-1);
this.permisos.push(new PermissionUserLimpieza(null,usuario.id,null));
this.haypermiso[i]=this.permisos.length -1
this.setSupervisor.emit(usuario.id);
}

}
