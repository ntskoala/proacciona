import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { EmpresasService } from '../services/empresas.service'

// Import for webpack
// import '../assets/css/deeppurple-amber.css';
// import '../assets/css/style.css';
// import '../assets/css/ng2-datepicker.css';
// import '../assets/i18n/cat.json';
// import '../assets/i18n/es.json';



// @Component({
//   selector: 'app',
//   template: `
//    <navigation></navigation>
//     <div class="container">
//       <router-outlet></router-outlet>
//     </div>
//   `
// })
// export class AppComponent implements OnInit {
//   constructor(public router: Router) {}
//   ngOnInit() {
//   //  console.log(this.router.url);
  
//     this.router.navigate(['empresas']);
//   }
// }


@Component({
  selector: 'app',
  template: `
  <div class="container" *ngIf="empresasService.login">
  <router-outlet></router-outlet>
</div>
<div  *ngIf="!empresasService.login">
   <navigation></navigation>
    <div class="container">
      <router-outlet></router-outlet>
    </div>
    </div>
  `
})
export class AppComponent implements OnInit {
  private p=2;
  constructor(public router: Router,public route: ActivatedRoute, public empresasService: EmpresasService) {}
  ngOnInit() {
    // console.log(this.router.url);
    // console.log('*******',this.route.queryParams);
    this.router.events.subscribe(
      (elem)=>{
        console.log(elem);
        if (elem["id"] ==1 && elem["url"]=='/login2'){
          this.empresasService.login = true;
         // this.router.navigate(['login2']);
        }
      }
    )
 //   this.router.navigate(['empresas']);
  }
}