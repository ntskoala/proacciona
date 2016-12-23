import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Import for webpack
import '../assets/css/deeppurple-amber.css';
import '../assets/css/style.css';
import '../assets/css/ng2-datepicker.css';
import '../assets/i18n/cat.json';
import '../assets/i18n/es.json';

@Component({
  selector: 'app',
  template: `
   <!--<navigation></navigation>-->
    <div class="container">
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent implements OnInit {
  constructor(private router: Router) {}
  ngOnInit() {
    this.router.navigate(['empresas']);
  }
}
