import { Injectable, Component } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import {EmpresasService} from './empresas.service';

@Injectable()
@Component({
providers: [EmpresasService]
})
export class Servidor {

  constructor (private llamada: Http, private empresasService: EmpresasService) {}
  
  login(url: string, param: string, payload = '') {
    return this.llamada.post(url + param, payload)
      .map((res: Response) => JSON.parse(res.json()));
  }

  getObjects(url: string, param: string) {
    let parametros = '?token=' + sessionStorage.getItem('token') + param; 
    return this.llamada.get(url + parametros)
      .map((res: Response) => JSON.parse(res.json()));
  }

  postObject(url: string, object: Object, param?: string) {
    let payload = JSON.stringify(object);
    let paramopcional = '';
    if (param !== undefined){
      paramopcional = param;
    }
    paramopcional += "&userId="+this.empresasService.userId+"&idempresa="+this.empresasService.seleccionada;
    let parametros = '?token=' + sessionStorage.getItem('token') +paramopcional;
    return this.llamada.post(url + parametros, payload)
      .map((res: Response) => JSON.parse(res.json()));
  }

  putObject(url: string, param: string, object: Object) {
    let payload = JSON.stringify(object);        
    let parametros = param + '&token=' + sessionStorage.getItem('token')+"&userId="+this.empresasService.userId+"&idempresa="+this.empresasService.seleccionada;
    return this.llamada.put(url + parametros, payload)
      .map((res: Response) => JSON.parse(res.json()));
  }
  
  deleteObject(url: string, param: string) {
    let parametros = param + '&token=' + sessionStorage.getItem('token')+"&userId="+this.empresasService.userId+"&idempresa="+this.empresasService.seleccionada;
    return this.llamada.delete(url + parametros)
      .map((res: Response) => JSON.parse(res.json()));
  }

  postLogo(url: string, files: File[], idEmpresa: string) {
    let formData: FormData = new FormData();
    let parametros = '?token=' + sessionStorage.getItem('token') + '&idempresa=' + idEmpresa;
    formData.append('logo', files[0], files[0].name);
    return this.llamada.post(url + parametros, formData)
      .map((res: Response) => JSON.parse(res.json()));
  }

  postDoc(url: string, files: File[], entidad:string, idEntidad: string, idEmpresa: string, field?: string) {
    let formData: FormData = new FormData();
    let parametros = '?token=' + sessionStorage.getItem('token') + '&idEntidad=' + idEntidad +'&entidad=' + entidad+'&idEmpresa=' + idEmpresa+'&field=' + field;
    formData.append('doc', files[0], files[0].name);
    return this.llamada.post(url + parametros, formData)
      .map((res: Response) => JSON.parse(res.json()));
  }

}
