import { Component, OnInit } from '@angular/core';
import { ActivatedRoute,Router  } from '@angular/router';
import { ZohoService } from '../../services/zoho.service';
import {URLS} from '../../models/urls';
import { zoho_refresh_token, zoho_orgID} from 'environments/environment';
import { Ticket } from '../../models/ticketSoporte';
@Component({
  selector: 'app-zoho',
  templateUrl: './zoho.component.html',
  styleUrls: ['./zoho.component.css']
})
export class ZohoComponent implements OnInit {
public hayPermiso:boolean=false;
public orgID:string='20064420683';
public url1="https://tfcbackoffice.appspot.com/#/zoho/";
public refreshToken;
public version:number=2;
//access_token":"1000.ff58ac6837c4f36461cb4db5fb5e373d.4616485cda859174a69ca11616348dab","refresh_token":"1000.5f4645d6d405e7b945267aadeb80c4d3.714b7da6c5e0f986a6857b497d610ff8","expires_in_sec":3600,"api_domain":"https://www.zohoapis.eu","token_type":"Bearer","expires_in":3600000
  constructor(
    public zoho: ZohoService, 
    private route: ActivatedRoute,
    public ruter: Router) { }

  ngOnInit() {
    if(localStorage.getItem("refresh_token")) this.refreshToken=localStorage.getItem("refresh_token")
    console.log(this.route.params["_value"]);
    this.route.queryParamMap.forEach(param=>{
      console.log(param)
      if(param.keys.find((elem)=>elem=="code")){
        this.hayPermiso = true;
        localStorage.setItem("zohoCode",param.getAll('code')[0]);
        console.log('tenemos codigo',param.getAll('code')[0]);
        //this.zohoAuthgetToken(param.getAll('code')[0]);
      }else{
        this.hayPermiso=false;
        console.log('NO tenemos codigo');
      } 
    }
    );

  }

  zohoAuth(opcion){
    console.log('pidiendo permiso');
    //WEB
    let uri:string=encodeURIComponent(this.url1);


    console.log(uri)
   let params= "?response_type=code&client_id=1000.F4L43DSPDVKE79906MFPBS8WSFPXSU"+
   "&scope=Desk.tickets.READ,Desk.tickets.CREATE,Desk.basic.READ"+
   "&redirect_uri="+uri+"&state=1&access_type=offline";
    //JAVASCRIPT
    // let params= "?response_type=code&client_id=1000.GTBZQRBQGM7627436PNS8HT63R24BY&scope=Desk.tickets.WRITE,Desk.basic.WRITE&redirect_uri=https://tfc1-181808.appspot.com/api/zoho.php&state=-5466400890088961855";
    let url='https://accounts.zoho.com/oauth/v2/auth'+params;
    // this.ruter.navigateByUrl(url);
    this.zoho.get(url,'','').subscribe(
      (data)=>{
        console.log('ok code',data)
      },
      (error)=>{
        console.log('error code', error)
      }
    );
  }

  zohoAuthgetToken(code?){
    console.log('pidiendo token');
    let uri=encodeURIComponent(this.url1);
    let parametros='?code='+localStorage.getItem("zohoCode")+
    //let parametros='?code=1000.9c53432fc04cb86d04fff2de4fa1839b.c5bc78ed3a45f2d3ab5b5804900e0e8d'+
    // let parametros='?code=1000.726e04fc6b4386d2c6931d0b1fa236d5.4f8f9e7c59fced4c2ae8bcde05f41056'+
    '&grant_type=authorization_code'+
    '&client_id=1000.F4L43DSPDVKE79906MFPBS8WSFPXSU'+
    '&client_secret=ec9d218cf1308fada3c021a3ed8597fd2581a5d2d0'+
    '&redirect_uri='+uri+
    '&scope=Desk.tickets.READ,Desk.tickets.CREATE,Desk.basic.READ'+
    // '&scope=Desk.tickets.READ,Desk.basic.READ'+
    '&state=1';
    // let params= "?response_type=code&client_id=1000.F4L43DSPDVKE79906MFPBS8WSFPXSU&scope=Desk.tickets.WRITE,Desk.basic.WRITE&redirect_uri=https://tfc1-181808.appspot.com/api/zoho.php&state=-5466400890088961855";
    let url='https://accounts.zoho.eu/oauth/v2/token'+parametros;
    this.zoho.post(url).subscribe(
      (data)=>{
        console.log('GETTING TOKEN RESULT: ',JSON.parse(data["_body"]));
        let resultados=JSON.parse(data["_body"]);
        if(resultados.access_token)
        localStorage.setItem("zohoToken",resultados.access_token);
        if(resultados.refresh_token)
        localStorage.setItem("refresh_token",resultados.refresh_token);
        this.refreshToken=localStorage.getItem("refresh_token");
      },
      (error)=>{
        console.log('GETTING TOKEN ERROR: ',error)
      }
    );
  }

  zohoRefereshToken(){
    let uri=encodeURIComponent(this.url1);
    let parametros='?refresh_token='+zoho_refresh_token+
    // '&client_id=1000.F4L43DSPDVKE79906MFPBS8WSFPXSU'+
    // '&client_secret=ec9d218cf1308fada3c021a3ed8597fd2581a5d2d0'+
    '&client_id=1000.IOF6NI3XTKFA914737J57V48MJ1EVA'+
    '&client_secret=5d00441b2484810e2e0229bfa73a20b9b466a0debe'+
    //'&redirect_uri='+uri+
    '&scope=Desk.tickets.READ,Desk.tickets.CREATE,Desk.basic.READ'+
    '&grant_type=refresh_token';
    let url='https://accounts.zoho.eu/oauth/v2/token'+parametros;
    this.zoho.post(url).subscribe(
      (data)=>{
        console.log(JSON.parse(data["_body"]));
        let resultados=JSON.parse(data["_body"]);
        localStorage.setItem("zohoToken",resultados.access_token);
        // localStorage.setItem("refresh_token",resultados.refresh_token);
      },
      (error)=>{
        console.log(error)
      }
    );
  }

  testZoho(baseURL){
    let token= localStorage.getItem("zohoToken");
    this.zoho.get(baseURL,token,this.orgID).subscribe(
      (data)=>{
        console.log('GETTING DATA 1',data)
      },
      (error)=>{
        console.log('GETTING DATA 1 ERROR: ',error)
      }
    );
    // this.zoho.get2(baseURL,token,this.orgID).subscribe(
    //   (data)=>{
    //     console.log('GETTING DATA 2 ',data)
    //   },
    //   (error)=>{
    //     console.log('GETTING DATA 2 ERROR: ',error)
    //   }
    // );
    // this.zoho.getData(baseURL,token)
  }


  getTickets(){
    let token= localStorage.getItem("zohoToken");
    this.zoho.get('https://desk.zoho.eu/api/v1/tickets',token,this.orgID).subscribe(
      (data)=>{
        console.log('GETTING TICKETS 1',data)
      },
      (error)=>{
        console.log('GETTING TICKETS 1 ERROR: ',error)
      }
    );

  // this.zoho.get2('https://desk.zoho.eu/api/v1/tickets',token,this.orgID).subscribe(
  //   (data)=>{
  //     console.log('GETTING TICKETS 1',data)
  //   },
  //   (error)=>{
  //     console.log('GETTING TICKETS 1 ERROR: ',error)
  //   }
  // );
}

postTicket(){
  let url = 'https://tfc.proacciona.es/api/zoho2.php?token='+localStorage.getItem("zohoToken");
  let token= localStorage.getItem("zohoToken");
  let ticket = new Ticket(null,16266000000041635,16266000000007061,'asunto','descripcion ticket',new Date(),'backoffice','standard','695169539','jorged@ntskoala.com','OPEN');
  this.zoho.post2(url,ticket,token,zoho_orgID).subscribe(
    (data)=>{
      console.log(JSON.parse(data["_body"]));
      let resultados=JSON.parse(data["_body"]);
      localStorage.setItem("zohoToken",resultados.access_token);
      // localStorage.setItem("refresh_token",resultados.refresh_token);
    },
    (error)=>{
      console.log(error)
    }
  );
}
}
