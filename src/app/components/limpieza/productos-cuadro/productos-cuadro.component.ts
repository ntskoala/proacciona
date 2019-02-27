import { Component, OnInit,OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';


import { EmpresasService } from '../../../services/empresas.service';
import { Servidor } from '../../../services/servidor.service';
import { URLS } from '../../../models/urls';
import { Usuario } from '../../../models/usuario';
import { LimpiezaProducto } from '../../../models/limpiezaproducto';
import { LimpiezaElemento } from '../../../models/limpiezaelemento';

export class Permiso {
  constructor(
    public id: number,
    public idItem: number,
    public idusuario: number,
    public idempresa: number
  ) { }
}
export class Control {
  constructor(
    public id: number,
    public nombre: string,
    public idfamilia: number,
    public familia: string
  ) { }
}

@Component({
  selector: 'app-productos-cuadro',
  templateUrl: './productos-cuadro.component.html',
  styleUrls: ['./productos-cuadro.component.css']
})
export class ProductosCuadroComponent implements OnInit, OnChanges {
  //@Input() limpieza: number;
  //@Input() supervisor: number;
  @Input() items: LimpiezaElemento[];
  @Input() tipoControl;
  @Input() productos: LimpiezaProducto[];
  @Output() onPermisos: EventEmitter<number> = new EventEmitter<number>();
  //public observer: Observable<string>;

  public viewPermisos: boolean = false;
  public usuarios: Usuario[] = [];
  //public controles: Control[];
  //public productos: LimpiezaProducto[] = [];
  public producto: LimpiezaProducto;
  //public plan: PermissionUserPlan;
  public limpieza: LimpiezaElemento;
  public hayproducto: any[] = [];
  public misproductos:any[]=[];
  public tabla: object[];
  public cols: object[];
  public procesando: boolean = false;
  public cargaData: boolean[] = [false, false];
  public entidad: string = "&entidad=limpieza_elemento";
  public field: string = "&field=idlimpiezazona&idItem=";
  public ancho:string;
  constructor(public servidor: Servidor, public empresasService: EmpresasService) { }

  ngOnInit() {

  }

  ngOnChanges(){
    if (this.items){
      let num = 100+(this.items.length * 37)
      this.ancho = num + 'px';
    let x = 0;
    let i=0;
    if (this.productos && this.items){
      this.procesando = true;
    this.items.forEach((elementoLimpieza)=>{

      this.getMisProductos(elementoLimpieza.id,x).then(
        (response) =>{
          i++;
          
          if (i == this.items.length){
            
            this.mergeData();
            this.procesando=false;
            console.log(this.misproductos)
           }
        }
      )
      x++;
     

    });
    // this.setHayProductos().then(
    //   (resultado)=>{
    //     if (resultado)
    //     this.mergeData();
    //   });
    }
  }
  }


  getMisProductos(idElementoLimpieza,x){
    return new Promise((resolve, reject) => {
    this.hayproducto[x] = [];
    this.misproductos[x] = [];
  if (this.items ){
          let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=limpieza_productos_elemento"+"&field=idelemento&idItem="+idElementoLimpieza; 
        this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
          response => {
             
            if (response.success && response.data) {
              for (let element of response.data) {  
                this.misproductos[x].push(element.id)
                  this.hayproducto[x].push(element.idproducto);
             }
                resolve(x);
            }else{
              resolve(x);
            }
        },
        error=>console.log(error),
        ()=>{
          
        }
        );
  }else{
    //this.hayproducto[x]=[];
    resolve(x);
  }
    });
}




  mergeData() {
    console.log('###Merging Prods',this.hayproducto);
    this.tabla = [];
    this.cols = [];
    this.cols.push({ field: 'producto', header: 'Producto' });
    this.items.forEach(control => {
      this.cols.push({ field: control.nombre, header: control.nombre })
    });
    
    this.productos.forEach(producto => {
      let generalSwitch = true;
      let row = '{"producto":"' + producto.nombre + '","idproducto":"' + producto.id + '"'
      let x =0;
      this.items.forEach(control => {
        let valor;

          //console.log('*',miArray,miArray[0],producto.id,typeof(producto.id),typeof(miArray),typeof(miArray[0]),miArray[0]==producto.id);
        
        if (this.hayproducto[x]){
         // console.log('hayprod',x);
        valor = this.hayproducto[x].findIndex((prod)=>
          prod == producto.id
        );
      
        }else{
         // console.log('no hayprod');
          valor = -1;
        }
        //console.log('*',x,valor,this.hayproducto[x],producto.id,typeof(producto.id));
        x++;
       let check: boolean;
        if (valor < 0) {
          check = false;
          generalSwitch = false;
        } else {
          check = true
        };
        row += ',"' + control.nombre + '":' + check + ''
      });
      row += ',"generalSwitch":' + generalSwitch + '}';
      this.tabla.push(JSON.parse(row))

    })
    this.procesando = false;
    console.log(this.tabla)
  }


  setPermiso(idproducto, event, indexProd,col?) {
    console.log(idproducto,event,col);
    this.procesando = true;
    if (col) {
      let index = this.items.findIndex((control) => control.nombre == col);
      let index2 = this.hayproducto[index].findIndex((prod)=>prod==idproducto);
      if (index >= 0) {
        let idControl = this.items[index].id;
        console.log(idproducto, col, idControl, event, index,indexProd,index2)
        if (event) {
          this.addPermiso(idproducto, idControl, index).then(
            (valor) => {
              console.log(valor)
              this.switchGeneral(idproducto)
              this.procesando = false;
            }
          )
        } else {
          this.deletePermiso(idproducto, idControl, index,index2).then(
            (response) => {
              this.switchGeneral(idproducto)
              this.procesando = false;
            }
          )
        }
      }
    } else {
      let index = 0;
      this.items.forEach(control => {
        let existe = this.hayproducto[index].findIndex((hayprod)=>hayprod==idproducto)
        console.log (idproducto, control['id'],index,existe,this.hayproducto[index],event);
        if (event) {
          if (existe == -1) {
            this.addPermiso(idproducto, control['id'],index).then(
              (response) => {
                this.switch(idproducto, control['id'], true);
              });
          }
        } else {
          if (existe >= 0) {
            this.deletePermiso(idproducto, control['id'],index,existe).then(
              () => {
                this.switch(idproducto, control['id'], false);
              }
            )
          }
        }
       index++; 
      });
      setTimeout(() => {
        this.procesando = false;
      }, 900);
    }
  }

   addPermiso(idProducto, idElementoLimpieza,index) {
     return new Promise((resolve, reject) => {

    let prod = {'idempresa':this.empresasService.seleccionada,'idelemento':idElementoLimpieza,'idproducto':idProducto};
    console.log(idProducto,prod);

          let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=limpieza_productos_elemento"+"&field=idelemento&idItem="+idElementoLimpieza; 
        this.servidor.postObject(URLS.STD_SUBITEM, prod, parametros).subscribe(
        response => {
          if (response.success) {
            this.misproductos[index].push(response.id);
            this.hayproducto[index].push(idProducto);
            let indice = this.tabla.findIndex((prod) => prod['idproducto'] == idProducto);
            let nombre = this.items[this.items.findIndex((control) => control.id == idElementoLimpieza)].nombre;
            this.tabla[indice][nombre] = true;
            console.log("productos", idProducto);
            resolve('productos ok');
          } else {
            console.log('no se asigno elproducto', response)
          }
        },
        error => {
          resolve(error);
          console.log(error)
        },
        () => {
        }
      );
     }
     );
   }

   deletePermiso(idProducto, idElementoLimpieza,index,indexProd) {
     return new Promise((resolve, reject) => {
      //let valor = this.productos.findIndex((producto) => producto.idusuario == user && producto.idItem == idControl);
      let relacion = this.misproductos[index][indexProd]
      console.log (index,indexProd,this.misproductos,this.misproductos[index][indexProd])
      let parametros = '?id=' + relacion + '&idempresa=' + this.empresasService.seleccionada+"&entidad=limpieza_productos_elemento";
      //let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=limpieza_productos_elemento"+"&field=idelemento&idItem="+idElementoLimpieza; 
      
      this.servidor.deleteObject(URLS.STD_ITEM, parametros).subscribe(
        response => {
          if (response.success) { 
            this.misproductos[index].splice(indexProd, 1);
             this.hayproducto[index].splice(indexProd, 1);
            let indice = this.tabla.findIndex((prod) => prod['idproducto'] == idProducto);
            let nombre = this.items[this.items.findIndex((control) => control.id == idElementoLimpieza)].nombre;
            this.tabla[indice][nombre] = false;
            resolve('productos ok');

          } else {
            console.log('no se cancelo elproducto', response)
            resolve('error');
          }
        });
     });
   }

  switch(idproducto, idControl, estado) {
    console.log(idproducto, idControl, estado)
    let nombreControl = this.items[this.items.findIndex((control) => control.id == idControl)].nombre;
    //let index = this.tabla.findIndex((usuario) => usuario['iduser'] == user);
    let index = this.tabla.findIndex((prod) => prod['idproducto'] == idproducto);
    console.log(nombreControl, index);
    this.tabla[index][nombreControl] = estado;
  }
  switchGeneral(idproducto) {
    let index = this.tabla.findIndex((prod) => prod['idproducto'] == idproducto);
    let generalSwitch = true;
    this.items.forEach(control => {
      console.log(index, control.nombre,this.tabla[index]['producto'], this.tabla[index][control.nombre])
      if (this.tabla[index][control.nombre] == false) generalSwitch = false;
    });
    console.log(this.tabla[index]['generalSwitch'], index, generalSwitch)
    this.tabla[index]['generalSwitch'] = generalSwitch;
  }
}

