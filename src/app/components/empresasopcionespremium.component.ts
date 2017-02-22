import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router'
import { Subscription } from 'rxjs/Subscription';


import { EmpresasService } from '../services/empresas.service';
import { PermisosService } from '../services/permisos.service';
import { Servidor } from '../services/servidor.service';
import { Empresa } from '../models/empresa';
import { Opciones } from '../models/opciones';
import { OpcionesEmpresa } from '../models/opcionesempresa';
import { URLS } from '../models/urls';



@Component({
  selector: 'tab-opciones',
  templateUrl: '../assets/html/empresasopcionespremium.component.html'
})

export class OpcionesPremium implements OnInit {
  private subscription: Subscription;
  idEmpresa: number;
  public opciones: Opciones[]=[];
  public opcionesempresa: number[] = [];

 // public opcionespremium: Object[] = [{"nombre":"Exportar informes","value":this.empresasService.empresa.exportar_informes},{"nombre":"Fichas Maquinaria","value":this.empresasService.empresa.fichas_maquinaria}];
  public estados =[{"Exportar informes":false},{"Fichas Maquinaria":true}];
  constructor(private router: Router, private route: ActivatedRoute, private empresasService: EmpresasService, private servidor: Servidor, private permisos: PermisosService) {}
  
  
  ngOnInit() {
    if (this.empresasService.seleccionada > 0) this.setEmpresa(this.empresasService.seleccionada.toString());
    this.subscription = this.empresasService.empresaSeleccionada.subscribe(
      emp => {
        this.setEmpresa(emp);
    });
    if (this.empresasService.administrador == false) {
      this.setEmpresa(this.empresasService.empresaActiva.toString());
    }
  }

  setEmpresa(emp: Empresa | string){
    this.empresasService.setOpciones(false);
    this.getOpciones
    let params = typeof(emp) == "string" ? emp : emp.id;
    this.idEmpresa = typeof(emp) == "string" ? parseInt(emp): emp.id;
    let parametros = '&idempresa=' + params;
       // let parametros = '&idempresa=' + seleccionada.id; 
        this.servidor.getObjects(URLS.OPCIONES, parametros).subscribe(
          response => {
            this.opciones = [];
            if (response.success && response.data) {
              for (let element of response.data) {
                this.opciones.push({"id":element.id,"nombre":element.opcion});
                //this.guardar[element.id] = false;
              }
              this.getOpciones(parametros);
            }
        });
  }

getOpciones(parametros){
       // let parametros = '&idempresa=' + seleccionada.id; 
        this.servidor.getObjects(URLS.OPCIONES_EMPRESA, parametros).subscribe(
          response => {
            this.opcionesempresa = [];
            if (response.success && response.data) {
              for (let element of response.data) {
                this.opcionesempresa[element.idopcion] = parseInt(element.id);
                this.permisos.setOpciones(true,element.opcion);
                //this.guardar[element.id] = false;
              }
            }
        },
        error => {console.log(error)});
}


    actualizarOpcion(opcion: any,i) {
      
    let parametros = '?id=' + this.opcionesempresa[opcion];
    if (this.opcionesempresa[opcion]) {
     
      this.opcionesempresa[opcion] = 0;
      this.servidor.deleteObject(URLS.OPCIONES_EMPRESA, parametros).subscribe(
        response => {
          if (response.success) {
            this.permisos.setOpciones(false,this.opciones[i]);
            console.log("quita",this.opciones[i].nombre)
          }
      });
    }
    else {
      
      let nuevaOpcion = new OpcionesEmpresa(0, opcion, this.idEmpresa);
      this.servidor.postObject(URLS.OPCIONES_EMPRESA, nuevaOpcion).subscribe(
        response => {
          if (response.success) {
            this.opcionesempresa[opcion] = response.id;
            this.permisos.setOpciones(true,this.opciones[i]);
            console.log("pon",this.opciones[i].nombre)
          }
      });
    }
  }

}
