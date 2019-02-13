import { Component, OnInit} from '@angular/core';
// import { Component, OnInit,Input, NgZone } from '@angular/core';

import { EmpresasService } from '../../services/empresas.service';

import { observable } from 'rxjs';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
  // encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {

  constructor(public empresasService: EmpresasService) { }

  ngOnInit() {
    this.empresasService.administrador;

  }

     

}
