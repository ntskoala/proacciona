import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  template: 'Página no encontrada',
  styles: [':host {fon-size: 2rem;}']
})
export class PageNotFoundComponent implements OnInit {
  constructor(private router: Router) {}
  ngOnInit() {
    sessionStorage.removeItem('token');
    this.router.navigate(['login']);
  }
}
