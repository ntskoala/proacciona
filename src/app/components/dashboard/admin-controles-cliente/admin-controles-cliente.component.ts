import { Component, OnInit } from '@angular/core';
import { Router ,ActivatedRoute, ParamMap  } from '@angular/router';

import * as moment from 'moment/moment';

import { Servidor } from '../../../services/servidor.service';
import { URLS } from '../../../models/urls';
import { EmpresasService } from '../../../services/empresas.service';
import { Empresa } from '../../../models/empresa';
import { Incidencia } from '../../../models/incidencia';

@Component({
  selector: 'app-admin-controles-cliente',
  templateUrl: './admin-controles-cliente.component.html',
  styleUrls: ['./admin-controles-cliente.component.css']
})
export class AdminControlesClienteComponent implements OnInit {
  public incidencias:Incidencia[] = [];
  public emps: Object[]=[];
  public entidad:string="&entidad=incidencias";
  public calculando: boolean=false;
  public altura:string;
  public dias: number;
//**** */
public empresas: Empresa[] = [];
public empresasNoActivas:Empresa[] = [];
//**** */
  constructor(public servidor: Servidor,public empresasService: EmpresasService,
  public router: Router,
  public route: ActivatedRoute) { }


  ngOnInit() {
    this.loadEmpresas();
  }

loadEmpresas(){
  let x=0;
  this.servidor.getObjects(URLS.EMPRESAS, '').subscribe(
    response => {
      console.log(response)
      if (response.success) {
        //this.empresas.push(this.empresa);
        for (let element of response.data) {
          if (element.activa == 1){
          this.empresas.push(new Empresa(
            element.nombre,
            element.logo,
            element.id
          ));
          this.loadAlertas(element.nombre,element.id,x);
          x++;
        }else{
          this.empresasNoActivas.push(new Empresa(
            element.nombre,
            element.logo,
            element.id
          ))
        }
        }
      }
  },
  (error)=>console.log(error),
  ()=>{});
}


   loadAlertas(nombreEmpresa:string,idEmpresa:number,x:number){
    let parametros = '&idempresa=' + idEmpresa;
        this.servidor.getObjects(URLS.DASHCONTROLES, parametros).subscribe(
          response => {
            let alertas = [];
             let controles = [];
            let checklists = [];
            let limpiezas = [];
            let mantenimientos = [];
            if (response.success && response.data) {
              for (let element of response.data) {
                let isbeforedate = moment(element.fecha).isBefore(new Date(),'day');
                if (isbeforedate){
                  alertas.push({
                  "nombre":element.nombre,
                  "fecha": moment(element.fecha).format('DD-MM-YYYY'),
                  "tipo":element.tipo});
                  switch(element.tipo){
                    case "control":
                    controles.push({"nombre":element.nombre,"fecha": moment(element.fecha).format('DD-MM-YYYY'),"isbeforedate":isbeforedate,"tipo":element.tipo,"dias":moment().diff(moment(element.fecha),'days')});
                    break;
                    case "checklist":
                    checklists.push({"nombre":element.nombre,"fecha": moment(element.fecha).format('DD-MM-YYYY'),"isbeforedate":isbeforedate,"tipo":element.tipo,"dias":moment().diff(moment(element.fecha),'days')});
                    break;
                    case "limpieza":
                    limpiezas.push({"nombre":element.nombre + ' ' + element.zona,"fecha": moment(element.fecha).format('DD-MM-YYYY'),"isbeforedate":isbeforedate,"tipo":element.tipo,"dias":moment().diff(moment(element.fecha),'days')});
                    break;                        
                    case "mantenimiento":
                    mantenimientos.push({"nombre":element.nombre + ' ' + element.maquina,"fecha": moment(element.fecha).format('DD-MM-YYYY'),"isbeforedate":isbeforedate,"tipo":element.tipo,"dias":moment().diff(moment(element.fecha),'days')});
                    break; 
                    case "calibracion":
                    mantenimientos.push({"nombre":element.nombre + ' ' + element.maquina,"fecha": moment(element.fecha).format('DD-MM-YYYY'),"isbeforedate":isbeforedate,"tipo":element.tipo,"dias":moment().diff(moment(element.fecha),'days')});
                    break;                                                
                  }
                }
             }
             this.emps.push({'nombre':nombreEmpresa,'id':idEmpresa,'controles':controles,'checklists':checklists,'limpiezas':limpiezas,'mantenimientos':mantenimientos});

             console.log('Controles');
            }
        });
}



  //  loadResultados(dias:number){
  //   this.dias=dias;
  //   // this.altura = "calc(100% + 30px)";
  //   let fechaInicio = moment().subtract(dias,'d').toDate();
  //   this.loadIncidencias(fechaInicio);
  // }

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

  gotoOrigen(item,nombreEmpresa){
    
    this.empresasService.seleccionarEmpresa(item.idempresa);
    sessionStorage.setItem('idEmpresa', item.idempresa.toString());
    sessionStorage.setItem('nombreEmpresa', nombreEmpresa);
    console.log('goto Origen',item);
    let origenAsociado;
    item.origenasociado !==null? origenAsociado = item.origenasociado:origenAsociado ='incidencias';
    let url = 'empresas/'+ item.idempresa + '/'+ origenAsociado +'/'+item.idOrigenasociado+'/'+item.idOrigen
    //let cleanUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);

    this.router.navigate([url]);

  }

}
