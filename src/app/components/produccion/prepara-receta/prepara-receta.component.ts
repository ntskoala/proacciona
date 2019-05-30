import { Component, OnInit,Input,Output,EventEmitter, OnChanges } from '@angular/core';

import { EmpresasService } from '../../../services/empresas.service';
import { Servidor } from '../../../services/servidor.service';
import {MessageService} from 'primeng/components/common/messageservice';
// import {MessageService} from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { ProductoPropio } from '../../../models/productopropio';
import { ProduccionOrden } from '../../../models/produccionorden';
import { URLS } from '../../../models/urls';
import { Receta } from '../../../models/recetas';
import { ProveedorLoteProducto } from '../../../models/proveedorlote';
import { ProduccionDetalle } from '../../../models/producciondetalle';

import * as moment from 'moment/moment';


@Component({
  selector: 'app-prepara-receta',
  templateUrl: './prepara-receta.component.html',
  styleUrls: ['./prepara-receta.component.css']
})
export class PreparaRecetaComponent implements OnInit {
  @Input() receta:ProductoPropio;
  @Input() orden:ProduccionOrden;
  @Output() onBotonCerrar:EventEmitter<boolean>= new EventEmitter;
  @Output() onProcesed:EventEmitter<ProduccionDetalle[]>= new EventEmitter;

  public ingredientes:Receta[];
  public lotes:ProveedorLoteProducto[];
  public lotesIng:ProveedorLoteProducto[][]=[];
  public loteSelected:any[][]=[];
  public semaforo:string='ambar';
  public alertas:string[]=[];
  public proveedores: any[]=[];
  public ingredientesReceta:any[];
  // public nuevoItem: ProduccionDetalle = new ProduccionDetalle(0,0,null,null,null,null,0,0,'');
  // public passItem: ProduccionDetalle;
  public items: ProduccionDetalle[]=[];
  public cocinado:boolean=false;
  //********************PDF */
  public setIng:boolean=true;
  public pdfSrc: string=null;
  public paginaPdf:number=1;
  public maxPdf:number=1;
  public zoomPdf:number=1;
  //********************PDF */

  constructor(
    public empresasService: EmpresasService, 
    public translate: TranslateService, 
    private messageService: MessageService,
    public servidor:Servidor
  ) { }

  ngOnInit() {
    console.log('Receta',this.receta);
    console.log('Orden',this.orden);
    this.checkPdf();
    this.getProveedores();
    this.getIngredientes().then((resultado)=>{
      if(resultado){
        console.log('INGREDIENTES',this.ingredientes);
        this.procesaIngredientes();
      }else{
        console.log('No se han cargado ingredientes');
      }
    })
  }
  ngOnChanges(){
  }
  cerrar(){
    this.onBotonCerrar.emit(true);
  }
  getProveedores(){
    let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=proveedores"; 
   this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
     response => {
       this.proveedores = [];
       // this.proveedores.push({"id":null,"nombre":"Selecciona"})
       this.proveedores.push({"value":0,"label":"Interno"})
       if (response.success && response.data) {
         for (let element of response.data) { 
             this.proveedores.push({"value":element.id,"label":element.nombre});
        }
       }
   },
   error=>console.log(error),
   ()=>{}
   ); 
}

  getIngredientes(){
    return new Promise((resolve)=>{
    console.log('setting items...');
     let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=Recetas&WHERE=idProducto="+this.orden.idproductopropio+"&order=numIngrediente ASC"; 
       this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
         response => {
           this.ingredientes = [];
           if (response.success && response.data) {
             for (let element of response.data) { 
                 this.ingredientes.push(new Receta(element.id,element.idEmpresa,element.idProducto,element.idProveedor,element.idMateriaPrima,element.numIngrediente,element.cantidad,element.tipo_medida,element.preferencia,element.nombreMP));
                 this.loteSelected.push([]);
            }
            resolve(true)
           }
       },
       error=>{
         console.log(error);
         resolve(false);
        },
       ()=>{}
       );
      })
 }

procesaIngredientes(){
  // this.lotes = [];
  let x=0;
  let y=1;
  this.ingredientes.forEach((ingrediente)=>{
    x= ingrediente.numIngrediente;
    if (this.lotesIng[x]==undefined) this.lotesIng[x]=[];
    this.getLotes(ingrediente.idMateriaPrima, ingrediente.idProveedor,x).then(
      (valor)=>{
        console.log('PROCESA INGREDIENTES',y,this.ingredientes.length)
        if (y>=this.ingredientes.length){
          setTimeout(()=>{
            this.procesarLotes();
          },1000);
        }
        y=y+1;
      });
      //x++
  });
  console.log(this.lotes);
}

getLotes(idMateriaPrima,idProveedor,x){
  return new Promise((resolve)=>{
  console.log('GETTING LOTES OF:',idMateriaPrima,idProveedor);
  let entidad:string="&entidad=proveedores_entradas_producto";
  let field:string="&field=idproducto&idItem=";//campo de relación con tabla padre
  let where="&WHERE=canitad_remanente>0";
  let filterDates="&filterdates=true&fecha_field=fecha_caducidad&fecha_inicio="+ moment().format("YYYY-MM-DD") +  "&fecha_fin="+moment().add(5,"years").format("YYYY-MM-DD");
  let  parametros = '&idempresa=' + this.empresasService.seleccionada+entidad+field+idMateriaPrima+filterDates+"&order=fecha_caducidad ASC"; 
  
  // let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+this.field+this.proveedor.id; 
     this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
       response => {
         if (response.success && response.data) {
           for (let element of response.data) { 
              //  this.lotes.push(new ProveedorLoteProducto(element.numlote_proveedor,new Date(element.fecha_entrada),new Date(element.fecha_caducidad),element.cantidad_inicial,element.tipo_medida,element.cantidad_remanente,element.doc,element.idproducto,element.idproveedor,element.idempresa,element.id));
               this.lotesIng[x].push(new ProveedorLoteProducto(element.numlote_proveedor,new Date(element.fecha_entrada),new Date(element.fecha_caducidad),element.cantidad_inicial,element.tipo_medida,element.cantidad_remanente,element.doc,element.idproducto,element.idproveedor,element.idempresa,element.id));
               this.loteSelected[x].push(0);
          }
          resolve(x);
         }else{
          if (this.lotesIng[x].length==0) this.lotesIng[x].push(new ProveedorLoteProducto(null,null,null,null,null,0,null,null,null,null,null));
          resolve(x);          
         }
     },
     error=>{
       resolve(false);
       console.log(error)}
       ,
     ()=>{}
     );
    });
}

procesarLotes(){
  console.log('***********************DogetLotes');
  this.ingredientesReceta=[];
  let x=0;
  this.lotesIng.forEach((lote)=>{
    if (lote.length==0) lote.push(new ProveedorLoteProducto(null,null,null,null,null,0,null,null,null,null,null));
    console.log('#',lote);
    let CantidadTotalLotes = lote.map((lote)=>{return lote.cantidad_remanente}).reduce((a,b)=>{return parseInt(a.toString())+parseInt(b.toString())});
    console.log('***********************',this.ingredientes[x].cantidad, CantidadTotalLotes);
  if (parseInt(this.ingredientes[x].cantidad.toString()) > parseInt(CantidadTotalLotes.toString())){
    this.semaforo='rojo';
    let alerta= 'No hay suficiente ' + this.ingredientes[x].nombreMP + ' para preparar la receta, total disponible: ' + CantidadTotalLotes + ' necesitas: ' +this.ingredientes[0].cantidad;
    //this.setAlerta(alerta);
    this.alertas.push(alerta);
  }else{
    //********PREPARA LOS LOTES A AÑADIR */
    let falta:number=parseInt(this.ingredientes[x].cantidad.toString());
    for(let y=0;falta>0;y++){
      let cantidadLote= 0;
      if(lote[y].cantidad_remanente >falta){
        this.ingredientesReceta.push({'ingrediente':x,'lote':y,'cantidad':falta});
        falta=0;
      }else{
        this.ingredientesReceta.push({'ingrediente':x,'lote':y,'cantidad':lote[y].cantidad_remanente});
        falta=falta-lote[y].cantidad_remanente;
      } 
    }
  }
  x++;
  });
  console.log('@@@@@@@@@@@@@@@@@@@@@@',this.ingredientesReceta);
  this.indicaIngredientes();
  //this.proceed();
 
}

indicaIngredientes(){
  console.log(this.loteSelected);
  this.ingredientesReceta.forEach((ing)=>{
    // this.newItem(this.ingredientes[ing['ingrediente']],this.lotesIng[ing['ingrediente']][ing['lote']],ing['cantidad'])
    this.loteSelected[ing['ingrediente']][ing['lote']]=ing['cantidad'];
    console.log(this.loteSelected);
  });
  if (this.semaforo=='verde' || this.semaforo=='ambar'){
    this.alertas.push('preparado');
  }
}

proceed(){
  console.log('Procediendo con los ingredientes...');
  if (this.semaforo=='verde' || this.semaforo=='ambar'){
    this.ingredientesReceta.forEach((ing)=>{
      this.newItem(this.ingredientes[ing['ingrediente']],this.lotesIng[ing['ingrediente']][ing['lote']],ing['cantidad'])
    })
    this.cocinado=true;
    console.log('ITEMS',this.items);
    this.alertas.push('cocinado');
    this.onProcesed.emit(this.items);
  }else{
    this.alertas.push('No se ha podido procesar');
  }
}


  newItem(ingrediente:Receta,lote: ProveedorLoteProducto, cantidad) {
    let nuevoItem: ProduccionDetalle= new ProduccionDetalle(0,0,null,null,null,null,0,0,'');
    let entidad:string="&entidad=produccion_detalle";
    let field:string="&field=idorden&idItem=";//campo de relación con tabla padre
    let param = entidad+field+this.orden.id;
    nuevoItem.id =0;
    nuevoItem.idorden = this.orden.id;
    nuevoItem.proveedor = this.proveedores[this.proveedores.findIndex((prov)=>prov.value==lote.idproveedor)].label;
    nuevoItem.producto = ingrediente.nombreMP
    nuevoItem.numlote_proveedor = lote.numlote_proveedor
    nuevoItem.idmateriaprima= lote.id
    nuevoItem.idloteinterno = 0;
    nuevoItem.cantidad=cantidad;
    // if (this.entrada_productos[index_entrada_productos].tipo == "lote_interno"){
    //  this.nuevoItem.idloteinterno = this.nuevoItem.idmateriaprima;
    // this.nuevoItem.idmateriaprima = 0;
    // }

    //let cantidad = cantidad;
    nuevoItem.cantidad_remanente_origen = lote.cantidad_remanente - cantidad;    
    nuevoItem.cantidad_real_origen = lote.cantidad_remanente;  
    nuevoItem.tipo_medida = ingrediente.tipo_medida;

    
    //this.nuevoItem.idempresa = this.empresasService.seleccionada;
    //this.addnewItem = this.nuevoItem;
    this.servidor.postObject(URLS.STD_ITEM, nuevoItem,param).subscribe(
      response => {
        if (response.success) {
          // passItem = nuevoItem;
          nuevoItem.id=response.id;
          this.items.push(nuevoItem);
          this.items[this.items.length-1].id= response.id;
          // passItem.id = response.id;
          this.setRemanente(nuevoItem);
          // this.nuevoItem = new ProduccionDetalle(0,0,null,null,null,null,0,0,'');
        }
    },
    error =>console.log(error),
    () =>{}   
    );
  }

setRemanente(detalleProduccion: ProduccionDetalle){
  console.log("setRemanente",detalleProduccion)
  if (detalleProduccion.idmateriaprima >0){
        let parametros = '&idempresa=' + this.empresasService.seleccionada+"&idmateriaprima="+detalleProduccion.idmateriaprima+"&cantidad="+detalleProduccion.cantidad; 
        this.servidor.getObjects(URLS.UPDATE_REMANENTE, parametros).subscribe(
          response => {
            if (response.success && response.data) {
              console.log('updated');
             }
        },
        error=>console.log(error),
        ()=>{}
        ); 
  }else{
    let value = "*`remanente`- "+detalleProduccion.cantidad;
     let  orden = {'remanente':value}
      let param = "&entidad=produccion_orden";
      let parametros = '?id=' + detalleProduccion.idloteinterno+param;     
          this.servidor.putObject(URLS.STD_ITEM,parametros, orden).subscribe(
            response => {
             if (response.success) {
              console.log('updated');
             }
          });

  }
}





setAlerta(concept:string){
  let concepto;
  this.translate.get(concept).subscribe((valor)=>concepto=valor)  
  this.messageService.clear();
  this.messageService.add(
    {severity:'error', 
    summary:'Error', 
    detail: concepto,
    }
  );
}

//********************PDF */
//********************PDF */
//********************PDF */
checkPdf(){
  if(this.receta.doc && this.receta.doc.substr(this.receta.doc.length-3,3)=='pdf'){  
    let baseurl = URLS.DOCS + this.empresasService.seleccionada + '/productos/';
    this.pdfSrc = baseurl + this.receta.id +'_'+this.receta.doc;
    
  }else{
    this.pdfSrc = null;
}
this.pdfSrc = "assets/demos/receta.pdf";
}
  PageAnterior(){
    if (this.paginaPdf >1)
    this.paginaPdf--
  }
  PageSiguiente(){
    if (this.paginaPdf < this.maxPdf)
    this.paginaPdf++;
  }
  onPDFError(event){
  console.log('ERROR PDF:',event)
  }
  onProgress(event){
    console.log('Progress',event)
  }
  zoomIn(){
  this.zoomPdf+=0.2
  }
  zoomOut(){
    this.zoomPdf-=0.2
  }
  pdfLoaded(event){
    console.log('Loaded',event)
    this.maxPdf = event._pdfInfo.numPages;
  }
}
