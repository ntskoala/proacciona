import { Component, OnInit } from '@angular/core';
import { Router ,ActivatedRoute, ParamMap  } from '@angular/router';

import * as moment from 'moment/moment';

import { Servidor } from '../../../services/servidor.service';
import { URLS } from '../../../models/urls';
import { EmpresasService } from '../../../services/empresas.service';
import { Empresa } from '../../../models/empresa';
import { Usuario } from '../../../models/usuario';

@Component({
  selector: 'app-admin-logins-cliente',
  templateUrl: './admin-logins-cliente.component.html',
  styleUrls: ['./admin-logins-cliente.component.css']
})
export class AdminLoginsClienteComponent implements OnInit {

  public empresas: Object[]=[];
  public calculando: boolean=false;
  public altura:string;
  public dias: number;
  public usuarios: Usuario[] = [];
  constructor(public servidor: Servidor,public empresasService: EmpresasService,
  public router: Router,
  public route: ActivatedRoute) { }

  ngOnInit() {
    this.loadUsers();
  }
  loadUsers(){
    this.calculando = true;
    let parametros = '&idempresa= 1 or idempresa >0';
    // llamada al servidor para conseguir los usuarios
    this.servidor.getObjects(URLS.USUARIOS, parametros).subscribe(
      response => {
        this.usuarios = [];
        if (response.success && response.data) {
          let orden=0;
          for (let element of response.data) {
            if (element.orden == 0){
              orden++;
              }else{orden=parseInt(element.orden);}
            this.usuarios.push(new Usuario(element.id, element.usuario, element.password,
              element.tipouser, element.email, element.idempresa,0+orden,element.superuser));
              // this.panels.push(false);
          }
          // this.loadLogs(7);
          
          this.calculando=false;

        }
    });
}

  loadLogs(dateInicio: number) {
    console.log(this.usuarios);
    let fechaInicio= moment().subtract(dateInicio,'d').format('YYYY-MM-DD');
    let parametros = '&entidad=logins&fecha='+fechaInicio;
        //let parametros = '&idempresa=' + seleccionada.id;
        // Llamada al servidor para conseguir las checklists
        this.servidor.getObjects(URLS.GETDASHBOARDADMIN, parametros).subscribe(
          response => {
            let logs = [];
            this.empresas = [];
            let x=-1;
            if (response.success == 'true' && response.data) {
              for (let element of response.data) {
                let fecha:Date;
                let fechaCierre:Date;
                if (moment(element.fecha).isValid()) fecha = moment(new Date(element.fecha)).utc().toDate();              
                if (moment(element.fecha_cierre).isValid()) fechaCierre = moment(new Date(element.fecha_cierre)).utc().toDate();
                console.log(element.idusuario)
                let accion = '';
                switch (element.accion){
                  case "login":
                  accion = '';
                  break;
                  case "POST":
                  accion = 'Nuevos registros';
                  break;
                  case "PUT":
                  accion = 'Actualizaciones';
                  break;
                  case "DELETE":
                  accion = 'Registros Borrados';
                  break;
                }
                let log = {
                  "fecha":moment(element.fecha).format('DD-MM-YYYY'),
                    "idusuario":element.idusuario,
                    "usuario":this.usuarios[this.usuarios.findIndex((user)=>user.id==element.idusuario)].usuario,
                    "tabla":element.tabla,
                    "accion":accion,
                    "plataforma":element.plataforma,
                      "total":element.total};
                if (x<0 || element.nombreEmpresa != this.empresas[x]["nombre"]){
                x++;
                // console.log('XXX',x,element);
                this.empresas.push({'nombre':element.nombreEmpresa,'id':element.idempresa,'logs':[log]});
                }else{
                  // console.log('XXX',x,element);
                this.empresas[x]["logs"].push(log);
                }
              }
              console.log(this.empresas);
              this.empresas.length > 4? this.altura = 95 + this.empresas.length*48 + 'px' : '';
            }
          },
              (error) => {console.log(error)},
              ()=>{

              }
        );
   }

   loadResultados(dias:number){
    this.dias=dias;
    // this.altura = "calc(100% + 30px)";
    //let fechaInicio = moment().subtract(dias,'d').toDate();
    this.loadLogs(dias);
  }

  closePanel(panel){
    // this.panels[panel]=false;
    // console.log(this.panels.find((item)=>item==true))
    // if (this.panels.find((item)=>item==true)){
       this.altura = "calc(100% + 30px)";
    // }else{
    // this.altura = ""
    // }
  }
  
  openPanel(panel){
    // this.panels[panel]=true;
    this.altura = "calc(100% + 30px)"
  }





}


