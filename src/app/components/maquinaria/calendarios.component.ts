import { Component, OnInit } from '@angular/core';


import { EmpresasService } from '../../services/empresas.service';
import { Empresa } from '../../models/empresa';
 import { Maquina } from '../../models/maquina';

@Component({
  selector: 'calendarios',
  templateUrl: './calendarios.component.html',
  styleUrls: ['./calendarios.css']
})
export class CalendariosComponent implements OnInit {
public maquina: Maquina;
public meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','diciembre'];
public dias = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
  constructor(private empresasService: EmpresasService) {}

  ngOnInit() {
  }


}
