import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';

import * as moment from 'moment/moment';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from '@ngx-translate/core';


import { EmpresasService } from '../../services/empresas.service';
import { PermisosService } from '../../services/permisos.service';
import { Servidor } from '../../services/servidor.service';
import { Empresa } from '../../models/empresa';
import { ProduccionOrden } from '../../models/produccionorden';
import { Modal } from '../../models/modal';
import { URLS,cal,dropDownMedidas } from '../../models/urls';
import { Almacen } from '../../models/almacenes';
import { ProductoPropio } from '../../models/productopropio';
import { HttpHandler } from '@angular/common/http';
import { ifError } from 'assert';
// import { ProduccionDetalle } from '../../models/producciondetalle';

@Component({
  selector: 'ficha-produccion',
  templateUrl: './ficha-produccion.component.html',
  styleUrls:['./produccion.css']
})
export class FichaProduccionComponent implements OnInit, OnChanges {
//*** STANDARD VAR
@Input() orden: ProduccionOrden;
// @Output() itemSeleccionado: EventEmitter<ProduccionOrden> = new EventEmitter<ProduccionOrden>();
@Output() onUpdateOrden: EventEmitter<ProduccionOrden> = new EventEmitter<ProduccionOrden>();
// @Output() onMateriasPrimas:EventEmitter<ProduccionDetalle[]>= new EventEmitter;
@Output() onHeightChanged: EventEmitter<string>=new EventEmitter<string>();


//*** ESPECIFIC VAR */
public modo: string;
public es:any;
public trazabilidad: boolean;
public trazabilidadAd:boolean;
public almacenesDestino: Almacen[];
public productos: ProductoPropio[]=[];
//public medidas: string[]=['Kg.','g.','l.','ml.','unidades'];
public medidas:object[]=dropDownMedidas;
public url; 
public baseurl;
public foto;
public image='./assets/images/viewpdf.jpeg';
public receta:ProductoPropio=null;
public alergenos:string[]=[];
public parentAlergenos:string='alergenos';
public trigger:number=0;
public alturaTraza:string='0px';
public heightTraza:string='1200px';
  constructor(
    public empresasService: EmpresasService, 
    public servidor: Servidor,
    public messageService: MessageService,
    public translate: TranslateService,
    public permisos: PermisosService
    ) {}

  ngOnInit() {
    this.empresasService.alergenos.subscribe((alergenos)=>{this.repasarAlergenos(alergenos)});
    this.empresasService.productosPropiosChanges.subscribe((valor)=>{this.getProductos();})
    console.log('ORDEN',this.orden);
    console.log('ORDEN',(this.orden.idproductopropio));

    this.getProductos();
    this.getAlmacenes();
    this.es=cal;
    this.baseurl = URLS.DOCS + this.empresasService.seleccionada + '/produccion_orden/';
    this.url = this.baseurl + this.orden.id +'_'+this.orden.doc;
    try{
    this.alergenos=JSON.parse(this.orden.alergenos);
    this.trigger = Math.random();
    }catch(e){
      console.log('ERROR',e);
    }

  }
  
  ngOnChanges(){
console.log(this.orden.idproductopropio);

    if (!moment(this.orden.fecha_inicio).isValid()) this.orden.fecha_inicio = null;
    if (!moment(this.orden.fecha_fin).isValid()) this.orden.fecha_fin = null;
    if (!moment(this.orden.fecha_caducidad).isValid()) this.orden.fecha_caducidad = null;
    this.url = this.baseurl + this.orden.id +'_'+this.orden.doc;
    try{
      this.alergenos=JSON.parse(this.orden.alergenos);
      this.trigger = Math.random();
      }catch(e){
        console.log('ERROR',e);
        this.alergenos=[];
      }
  }
  
cambiarTab(){}

updateItem(orden: ProduccionOrden){
 orden.id =this.orden.id;
 orden.idempresa = this.empresasService.seleccionada;
 orden.fecha_inicio = new Date(Date.UTC(orden.fecha_fin.getUTCFullYear(),orden.fecha_fin.getMonth(),orden.fecha_fin.getDate()));
 orden.fecha_fin = new Date(Date.UTC(orden.fecha_fin.getUTCFullYear(),orden.fecha_fin.getMonth(),orden.fecha_fin.getDate()));
 orden.fecha_caducidad = new Date(Date.UTC(orden.fecha_caducidad.getUTCFullYear(),orden.fecha_caducidad.getMonth(),orden.fecha_caducidad.getDate()));
let param = "&entidad=produccion_orden";
let parametros = '?id=' + orden.id+param;     
    this.servidor.putObject(URLS.STD_ITEM,parametros, orden).subscribe(
      response => {
        if (response.success) {
          console.log("updated");
          this.orden=orden;
          this.trigger = Math.random() *10;
          this.onUpdateOrden.emit(orden);
          this.setAlerta('alertas.saveOk');
          //let index = this.items.findIndex((elem) =>elem.id == this.itemActivo);
          //this.items[index].nombre = this.nuevoNombre;
          //this.listaZonas.emit(this.limpiezas);
          //this.modificaItem = false;
        }
    });
}

getAlmacenes() {
    
    let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=almacenes";

        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            //this.itemActivo = 0;
            // Vaciar la lista actual
            this.almacenesDestino = [];
            this.almacenesDestino.push(new Almacen(0,0,'Selecciona',0,0,0));
            if (response.success == 'true' && response.data) {
              for (let element of response.data) {
                this.almacenesDestino.push(new Almacen(element.id,element.idempresa,element.nombre,element.capacidad,element.estado,element.idproduccionordenactual,element.level));
              }
             // this.listaZonas.emit(this.limpiezas);
            }
        });
   }

getProductos(){
         let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=productos"; 
        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            this.productos = [];
            this.productos.push(new ProductoPropio('Selecciona...',null,null,null,0,null,null,null));
            if (response.success && response.data) {
              for (let element of response.data) { 
                  this.productos.push(new ProductoPropio(element.nombre,element.descripcion,element.alergenos,element.doc,element.id,element.idempresa,element.cantidadReceta,element.tipo_medida));
             }
            }
        },
        error=>console.log(error),
        ()=>{}
        ); 
}

setIdProductoPropio(id: number){
  console.log(id);
  let i = this.productos.findIndex((prod) => prod.id==id)
  if (i>=0) {
  this.orden.nombre = this.productos[i].nombre;
  this.alergenos=[];
  try{
    this.alergenos=JSON.parse(this.productos[i].alergenos);
    this.setAlerta('alertas.alergenosResetProductos');
    }catch(e){
      console.log('ERROR',e);
    }
  this.orden.alergenos=this.productos[i].alergenos;
  this.updateItem(this.orden);
  }
}

seleccionarDestino(valor){
  this.orden.idalmacen = this.almacenesDestino[valor].id;
}

trazabilidadAtras(){
  this.modo = 'atras';
this.trazabilidad= !this.trazabilidad;
}
trazabilidadAdelante(){
  this.modo = 'adelante';
  this.trazabilidad= !this.trazabilidad;
// this.trazabilidadAd= !this.trazabilidadAd;
}


verFoto(foto:string){
  //this.verdoc =  true;
  if (this.orden.doc){
  this.foto=this.url;
  }
}


uploadFunciones(event:any,field?:string) {
  var target = event.target || event.srcElement; //if target isn't there then take srcElement
  let files = target.files;
  console.log(target);
  field='doc';
  //let files = event.srcElement.files;
  let idEmpresa = this.empresasService.seleccionada.toString();
  this.servidor.postDoc(URLS.UPLOAD_DOCS, files,'produccion_orden', this.orden.id.toString(), this.empresasService.seleccionada.toString(),field).subscribe(
    response => {
      console.log('doc subido correctamente');
        this.orden.doc = files[0].name;
        this.url = this.baseurl + this.orden.id +'_'+this.orden.doc;          
      // let activa = this.empresas.find(emp => emp.id == this.empresasService.seleccionada);
      // activa.logo = '1';
    }
  )
}


setAlerta(concept:string){
  let concepto;
  this.translate.get(concept).subscribe((valor)=>concepto=valor)  
  this.messageService.clear();this.messageService.add(
    {severity:'warn', 
    summary:'Info', 
    detail: concepto
    }
  );
}


aplicarReceta(){
  console.log('**APLICAR RECETA**');
  let index=this.productos.findIndex((prod)=>prod.id==this.orden.idproductopropio)
  if (index > -1){
    this.receta=this.productos[index];
  }  
}





ingredientesAnadidos(procesed){
  let ALmateriasPrimas = procesed['alergenos'];
  this.orden.cantidad=procesed['cantidad'];
  this.orden.remanente=procesed['cantidad'];
  this.orden.tipo_medida=procesed['tipo_medida'];
console.log('####',ALmateriasPrimas);
this.addAlergias(ALmateriasPrimas);

// let alergenosOrden = this.alergenos;
// ALmateriasPrimas.forEach((alergeno)=>{
//   if (alergenosOrden.findIndex((alergia)=>alergia==alergeno) ==-1){
//     alergenosOrden.push(alergeno);
//   }
// });
// this.orden.alergenos=JSON.stringify(alergenosOrden);
// this.updateItem(this.orden);
// try{
//   this.alergenos=JSON.parse(this.orden.alergenos);
//   }catch(e){
//     console.log('ERROR',e);
//   }
}

selectedAlergenosChange(event){
console.log(event);

//this.repasarAlergenos(event);
}


repasarAlergenos(alergenos){

  console.log('repasar alergenos',alergenos);
  if(alergenos['accion']=='remove'){
    this.removeAlergias(alergenos['alergenos']);
  }else{
    try{
    let alergias = JSON.parse(alergenos['alergenos']);
    this.addAlergias(alergias);
    }catch(e){
      console.log('ERROR PARSING ALERGIAS',e)
    }
  }
}


addAlergias(alergias){
  alergias.forEach((alergia:string) => {
    let tipo = alergia.substr(0,3);
    let ingrediente = alergia.substring(4);
    let indexTrz= this.alergenos.findIndex((alergeno)=> alergeno == 'Trz ' + ingrediente);
    let indexIng= this.alergenos.findIndex((alergeno)=> alergeno == 'Ing ' + ingrediente);
    console.log(tipo,alergia,ingrediente,indexTrz,indexIng);
    if (tipo=='Ing'){
      if (indexTrz > -1) this.alergenos.splice(indexTrz,1);
      if (indexIng == -1) this.alergenos.push(alergia);
    }else{
      if (indexIng == -1 && indexTrz == -1) this.alergenos.push(alergia);
    }
  });

 this.setAlerta('alertas.alergenosAñadidos');
 console.log('ALERGENOS',this.alergenos);
 console.log('THIS.ORDEN.ALERGENOS',this.orden.alergenos)
this.orden.alergenos=JSON.stringify(this.alergenos);
this.updateItem(this.orden);
// this.parentAlergenos='';
// this.parentAlergenos='alergenos';
}


removeAlergias(alergias){
  console.log('QUITAR ALERGENOS',alergias);
  let i = this.productos.findIndex((prod) => prod.nombre==this.orden.nombre)
  let alergiasProducto=[]
  if (i>=0) {
  alergiasProducto = JSON.parse(this.productos[i].alergenos);
  }
  if (alergias){
  let AlergenosParaQuitar = []
  let AlergenosParaAnadir = []
  alergias.forEach((alergia)=>
  {
    let tipo = alergia.substr(0,3);
    let ingrediente = alergia.substring(4);
    let indexTrz= alergiasProducto.findIndex((alergenoRem)=> alergenoRem == 'Trz ' + ingrediente);
    let indexIng= alergiasProducto.findIndex((alergenoRem)=> alergenoRem == 'Ing ' + ingrediente);
    if (tipo=='Ing') {
      if(indexIng<0 && indexTrz<0) AlergenosParaQuitar.push(alergia);
      if(indexIng<0 && indexTrz>=0) {
        AlergenosParaQuitar.push(alergia);
        AlergenosParaAnadir.push(alergiasProducto[indexTrz]);
      }
    }else{
      if (indexIng<0 && indexTrz<0) AlergenosParaQuitar.push(alergia);
    }
  });
  console.log('ALERGENOS PRODUCTO',this.productos[i],alergiasProducto);
  console.log('ALERGENOS',this.alergenos);
  console.log('THIS.ORDEN.ALERGENOS',this.orden.alergenos)
  console.log('ALERGENOS PARA QUITAR',AlergenosParaQuitar);
  let alergenos=JSON.parse(this.orden.alergenos)
  AlergenosParaQuitar.forEach((alergia)=>{
    let indiceQuitar = alergenos.findIndex((alg)=>alg==alergia);
    alergenos.splice(indiceQuitar,1);
  })
  AlergenosParaAnadir.forEach((alergia)=>{
    if (this.alergenos.findIndex((alg)=>alg==alergia)==-1)
    alergenos.push(alergia);
  })
  this.alergenos=alergenos;
  this.orden.alergenos=JSON.stringify(this.alergenos);
  this.updateItem(this.orden);
}
}

// updateCantidades(evento){
// console.log('********',evento);
// this.orden.cantidad=evento;
// this.orden.remanente=evento;
// this.orden.tipo_medida=this.receta.tipo_medida;
// this.updateItem(this.orden);
// }

// expandingTree(event?){
// console.log('expandTree',event)
// }

doSomethingOnWindowScroll(evento:any){
console.log("window scroll2 ",evento);
 let scrollOffset = evento.srcElement.children[0].scrollTop;
         console.log("window scroll1: ", scrollOffset);
         this.alturaTraza = '-'+scrollOffset+'px';
}
changeTrazaHeight(event){
  console.log("height ",event);
  let calculoheight = 300 +parseInt(event);

  this.heightTraza=calculoheight+'px';
  console.log("height ",this.heightTraza);
  this.onHeightChanged.emit(this.heightTraza);
}


}