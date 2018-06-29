import { Component, OnInit } from '@angular/core';
import { Router ,ActivatedRoute, ParamMap  } from '@angular/router';

import * as moment from 'moment/moment';

import { Servidor } from '../../../services/servidor.service';
import { URLS } from '../../../models/urls';
import { EmpresasService } from '../../../services/empresas.service';
import { Empresa } from '../../../models/empresa';
import { Incidencia } from '../../../models/incidencia';

@Component({
  selector: 'app-dashincidencias',
  templateUrl: './dashincidencias.component.html',
  styleUrls: ['./dashincidencias.component.css']
})
export class DashincidenciasComponent implements OnInit {
  public incidencias = [];
  public entidad:string="&entidad=incidencias";
  constructor(public servidor: Servidor,public empresasService: EmpresasService,
  public router: Router,
  public route: ActivatedRoute) { }

  ngOnInit() {
  }

  loadIncidencias(dateInicio: Date) {
    let empresa = this.empresasService.seleccionada;
    let fechaInicio= moment(dateInicio).format('YYYY-MM-DD');
    let fechaFin= moment().format('YYYY-MM-DD');
    let filterDates = "&filterdates=true&fecha_inicio="+fechaInicio+"&fecha_fin="+fechaFin+"&fecha_field=fecha"
    let parametros = '&idempresa=' + empresa+this.entidad+'&order=id DESC'+filterDates;
        //let parametros = '&idempresa=' + seleccionada.id;
        // Llamada al servidor para conseguir las checklists
        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            this.incidencias = [];
            if (response.success == 'true' && response.data) {
              for (let element of response.data) {
                let fecha:Date;
                let fechaCierre:Date;
                if (moment(element.fecha).isValid()) fecha = moment(new Date(element.fecha)).utc().toDate();              
                if (moment(element.fecha_cierre).isValid()) fechaCierre = moment(new Date(element.fecha_cierre)).utc().toDate();
                this.incidencias.push(new Incidencia(element.id,element.idempresa,element.incidencia,element.responsable,
                  fecha,element.responsable_cierre,
                  fechaCierre,element.solucion,
                  element.nc,element.origen,element.idOrigen,element.origenasociado,element.idOrigenasociado,element.foto,
                  element.descripcion,element.estado));
              }
              console.log(this.incidencias);
            }
          },
              (error) => {console.log(error)},
              ()=>{

              }
        );
   }

  loadResultados(dias:number){
    let fechaInicio = moment().subtract(dias,'d').toDate();
    this.loadIncidencias(fechaInicio);
  }
  gotoOrigen(item){
    console.log('goto Origen',item);
    let url = 'empresas/'+ this.empresasService.seleccionada + '/'+ item.origenasociado +'/'+item.idOrigenasociado+'/'+item.idOrigen
    //let cleanUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);

    this.router.navigate([url]);

  }
}