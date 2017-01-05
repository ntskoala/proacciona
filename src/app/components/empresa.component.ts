import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router'

import { EmpresasService } from '../services/empresas.service';

@Component({
  selector: 'empresa',
  template: `
    <div class="empresas">

      <gestion-tablas></gestion-tablas>

      <gestion-informes></gestion-informes>
    </div>
  `
})
export class EmpresaComponent implements OnInit {
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  idEmpresa: number;
  constructor(private router: Router, private route: ActivatedRoute, private empresasService: EmpresasService) {}
  ngOnInit() {
    this.route.params.forEach((params: Params) => {
      this.idEmpresa = params['idEmpresa'];
    });
    // Si la empresa del gerente es diferente a la activa, redirecciona a login
    if (this.idEmpresa !== this.empresasService.empresaActiva) {
      sessionStorage.removeItem('token');
      this.router.navigate(['login']);
    }
    this.empresasService.seleccionada = this.idEmpresa;
  }

    scrolldown(): void {
        try {
            this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        } catch(err) { }                 
    }

}
