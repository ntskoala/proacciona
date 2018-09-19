import { Injectable, Component } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { HttpClient, HttpHeaders,HttpRequest,HttpEvent,HttpEventType, } from '@angular/common/http';

import 'rxjs/add/operator/map';

import { Router } from '@angular/router';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from '@ngx-translate/core';

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
get(url: string, token: string, orgId:string) {
  console.log('Get1');
  // let headers = new Headers({'Authorization': 'Zoho-oauthtoken  ' + token});
  let headers = new HttpHeaders();
  headers = headers.set("Authorization", 'Bearer ' + token).set("orgId",orgId).set("contentType", "application/json");
    return this.http.get(url,{headers:headers})
    // .subscribe(
    //   (resultado)=>{resultado},
    //   (error)=>{console.log('ERRORES',error)});
      //.map((res: Response) => res);
  }

  post(url: string) {

    return this.llamada.post(url,null,null);
  }
  post2(url: string,params :object, token: string, orgId:string) {
  let headers = new HttpHeaders();
  headers = headers.set("Authorization", 'Bearer ' + token).set("orgId",orgId).set("contentType", "application/json");
    return this.http.post(url,params,{headers:headers})
  }
  // get2(url: string, token: string, orgId: string) {
  //   console.log('Get2');
  //   let headers = new Headers({'Authorization': 'Bearer  ' + token,'orgId':orgId,'contentType': "application/json"});
  //     return this.llamada.get(url,{headers:headers});
  //   }


  // getData(url,token) {
  //   console.log('Get DATA1');
  //   let headers = new Headers({'Authorization': 'Zoho-oauthtoken  ' + token});
  //  let miURL =  url;
  //   const req = new HttpRequest('GET', miURL, {
  //     headers:headers,reportProgress: true
  //   });

  //   this.http.request(req).subscribe((event: HttpEvent<any>) => {
  //     console.log('Get DATA NEW EVENT',event);
  //     switch (event.type) {
  //       case HttpEventType.Sent:
  //         console.log('Request sent!');
  //         break;
  //       case HttpEventType.ResponseHeader:
  //         console.log('Response header received!');
  //         break;
  //       case HttpEventType.DownloadProgress:
  //         const kbLoaded = Math.round(event.loaded / 1024);
  //         console.log(`Download in progress! ${ kbLoaded }Kb loaded`);
  //         break;
  //       case HttpEventType.Response:
  //         console.log('😺 Done!', event.body);
  //     }
  //   });
  // }
}