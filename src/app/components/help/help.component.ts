import { Component, OnInit } from '@angular/core';
import { ActivatedRoute  } from '@angular/router';

import { Ticket } from '../../models/ticketSoporte';
import { TranslateService } from '@ngx-translate/core';
import {Calendar} from 'primeng/primeng';

import { EmpresasService } from '../../services/empresas.service';
import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import {MatSelect,MatSnackBar} from '@angular/material';
import * as moment from 'moment';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {
public support:boolean=false;
public ticket: Ticket;
public prioridades:object[];
private zohoTokenAuth:string="f12d7b65f53435af69da41afaa3b06ca";
private clientId:string='1000.F4L43DSPDVKE79906MFPBS8WSFPXSU';
private code='1000.0f66ccdef4558f4c6b8f7e21a01e00ce.948fd202bcb8271d23d14b926a6961f6';
  constructor(
    private route: ActivatedRoute,
    public servidor: Servidor, 
    public empresasService: EmpresasService, 
    public translate: TranslateService) { }

  ngOnInit() {
    this.prioridades = [{'label':'baja','value':'baja'},{'label':'standard','value':'standard'},{'label':'urgante','value':'urgente'}];
    this.ticket = new Ticket(null,null,null,'Asunto','Descripción',new Date(),'BackOffice','standard','','','Open');
  }

  help(){
    this.ticket = new Ticket(null,null,null,'Asunto','Descripción',new Date(),'BackOffice','standard','','','Open');

    console.log('helping'); 
    this.support = !this.support;
  }

  newTicket(){
    console.log(this.empresasService.userId);
    this.loadUsuarios(this.empresasService.seleccionada).then(
      (respuesta)=>{
    let responsables = respuesta["data"];
    console.log(responsables)
    this.sendMailnewTicket(responsables[0]);
          });
  }


  sendMailnewTicket(user){
    console.log("sendmail start: ",user);

    console.log();
    // let body = "Nueva ticket <BR>Por: " +  responsables[responsables.findIndex((responsable)=>responsable["value"] == nuevaIncidencia.responsable)]["label"]
    // body +=   "<BR>Con fecha y hora: " + moment(nuevaIncidencia.fecha).format('DD-MM-YYYY hh-mm') +  "<BR>"
    let body = JSON.stringify(user) + '<BR>' + JSON.stringify(this.ticket) +'<BR>'+JSON.stringify(this.route.params["_value"]);
    
    let parametros2 = "&idempresa=" + this.empresasService.seleccionada + "&body="+body;
        this.servidor.getObjects(URLS.ALERTES, parametros2).subscribe(
          response => {
            if (response.success && response.data) {
              console.log('email ticket enviado');
            }
        },
        error =>{
            console.log('ERROR email',error)
        }
        );

  }

  loadUsuarios(idEmpresa){
    return new Promise((resolve)=>{
      console.log("get users: ");
    let responsables :any[];
    let parametros2 = "&entidad=usuarios"+'&idempresa=' + idEmpresa+"&WHERE=id=&valor="+this.empresasService.userId;
        this.servidor.getObjects(URLS.STD_ITEM, parametros2).subscribe(
          response => {
            responsables = [];
            if (response.success && response.data) {
            //  console.log(response.data)
              for (let element of response.data) {  
                responsables.push({'label':element.usuario,'value':element.id});
             }
             resolve ({"data":responsables})
            }
        });
      });
  }

  newZohoTicket(){
    let endPointOrg="https://desk.zoho.com/api/v1/organizations"
    this.servidor.getObjects(endPointOrg,"")
    
  }
}
