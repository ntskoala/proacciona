import { Injectable, Component } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { HttpClient } from '@angular/common/http';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from 'ng2-translate';

import {EmpresasService} from './empresas.service';

import * as moment from 'moment';


@Injectable()

export class ZohoService {

  constructor (private http: HttpClient,private llamada: Http, private empresasService: EmpresasService,public router: Router,
    private messageService: MessageService, public translate: TranslateService) {}
  
  login(url: string, param: string, payload = '') {
    param += "&origen=backoffice";
    return this.llamada.post(url + param, payload)
      .map((res: Response) => JSON.parse(res.json()));
  }
get(url: string) {
  let headers = new Headers({Authorization:'e56e20a25d4c6a363aa9049e5ffdd296'});

    return this.llamada.get(url,{headers:new Headers({Authorization:'1000.1766007e1ce33784392fc39624fd27a7.71db3c5e87c5fb01c82b69d744634a39'})});
      //.map((res: Response) => res);
    
  }

  post(url: string) {
    return this.llamada.post(url,null,null);
  }
  
}