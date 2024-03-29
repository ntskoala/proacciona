import { Injectable, Component  } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { HttpClient, HttpRequest } from '@angular/common/http';

// import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/ta';
// import 'rxjs/add/operator/last';
import { map, tap, last } from 'rxjs/operators';

import { Router } from '@angular/router';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from '@ngx-translate/core';

import {EmpresasService} from './empresas.service';

import * as moment from 'moment';


@Injectable()
// @Component({
// providers: [EmpresasService]
// })
export class Servidor {

  constructor (private http: HttpClient,private llamada: Http, private empresasService: EmpresasService,public router: Router,
    private messageService: MessageService, public translate: TranslateService) {}
  
  login(url: string, param: string, payload = '') {
    param += "&origen=backoffice";
    return this.llamada.post(url + param, payload)
      .map((res: Response) => JSON.parse(res.json()));
  }

  getObjects(url: string, param: string) {
    if (this.istokenExpired('get'+url+':'+param)){
      this.setAlerta();
    }else{
    let parametros = '?token=' + sessionStorage.getItem('token') + param; 
    return this.llamada.get(url + parametros)
      .map((res: Response) => JSON.parse(res.json()));
    }
  }
  
  getSimple(url: string, param: string) {
    return this.http.get(url,{responseType: 'text'})
  }


  postSimple(url: string, object: Object, param?: string) {
    let payload = JSON.stringify(object);
    return this.llamada.post(url, payload)
  }

  // postSimple(url: string, object: Object, param?: string) {
  //   let payload = JSON.stringify(object);
  //   // let req = new HttpRequest('POST', url, payload, { 
  //   //   reportProgress: true
  //   // });
  //   // return this.http.request(req).pipe(
  //   //   tap(message => console.log(message)),
  //   //     last()
  //   // );
  //   return this.http.post(url, payload).map
  // }





  // getObjects2(url: string, param: string) {
  //   if (this.istokenExpired()){
  //     this.setAlerta();
  //   }else{
  //   let parametros = '?token=' + sessionStorage.getItem('token') + param; 
  //   return this.http.get(url + parametros)
  //     //.map((res: Response) => JSON.parse(res.json()));
  //   }
  // }
  postObject(url: string, object: Object, param?: string) {
    if (this.istokenExpired('post')){
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
    if (this.istokenExpired('put')){
      this.setAlerta();
    }else{
    let payload = JSON.stringify(object);        
    let parametros = param + '&token=' + sessionStorage.getItem('token')+"&userId="+this.empresasService.userId+"&idempresa="+this.empresasService.seleccionada+ "&origen=backoffice";
    return this.llamada.put(url + parametros, payload)
      .map((res: Response) => JSON.parse(res.json()));
    }
  }
  
  deleteObject(url: string, param: string) {
    if (this.istokenExpired('delete')){
      this.setAlerta();
    }else{
    let parametros = param + '&token=' + sessionStorage.getItem('token')+"&userId="+this.empresasService.userId+"&idempresa="+this.empresasService.seleccionada+ "&origen=backoffice";
    return this.llamada.delete(url + parametros)
      .map((res: Response) => JSON.parse(res.json()));
    }
  }

  postLogo(url: string, files: File[], idEmpresa: string, params?:string) {
    if (this.istokenExpired('postlogo')){
      this.setAlerta();
    }else{
    let formData: FormData = new FormData();
    let parametros = '?token=' + sessionStorage.getItem('token') + '&idempresa=' + idEmpresa+ "&origen=backoffice"+params;
    if (files)
    formData.append('logo', files[0], files[0].name);
    return this.llamada.post(url + parametros, formData)
      .map((res: Response) => JSON.parse(res.json()));
    }
  }

  postDoc(url: string, files: File[], entidad:string, idEntidad: string, idEmpresa: string, field?: string) {
    if (this.istokenExpired('postDoc')){
      this.setAlerta();
    }else{
    let formData: FormData = new FormData();
    let parametros = '?token=' + sessionStorage.getItem('token') + '&idEntidad=' + idEntidad +'&entidad=' + entidad+'&idEmpresa=' + idEmpresa+'&field=' + field+ "&origen=backoffice";
    formData.append('doc', files[0], files[0].name);
    return this.llamada.post(url + parametros, formData)
      .map((res: Response) => JSON.parse(res.json()));
    }
  }

  istokenExpired(fuente?){
    //console.log ('istokenEspired');
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
