import { Component, OnInit } from '@angular/core';
import { Router ,ActivatedRoute, ParamMap  } from '@angular/router';

import * as moment from 'moment/moment';

import { Servidor } from '../../../services/servidor.service';
import { URLS } from '../../../models/urls';
import { EmpresasService } from '../../../services/empresas.service';
import { Empresa } from '../../../models/empresa';
import { Incidencia } from '../../../models/incidencia';


@Component({
  selector: 'app-admin-incidencias-cliente',
  templateUrl: './admin-incidencias-cliente.component.html',
  styleUrls: ['./admin-incidencias-cliente.component.css']
})
export class AdminIncidenciasClienteComponent implements OnInit {
  public incidencias:Incidencia[] = [];
  public empresas: Object[]=[];
  public entidad:string="&entidad=incidencias";
  public calculando: boolean=false;
  public altura:string;
  public dias: number;

  constructor(public servidor: Servidor,public empresasService: EmpresasService,
  public router: Router,
  public route: ActivatedRoute) { }



  ngOnInit() {
    this.loadResultados(7);
  }


  loadIncidencias(dateInicio: Date) {
    
    let fechaInicio= moment(dateInicio).format('YYYY-MM-DD');
    let parametros = '&entidad=incidencias&fecha='+fechaInicio;
        //let parametros = '&idempresa=' + seleccionada.id;
        // Llamada al servidor para conseguir las checklists
        this.servidor.getObjects(URLS.GETDASHBOARDADMIN, parametros).subscribe(
          response => {
            this.incidencias = [];
            this.empresas = [];
            let x=-1;
            if (response.success == 'true' && response.data) {
              for (let element of response.data) {
                let fecha:Date;
                let fechaCierre:Date;
                if (moment(element.fecha).isValid()) fecha = moment(new Date(element.fecha)).utc().toDate();              
                if (moment(element.fecha_cierre).isValid()) fechaCierre = moment(new Date(element.fecha_cierre)).utc().toDate();
                let incidencia = new Incidencia(element.id,element.idempresa,element.incidencia,element.responsable,
                  fecha,element.responsable_cierre,
                  fechaCierre,element.solucion,
                  element.nc,element.origen,element.idOrigen,element.origenasociado,element.idOrigenasociado,element.foto,
                  element.descripcion,element.estado)
                if (x<0 || element.nombreEmpresa != this.empresas[x]["nombre"]){
                x++;
                console.log('XXX',x,element);
                this.empresas.push({'nombre':element.nombreEmpresa,'id':element.idempresa,'incidencias':[incidencia]});
                }else{
                  console.log('XXX',x,element);
                this.empresas[x]["incidencias"].push(incidencia);
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
    let fechaInicio = moment().subtract(dias,'d').toDate();
    this.loadIncidencias(fechaInicio);
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
