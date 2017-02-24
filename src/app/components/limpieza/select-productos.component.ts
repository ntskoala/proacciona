import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';


@Component({
  selector: 'select-productos',
  templateUrl: './select-productos.component.html',
  styleUrls:['limpieza.component.css']
  
})

export class SelectProductosComponent implements OnInit, OnChanges{
@Input() selectedProducts:string;
@Output() selectedProductsChange:EventEmitter<string>=new EventEmitter<string>();
@Input() productos:string[]=[];
private misproductos:string[]=[];
private viewProducts:boolean=false;
  constructor() {}

  ngOnInit() {
      if(this.selectedProducts) {
          try{
          this.misproductos = JSON.parse(this.selectedProducts);
          }
          catch (e){
              console.log(e)
          }
      }
  }
  ngOnChanges(){     
  }

addProducto(producto){
    let index = this.misproductos.indexOf(producto);
    if (index < 0){
        this.misproductos.push(producto);
    }else{
        this.misproductos.splice(index,1);
    }
    console.log(this.misproductos)
}


setProductos(accion){
    if(accion=='save') this.selectedProductsChange.emit(JSON.stringify(this.misproductos));
    this.viewProducts = !this.viewProducts;
}

}