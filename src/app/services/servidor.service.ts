import { Injectable, Component } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from 'ng2-translate';

import {EmpresasService} from './empresas.service';

import * as moment from 'moment/moment';


@Injectable()
// @Component({
// providers: [EmpresasService]
// })
export class Servidor {

  constructor (private llamada: Http, private empresasService: EmpresasService,public router: Router,
    private messageService: MessageService, public translate: TranslateService) {}
  
  login(url: string, param: string, payload = '') {
    param += "&origen=backoffice";
    return this.llamada.post(url + param, payload)
      .map((res: Response) => JSON.parse(res.json()));
  }

  getObjects(url: string, param: string) {
    if (this.istokenExpired()){
      this.setAlerta();
    }else{
    let parametros = '?token=' + sessionStorage.getItem('token') + param; 
    return this.llamada.get(url + parametros)
      .map((res: Response) => JSON.parse(res.json()));
    }
  }

  postObject(url: string, object: Object, param?: string) {
    if (this.istokenExpired()){
      this.setAlerta();
    }else{
    let payload = JSON.stringify(object);
    let paramopcional = '';
    if (param !== undefined){
      paramopcional = param;
    }
    paramopcional += "&userId="+this.empresasService.userId+"&idempresa="+this.empresasService.seleccionada;
    let parametros = '?token=' + sessionStorage.getItem('token') +paramopcional+ "&origen=backoffice";
    return this.llamada.post(url + parametros, payload)
      .map((res: Response) => JSON.parse(res.json()));
  }
  }

  putObject(url: string, param: string, object: Object) {
    if (this.istokenExpired()){
      this.setAlerta();
    }else{
    let payload = JSON.stringify(object);        
    let parametros = param + '&token=' + sessionStorage.getItem('token')+"&userId="+this.empresasService.userId+"&idempresa="+this.empresasService.seleccionada+ "&origen=backoffice";
    return this.llamada.put(url + parametros, payload)
      .map((res: Response) => JSON.parse(res.json()));
    }
  }
  
  deleteObject(url: string, param: string) {
    if (this.istokenExpired()){
      this.setAlerta();
    }else{
    let parametros = param + '&token=' + sessionStorage.getItem('token')+"&userId="+this.empresasService.userId+"&idempresa="+this.empresasService.seleccionada+ "&origen=backoffice";
    return this.llamada.delete(url + parametros)
      .map((res: Response) => JSON.parse(res.json()));
    }
  }

  postLogo(url: string, files: File[], idEmpresa: string) {
    if (this.istokenExpired()){
      this.setAlerta();
    }else{
    let formData: FormData = new FormData();
    let parametros = '?token=' + sessionStorage.getItem('token') + '&idempresa=' + idEmpresa+ "&origen=backoffice";
    formData.append('logo', files[0], files[0].name);
    return this.llamada.post(url + parametros, formData)
      .map((res: Response) => JSON.parse(res.json()));
    }
  }

  postDoc(url: string, files: File[], entidad:string, idEntidad: string, idEmpresa: string, field?: string) {
    if (this.istokenExpired()){
      this.setAlerta();
    }else{
    let formData: FormData = new FormData();
    let parametros = '?token=' + sessionStorage.getItem('token') + '&idEntidad=' + idEntidad +'&entidad=' + entidad+'&idEmpresa=' + idEmpresa+'&field=' + field+ "&origen=backoffice";
    formData.append('doc', files[0], files[0].name);
    return this.llamada.post(url + parametros, formData)
      .map((res: Response) => JSON.parse(res.json()));
    }
  }

  istokenExpired(){
    console.log ('istokenEspired');
   let token = sessionStorage.getItem('token');
      if (token){
                var base64Url = token.split('.')[1];
                var base64 = base64Url.replace('-', '+').replace('_', '/');
                //return JSON.parse(window.atob(base64));
                let jwt = JSON.parse(window.atob(base64));
                //console.log (moment.unix(jwt.exp),moment.unix(jwt.exp).isBefore(moment()));
                if (moment.unix(jwt.exp).isBefore(moment())) sessionStorage.setItem('token',null);
               return moment.unix(jwt.exp).isBefore(moment());
      }else{
        return true;
    }
  }

  setAlerta(){
    let concept:string = "alertas.tokenExpired";
    let concepto;
    this.translate.get(concept).subscribe((valor)=>concepto=valor)  
    this.messageService.clear();this.messageService.add(
      {severity:'error', 
      summary:'Error', 
      detail: concepto
      }
    );
    this.router.navigate(['login']);
  }

}
