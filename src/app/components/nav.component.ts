import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';
import { Servidor } from '../services/servidor.service';
import { EmpresasService } from '../services/empresas.service';
import { URLS } from '../models/urls';

@Component({
  selector: 'navigation',
  templateUrl: '../assets/html/nav.component.html'
})
export class NavComponent implements OnInit{
  logoEmpresa: string;
  subscription: Subscription;
  public alertOptions:boolean=false;

  constructor(public router: Router,public servidor: Servidor, public empresasService: EmpresasService) {}

  ngOnInit() {
    this.subscription = this.empresasService.empresaSeleccionada.subscribe(
      empresa => {
        this.logoEmpresa = URLS.LOGOS + empresa.id + '/logo.jpg';

        if (empresa.logo == '0') this.logoEmpresa = '';
      },
      error => console.log(error)
    )
    if(localStorage.getItem("noTooltips")=="true"){
      this.empresasService.noTooltips=true;
    }else{
      this.empresasService.noTooltips=false;
    }
    if(localStorage.getItem("showAlerts")=="true"){
      this.empresasService.showAlerts=true;
    }else{
      this.empresasService.showAlerts=false;
    }
  }

closeSession(){
         sessionStorage.removeItem('token');
       this.router.navigate(['login']);
}

showAlertOptions(){
  this.alertOptions=true;
  console.log('activando opciones');
  setTimeout(()=>{
  this.alertOptionsChanged()
  }
  ,4000
  );
}

alertOptionsChanged(){
  console.log(this.empresasService.showAlerts);
  this.alertOptions=false;
  if (!this.empresasService.showAlerts){
    localStorage.setItem("showAlerts","false");
  }
}

}
