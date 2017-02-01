import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { EmpresasService } from '../services/empresas.service';
import { Empresa } from '../models/empresa';
 
@Component({
  selector: 'empresas',
  templateUrl: '../assets/html/empresas.component.html'
})
export class EmpresasComponent implements OnInit {
@ViewChild('scrollMe') private myScrollContainer: ElementRef;
public selectedMenu:string='home';
public gallery: string;
  permiso: boolean = false;
  token = sessionStorage.getItem('token');
  empresa: Empresa;
  constructor(private router: Router, private empresasService: EmpresasService) {}

  ngOnInit() {
    this.gallery = "https://source.unsplash.com/1200x200/?food";
    // Si no exite el token, redirecciona a login
    if (!this.token) {
      this.router.navigate(['login']);
    } else if (!this.empresasService.administrador) {
      // Si el usuario activo no es administrador, redirecciona a login
      if (this.empresasService.empresaActiva == 0){
       sessionStorage.removeItem('token');
       this.router.navigate(['login']);
      }
      this.empresa = new Empresa ('','','0','0', this.empresasService.empresaActiva);
      this.empresasService.seleccionarEmpresa(this.empresa);
      this.permiso = true;
    } else {
      // Todo ok, adelante
      this.permiso = true;
      console.log('Seleccion automática de empresa, empresas component');
this.empresasService.seleccionarEmpresa(new Empresa('','','','',2));
    }
    console.log("empresas",this.empresasService.administrador,this.permiso)
  }

    scrolldown(): void {
        try {
            this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        } catch(err) { }                 
    }

    setMenu(menu){
      this.selectedMenu = menu;
    }

}
