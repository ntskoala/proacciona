import { Component, OnInit, AfterViewInit, Output,EventEmitter } from '@angular/core';
import { Router,ActivatedRoute, ParamMap  } from '@angular/router';


import { EmpresasService } from '../services/empresas.service';
import { PermisosService } from '../services/permisos.service';
import { Menu } from '../models/menu';

@Component({
  selector: 'menu',
  templateUrl: '../assets/html/menu.component.html',
  styleUrls:['../assets/css/menu.component.css']
})

export class MenuComponent implements OnInit,AfterViewInit{
@Output() selectedMenu: EventEmitter<string>= new EventEmitter<string>();

public menu:Menu[];
public subMenu:string=null;
public modulos:Menu[]= [];

  constructor(public empresasService: EmpresasService,private route: ActivatedRoute,
    public router: Router, public permisos: PermisosService) {

  }
  ngAfterViewInit(){
    this.permisos.modulosFuente.subscribe(
      (valor)=>{
        console.log('Valor',valor);
        this.setMenu();
      }
    )
  }
  ngOnInit() {

  }

setMenu(){
  console.log('Seting menus');
  this.menu=[];
  this.modulos = [
    new Menu('planificaciones','planificaciones','date_range',this.permisos.planificaciones),
    new Menu('maquinaria','maquinaria','build',this.permisos.fichas_maquinaria),
    new Menu('limpieza','limpieza','brush',this.permisos.limpieza),
    new Menu('proveedores','proveedores','work',this.permisos.proveedores),
    new Menu('clientes','clientes','store',this.permisos.clientes),
    new Menu('produccion','produccion','developer_board',this.permisos.produccion)
];
  // this.menu.push(new Menu('dashboard','dashboard','slow_motion_video',true));
  // this.menu.push(new Menu('config','settings','settings',true));
  // this.menu.push(new Menu('informes','informes','show_chart',true));
  let tempMenu = [];
  this.modulos.forEach((modulo)=>{
    if (this.empresasService.userTipo == 'Mantenimiento' && modulo.nombre != 'maquinaria') modulo.activo = false;
    tempMenu.push(modulo);
  });
  this.menu = tempMenu.sort((a,b)=>(+b.activo)-(+a.activo));

//  this.modulos.filter((mod)=>mod.activo == true).forEach((modulo)=>{
//     if (this.empresasService.userTipo == 'Mantenimiento' && modulo.nombre != 'maquinaria') modulo.activo = false;
//     this.menu.push(modulo);
//   });
//  this.modulos.filter((mod)=>mod.activo != true).forEach((modulo)=>{
//     this.menu.push(modulo);
//   });
this.selectedUrlMenu();
 console.log(this.menu,this.subMenu);
// this.setOrden();
}

setOrden(){
  let newArr= this.menu.sort((a,b)=>(+b.activo)-(+a.activo));
  console.log(newArr);
}



setSeleccion(opcionmenu){
  let url = 'empresas/'+ this.empresasService.seleccionada+ '/'+opcionmenu+'/0/0';
  this.router.navigateByUrl(url);

this.selectedMenu.emit(opcionmenu);
this.subMenu = opcionmenu
}


selectedUrlMenu(){
  this.route.paramMap.forEach((param)=>{
    switch(param["params"]["modulo"]){
      case "limpieza_realizada":
      this.subMenu = "limpieza";
      break;
      case "incidencias":
      this.subMenu = "incidencias";
      break;
      default:
      this.subMenu = param["params"]["modulo"];
    }
  });
}
}
