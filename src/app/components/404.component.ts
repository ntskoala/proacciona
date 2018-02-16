import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  template: 'Página no encontrada',
  styles: [':host {fon-size: 2rem;}']
})
export class PageNotFoundComponent implements OnInit {
  constructor(public router: Router) {}
  ngOnInit() {
    console.log('ERROR 404')
    sessionStorage.removeItem('token');
    //this.router.navigate(['login']);
  }
}
