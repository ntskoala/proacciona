import { Component, OnInit, Input, Output, EventEmitter  } from '@angular/core';


import { EmpresasService } from '../../services/empresas.service';
import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { Usuario } from '../../models/usuario';
import { PermissionUserPlan } from '../../models/permissionuserplan';
import { PermissionUserLimpieza } from '../../models/permissionuserlimpieza';

@Component({
  selector: 'app-permisos',
  templateUrl: './permisos.component.html',
  styleUrls: ['./permisos.component.css']
})
export class PermisosComponent implements OnInit {
@Input() limpieza: number;
@Input() supervisor: number;
@Output() onPermisos:EventEmitter<number> =new EventEmitter<number>();
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

}
