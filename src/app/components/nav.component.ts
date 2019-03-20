import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';
import { Servidor } from '../services/servidor.service';
import { EmpresasService } from '../services/empresas.service';
import { TranslateService } from '@ngx-translate/core';
import { URLS } from '../models/urls';
import { Empresa } from '../models/empresa'

@Component({
  selector: 'navigation',
  templateUrl: '../assets/html/nav.component.html'
})
export class NavComponent implements OnInit{
  logoEmpresa: string;
  subscription: Subscription;
  public alertOptions:boolean=false;
  public empresas:boolean=false;
  public idioma:string=localStorage.getItem("idioma");
  public profile:boolean=false;
  constructor(
    public router: Router,
    public servidor: Servidor,
    public empresasService: EmpresasService,
    public translate: TranslateService) {}

  ngOnInit() {
    this.subscription = this.empresasService.empresaSeleccionada.subscribe(
      empresa => {
        this.logoEmpresa = URLS.LOGOS + empresa.id + '/logo.jpg';

        if (empresa.logo == '0') this.logoEmpresa = '';
      },
      error => console.log(error)
    )
    if(localStorage.getItem("showTooltips")=="false"){
      this.empresasService.showTooltips=false;
    }else{
      this.empresasService.showTooltips=true;
    }
    if(localStorage.getItem("showAlerts")=="false"){
      this.empresasService.showAlerts=false;
    }else{
      this.empresasService.showAlerts=true;
    }
  }

closeSession(){
         sessionStorage.removeItem('token');
       this.router.navigate(['login']);
       this.profile=false;
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

// selecciona(empresa: Empresa){
//   this.empresas=false;
//   this.empresasService.seleccionarEmpresa(empresa);
//   sessionStorage.setItem('idEmpresa', empresa.id.toString());
//   sessionStorage.setItem('nombreEmpresa', empresa.nombre);
//   sessionStorage.setItem('holding', empresa.holding.toString());
//   //console.log("informes",this.empresasService.empresa.exportar_informes);
// }
configProfile(){
  console.log('Config profile');
  this.profile=!this.profile;
}
seleccionaIdioma(event){
  console.log('Config profile',event.value),this.idioma;
  localStorage.setItem("idioma",event.value);
    this.empresasService.idioma = this.idioma;
    this.translate.use(this.idioma);
    this.profile=false;
}
}
