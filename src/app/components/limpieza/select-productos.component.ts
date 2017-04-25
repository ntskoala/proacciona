import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { myprods } from '../../models/limpiezamyprods';
import { EmpresasService } from '../../services/empresas.service';
export class prods{
    constructor(
        public id:number,
        public nombre:string,
        public estado:number
    ){}
}

@Component({
  selector: 'select-productos',
  templateUrl: './select-productos.component.html',
  styleUrls:['limpieza.component.css']
  
})

export class SelectProductosComponent implements OnInit, OnChanges{
@Input() elementoLimpieza:number;
@Output() selectedProductsChange:EventEmitter<string[]>=new EventEmitter<string[]>();
//@Input() productos:string[]=[];
public productos:prods[]=[];
public misproductos:string[]=[];
public viewProducts:boolean=false;
public items;
  constructor(public servidor: Servidor,public empresasService: EmpresasService) {}

  ngOnInit() {
      this.getMisProductos();
    //   if(this.selectedProducts) {
    //       try{
    //       this.misproductos = JSON.parse(this.selectedProducts);
    //       }
    //       catch (e){
    //           console.log(e)
    //       }
    //   }
  }
  ngOnChanges(){     
  }

  getProductos(){
      console.log('get productos');
          let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=limpieza_producto"; 
        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            this.productos = [];
            if (response.success && response.data) {
              for (let element of response.data) { 
                  let estado = this.misproductos.indexOf(element.id); 
                  this.productos.push(new prods(element.id,element.nombre,estado));
             }
            }
        },
        error=>console.log(error),
        ()=>{
          console.log('completd products');
         //this.getMisProductos();
        }
        );
  }

getMisProductos(){
  if (this.elementoLimpieza >0){
          let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=limpieza_productos_elemento"+"&field=idelemento&idItem="+this.elementoLimpieza; 
        this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
          response => {
            this.misproductos = [];
            if (response.success && response.data) {
              for (let element of response.data) {  
                  this.misproductos.push(element.idproducto);
             }
            }
        },
        error=>console.log(error),
        ()=>{
          console.log('completd misproducts',this.misproductos);
        }
        );
  }else{
    this.misproductos=[];
  }
}

cambiaEstadoProducto(producto){
    let index = this.misproductos.indexOf(producto.id);
    if (index < 0){
       this.addProducto(producto);
    }else{
        this.quitaProducto(producto.id);
    }
}

addProducto(producto){
    if (this.elementoLimpieza >0){
    let parametros = "&entidad=limpieza_productos_elemento";
    let itemProducto = new myprods(0,this.empresasService.seleccionada,producto.id,this.elementoLimpieza);
      this.servidor.postObject(URLS.STD_ITEM, itemProducto, parametros).subscribe(
        response => {
          if (response.success) {
            let indice = this.productos.findIndex((prod) => prod.id == producto.id);
            //console.log(indice);
            this.productos[indice].estado =1;
          }
      });
    }else{
        this.misproductos.push(producto.id);
            let indice = this.productos.findIndex((prod) => prod.id == producto.id);
            this.productos[indice].estado =1;
    }
}


setProductos(accion){
    if(accion=='save' && this.elementoLimpieza == 0) this.selectedProductsChange.emit(this.misproductos);
    this.viewProducts = !this.viewProducts;
    if (this.viewProducts) this.getProductos();
}

quitaProducto(id){
     if (this.elementoLimpieza >0){
    let parametros = '?id=' + id+"&entidad=limpieza_productos_elemento";
      this.servidor.deleteObject(URLS.STD_ITEM, parametros).subscribe(
        response => {
          if (response.success) {
           let indice = this.productos.findIndex((prod) => prod.id == id);
            this.productos[indice].estado =-1;
          }
      });
     }else{
         let indice = this.misproductos.indexOf(id);
         this.misproductos.splice(indice,1);
            let index = this.productos.findIndex((prod) => prod.id == id);
            this.productos[index].estado =-1;
      }
}
}