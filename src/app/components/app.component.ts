import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Import for webpack
import '../assets/css/deeppurple-amber.css';
import '../assets/css/style.css';
import '../assets/css/ng2-datepicker.css';
import '../assets/i18n/cat.json';
import '../assets/i18n/es.json';
//navigation == nav.component
@Component({
  selector: 'app',
  template: `
   <navigation></navigation>
    <div class="container">
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent implements OnInit {
  constructor(public router: Router) {}
  ngOnInit() {
  //  console.log(this.router.url);
  
    this.router.navigate(['empresas']);
  }
}


// @Component({
//   selector: 'app',
//   template: `
//   <div class="container" *ngIf="p==1">
//   <router-outlet></router-outlet>
// </div>
//    <navigation></navigation>
//     <div class="container"  *ngIf="p==2">
//       <router-outlet></router-outlet>
//     </div>
//   `
// })
// export class AppComponent implements OnInit {
//   private p=1;
//   constructor(public router: Router) {}
//   ngOnInit() {
//     console.log(this.router.url);
  
//  //   this.router.navigate(['empresas']);
//   }
// }