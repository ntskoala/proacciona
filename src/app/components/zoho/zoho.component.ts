import { Component, OnInit } from '@angular/core';
import { ActivatedRoute  } from '@angular/router';
import { ZohoService } from '../../services/zoho.service';


@Component({
  selector: 'app-zoho',
  templateUrl: './zoho.component.html',
  styleUrls: ['./zoho.component.css']
})
export class ZohoComponent implements OnInit {
public hayPermiso:boolean=false;
public url1="https://tfcbackoffice.appspot.com/#/zoho/";
public url2="https://tfc1-181808.appspot.com/api/zoho.php";
  constructor(
    public zoho: ZohoService, 
    private route: ActivatedRoute) { }

  ngOnInit() {
    console.log(this.route.params["_value"]);
    this.route.queryParamMap.forEach(param=>{
      console.log(param)
      if(param.keys.find((elem)=>elem=="code")){
        this.hayPermiso = true;
        console.log('tenemos codigo',param.getAll('code')[0]);
        this.zohoAuthgetToken(param.getAll('code')[0]);
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
    let uri:string="";
    switch (opcion){
      case 1:
      uri=this.url1;
      break;
      case 2:
      uri=this.url2;
      break;
      case 3:
      uri=encodeURIComponent(this.url1);
      break;
      case 4:
      uri=encodeURIComponent(this.url2);
      break;
      
    }
    console.log(uri)
   let params= "?response_type=code&client_id=1000.F4L43DSPDVKE79906MFPBS8WSFPXSU&scope=Desk.tickets.WRITE,Desk.basic.WRITE&redirect_uri="+uri+"&state=1";
    //JAVASCRIPT
    // let params= "?response_type=code&client_id=1000.GTBZQRBQGM7627436PNS8HT63R24BY&scope=Desk.tickets.WRITE,Desk.basic.WRITE&redirect_uri=https://tfc1-181808.appspot.com/api/zoho.php&state=-5466400890088961855";
    let url='https://accounts.zoho.com/oauth/v2/auth'+params;
    this.zoho.get(url).subscribe(
      (data)=>{
        console.log(data)
      },
      (error)=>{
        console.log(error)
      }
    );
  }

  zohoAuthgetToken(code){
    console.log('pidiendo token');
    let uri=encodeURIComponent(this.url1);
    let parametros='?code='+code+
    //let parametros='?code=1000.9c53432fc04cb86d04fff2de4fa1839b.c5bc78ed3a45f2d3ab5b5804900e0e8d'+
    '&grant_type=authorization_code'+
    '&client_id=1000.F4L43DSPDVKE79906MFPBS8WSFPXSU'+
    '&client_secret=ec9d218cf1308fada3c021a3ed8597fd2581a5d2d0'+
    '&redirect_uri='+uri+
    '&scope=Desk.tickets.WRITE,Desk.basic.WRITE'+
    '&state=1';
    // let params= "?response_type=code&client_id=1000.F4L43DSPDVKE79906MFPBS8WSFPXSU&scope=Desk.tickets.WRITE,Desk.basic.WRITE&redirect_uri=https://tfc1-181808.appspot.com/api/zoho.php&state=-5466400890088961855";
    let url='https://accounts.zoho.com/oauth/v2/token'+parametros;
    this.zoho.post(url).subscribe(
      (data)=>{
        console.log(data)
      },
      (error)=>{
        console.log(error)
      }
    );
  }


  testZoho(){
    let token="e56e20a25d4c6a363aa9049e5ffdd296"
    this.zoho.get('https://desk.zoho.com/api/v1/organizations').subscribe(
      (data)=>{
        console.log(data)
      },
      (error)=>{
        console.log(error)
      }
    );
  }
}
