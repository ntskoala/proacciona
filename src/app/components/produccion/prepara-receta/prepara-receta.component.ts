import { Component, OnInit,Input,Output,EventEmitter, OnChanges, ViewChild, ElementRef } from '@angular/core';

import { EmpresasService } from '../../../services/empresas.service';
import { Servidor } from '../../../services/servidor.service';
import {MessageService} from 'primeng/components/common/messageservice';
// import {MessageService} from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { ProductoPropio } from '../../../models/productopropio';
import { ProduccionOrden } from '../../../models/produccionorden';
import { URLS } from '../../../models/urls';
import { Receta, Ingrediente } from '../../../models/recetas';
import { ProveedorLoteProducto } from '../../../models/proveedorlote';
import { ProduccionDetalle } from '../../../models/producciondetalle';

import * as moment from 'moment/moment';
declare let jsPDF;

@Component({
  selector: 'app-prepara-receta',
  templateUrl: './prepara-receta.component.html',
  styleUrls: ['./prepara-receta.component.css']
})
export class PreparaRecetaComponent implements OnInit {
  @Input() receta:ProductoPropio;
  @Input() orden:ProduccionOrden;
  @Output() onBotonCerrar:EventEmitter<boolean>= new EventEmitter;
  @Output() onProcesed:EventEmitter<any>= new EventEmitter;
  @ViewChild('printIngredientes') el: ElementRef;


  public ingredientes:Ingrediente[];
  public lotes:ProveedorLoteProducto[];
  public lotesIng:ProveedorLoteProducto[][]=[];
  public materiasPrimas:any[]=[];
  public loteSelected:any[][]=[];
  public semaforo:string='ambar';
  public alertas:string[]=[];
  public proveedores: any[]=[];
  public ingredientesReceta:any[];
  // public nuevoItem: ProduccionDetalle = new ProduccionDetalle(0,0,null,null,null,null,0,0,'');
  // public passItem: ProduccionDetalle;
  public items: ProduccionDetalle[]=[];
  public cocinado:boolean=false;
  public ready:boolean=false;
  public cantidadProduccion:number=null;
  public calc:number=0;
  public alergenos:string[]=[];
  public estado:number=0;
  public printReady:boolean=false;

  //********************PDF */
  public pdfSrc: string=null;
  public pdfIngredientesSrc: string=null;
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

    if(this.orden.cantidad){
      this.cantidadProduccion=this.orden.cantidad;
    }


    this.checkPdf();
    this.getProveedores();
    this.getIngredientes().then((resultado)=>{
      this.estado=20;
      if(resultado){
        console.log('INGREDIENTES',this.ingredientes);
        this.getMateriasPrimas();
      }else{
        console.log('No se han cargado ingredientes');
      }
    })
  }
  ngOnChanges(){
    // this.cantidadProduccion = this.receta.cantidadReceta;
  }
  cerrar(){
    this.onBotonCerrar.emit(true);
  }
  getProveedores(){
    let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=proveedores"; 
   this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
     response => {
       this.proveedores = [];
       this.estado=40;
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

getProv(idproveedor){
return this.proveedores[this.proveedores.findIndex((prov)=>prov.value==idproveedor)].label
}

  getIngredientes(){
    return new Promise((resolve)=>{
    console.log('setting items...');
     let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=Recetas&WHERE=idProducto="+this.orden.idproductopropio+"&order=id ASC"; 
       this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
         response => {
           this.ingredientes = [];
           if (response.success && response.data) {
             for (let element of response.data) { 
               
               let cantidad=0;
               if (this.cantidadProduccion>0) cantidad = element.cantidad;
               console.log(this.cantidadProduccion,cantidad,element.cantidad)
                 this.ingredientes.push(new Ingrediente(element.id,element.idEmpresa,cantidad,element.tipo_medida,element.ingrediente,element.idproducto));
                 
            }
            resolve(true)
           }else{
             this.estado=100;
             this.semaforo='rojo';
             // this.translate.get(['recetas.insuficiente1','recetas.insuficiente2','recetas.insuficiente3']).subscribe((insuficiente)=>{
            console.log('No hay ingredientes en la receta');

             let alerta= 'No hay ingredientes en la receta';
             this.alertas.push(alerta);
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

 getMateriasPrimas(){
  
  let y=1;
  this.materiasPrimas=[];
  this.ingredientes.forEach((ingrediente)=>{
    this.loteSelected.push([]);
    let field:string="&field=ingrediente&idItem='"+ingrediente.ingrediente+"'";//campo de relación con tabla padre
    let  parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=proveedores_productos"+field//"&WHERE=ingrediente=&valor="+ingrediente.ingrediente;
    this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
      response => {
        this.estado=60;
        if (response.success && response.data) {
          for (let element of response.data) { 
              this.materiasPrimas.push({'id':element.id,'idproveedor':element.idproveedor,'nombre':element.nombre,'ingrediente':element.ingrediente,'alergenos':element.alergenos,'stockMinim':element.stockMinim});

              let x = this.ingredientes.findIndex((ingrediente)=>ingrediente.ingrediente==element.ingrediente);
              if (this.lotesIng[x]==undefined) this.lotesIng[x]=[];
              //if (this.loteSelected[x]==undefined) this.loteSelected[x]=[];
              this.getLotes(element.id,element.idProveedor,x,element.nombre).then(
                (respuesta)=>{
                  this.estado=80;
                console.log('getLoteOK',ingrediente.ingrediente,respuesta["x"],respuesta["resultado"])
                if (!respuesta["resultado"]){
                  console.log('NO HAY ',ingrediente.ingrediente)
                  this.ready=false;
                  this.semaforo='rojo';
                  this.translate.get('recetas.sinLotes').subscribe((insuficiente)=>{
                    console.log(insuficiente);
                  let alerta= insuficiente + ingrediente.ingrediente;
                  this.alertas.push(alerta);
                  });
                  // this.alertas.push('No hay lotes disponibles para '+ingrediente.ingrediente)
                }
                if (y>=this.ingredientes.length){
                  setTimeout(()=>{
                    if (this.semaforo!='rojo')
                    //this.ready=true;
                    this.estado=100;
                    },1000);
                }
                y++;
              });
         }
        }else{
          this.ready=false;
          this.estado=100; 
          this.semaforo='rojo';
          // this.translate.get(['recetas.insuficiente1','recetas.insuficiente2','recetas.insuficiente3']).subscribe((insuficiente)=>{
         console.log('No hay Materias Primas disponibles');
          let alerta= 'recetas.sinMP';
          this.alertas.push(alerta);
        }
    },
    error=>{
      console.log(error)}
    );
    // if (this.lotesIng[x]==undefined) this.lotesIng[x]=[];
    // this.getLotes(ingrediente,x).then(
    //   (valor)=>{
    //     console.log('PROCESA INGREDIENTES',y,this.ingredientes.length)
    //     if (y>=this.ingredientes.length){
    //       setTimeout(()=>{
    //         this.procesarLotes();
    //       },1000);
    //     }
    //     y=y+1;
    //   });

  });
  console.log(this.materiasPrimas);
  console.log(this.loteSelected);
 }


getLotes(idMateriaPrima,idProveedor,x,nombreMP){
  return new Promise((resolve)=>{
  console.log('GETTING LOTES OF:',idMateriaPrima,idProveedor,nombreMP);
  let entidad:string="&entidad=proveedores_entradas_producto";
  let field:string="&field=idproducto&idItem=";//campo de relación con tabla padre
  let where="&WHERE=cantidad_remanente>0";
  let filterDates="&filterdates=true&fecha_field=fecha_caducidad&fecha_inicio="+ moment().format("YYYY-MM-DD") +  "&fecha_fin="+moment().add(5,"years").format("YYYY-MM-DD");
  let  parametros = '&idempresa=' + this.empresasService.seleccionada+entidad+field+idMateriaPrima+filterDates+where+"&order=fecha_caducidad ASC"; 
  
  // let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+this.field+this.proveedor.id; 
     this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
       response => {
        let respuesta;
         if (response.success && response.data) {
           for (let element of response.data) { 
              //  this.lotes.push(new ProveedorLoteProducto(element.numlote_proveedor,new Date(element.fecha_entrada),new Date(element.fecha_caducidad),element.cantidad_inicial,element.tipo_medida,element.cantidad_remanente,element.doc,element.idproducto,element.idproveedor,element.idempresa,element.id));
               this.lotesIng[x].push(new ProveedorLoteProducto(element.numlote_proveedor,new Date(element.fecha_entrada),new Date(element.fecha_caducidad),element.cantidad_inicial,element.tipo_medida,element.cantidad_remanente,element.doc,element.idproducto,element.idproveedor,element.idempresa,element.id));
               this.loteSelected[x].push({'cantidad':0,'nombreMP':nombreMP});
               console.log('Hay lotes disponibles', nombreMP, this.loteSelected);
               console.log(this.lotesIng)
          }
          respuesta = {'x':x,'resultado':true}
          resolve(respuesta);
         }else{
          this.loteSelected[x].push({'cantidad':-1,'nombreMP':nombreMP});
          respuesta = {'x':x,'resultado':false}
          console.log('SIN Lotes disponibles');
          if (this.lotesIng[x].length==0) this.lotesIng[x].push(new ProveedorLoteProducto(null,null,null,null,null,0,null,null,null,null,null));
          resolve(respuesta);          
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


process(){
  this.ready=false;
  console.log('Proces');
  this.semaforo='ambar';
  this.cocinado=false;
  this.alertas=[];
  this.calc=1;
  if (this.calc>0){
    this.getIngredientes().then(
      (valor)=>{
        console.log('get Infredientes is ok, valor',valor);
        this.ingredientes.forEach((ingrediente)=>{
          (this.cantidadProduccion!=this.receta.cantidadReceta)? this.calc=1:this.calc=0;
          ingrediente.cantidad = (ingrediente.cantidad*this.cantidadProduccion)/this.receta.cantidadReceta;
        });
        this.procesarLotes();
      });
  }else{
    if (this.cantidadProduccion!=this.receta.cantidadReceta) this.calc=1;
    this.ingredientes.forEach((ingrediente)=>{
      ingrediente.cantidad =  ((ingrediente.cantidad*this.cantidadProduccion)/this.receta.cantidadReceta);
    });
    this.procesarLotes();
  }
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

    this.translate.get(['recetas.insuficiente1','recetas.insuficiente2','recetas.insuficiente3']).subscribe((insuficiente)=>{
      console.log(insuficiente);
    let alerta= insuficiente['recetas.insuficiente1'] + this.ingredientes[x].ingrediente + insuficiente['recetas.insuficiente2'] + CantidadTotalLotes + insuficiente['recetas.insuficiente3'] +this.ingredientes[x].cantidad;
    this.alertas.push(alerta);
    });
  }else{
    //********PREPARA LOS LOTES A AÑADIR */
    let falta:number=parseFloat(this.ingredientes[x].cantidad.toFixed(2));
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
  
}

indicaIngredientes(){
  console.log('LOTE SELECTED',this.loteSelected);
  this.ingredientesReceta.forEach((ing)=>{
    // this.newItem(this.ingredientes[ing['ingrediente']],this.lotesIng[ing['ingrediente']][ing['lote']],ing['cantidad'])
    this.loteSelected[ing['ingrediente']][ing['lote']].cantidad=parseFloat(ing['cantidad']).toFixed(2);
    console.log(this.loteSelected);
  });
  if (this.semaforo=='verde' || this.semaforo=='ambar'){
    this.ready=true;
    this.alertas.push('recetas.preparado');
  }
}

proceed(){
  console.log('Procediendo con los ingredientes...');
  console.log(this.ingredientesReceta);
  if (this.semaforo=='verde' || this.semaforo=='ambar'){
    this.ingredientesReceta.forEach((ing)=>{
      console.log(ing);
      this.newItem(this.ingredientes[ing['ingrediente']],this.lotesIng[ing['ingrediente']][ing['lote']],parseFloat(ing['cantidad']).toFixed(2),this.loteSelected[ing['ingrediente']][ing['lote']].nombreMP)
      let indexMP = this.materiasPrimas.findIndex((mp)=>mp.id==this.lotesIng[ing['ingrediente']][ing['lote']].idproducto);

      if(this.materiasPrimas[indexMP].alergenos){
      console.log(indexMP,this.materiasPrimas[indexMP],JSON.parse(this.materiasPrimas[indexMP].alergenos));
      JSON.parse(this.materiasPrimas[indexMP].alergenos).forEach((alergeno)=>{
        if (this.alergenos.findIndex((alergia)=>alergia==alergeno) ==-1){
          this.alergenos.push(alergeno);
        }
      })
    }

    })
    this.cocinado=true;
    this.checkCobertura();
    console.log('ITEMS',this.items);
    console.log('ALERGENOS',this.alergenos);
    this.alertas.push('recetas.elaborado');

    let procesed = {'cantidad':this.cantidadProduccion,'alergenos':this.alergenos,'tipo_medida':this.receta.tipo_medida};
    this.onProcesed.emit(procesed);

  }else{
    this.alertas.push('recetas.errorElaborando');
  }
}


  newItem(ingrediente:Ingrediente,lote: ProveedorLoteProducto, cantidad,nombreMP) {
    let nuevoItem: ProduccionDetalle= new ProduccionDetalle(0,0,null,null,null,null,0,0,'');
    let entidad:string="&entidad=produccion_detalle";
    let field:string="&field=idorden&idItem=";//campo de relación con tabla padre
    let param = entidad+field+this.orden.id;
    nuevoItem.id =0;
    nuevoItem.idorden = this.orden.id; 
    nuevoItem.proveedor = this.proveedores[this.proveedores.findIndex((prov)=>prov.value==lote.idproveedor)].label;
    nuevoItem.producto = nombreMP;
    nuevoItem.numlote_proveedor = lote.numlote_proveedor
    nuevoItem.idmateriaprima= lote.id
    nuevoItem.idloteinterno = 0;
    nuevoItem.cantidad=cantidad;
    nuevoItem.idMPHomologada = lote.idproducto
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

onIngredienteOpen(event){
console.log('Ingrediente',event,event.index);
console.log(this.ingredientes[event.index]);
console.log(this.lotesIng[event.index]);
console.log(this.loteSelected[event.index]);
if (this.cantidadProduccion==0 || isNaN(this.cantidadProduccion)  || this.cantidadProduccion==null){
  if(this.alertas[this.alertas.length-1] != 'recetas.faltaCantidadProduccion')
  this.alertas.push('recetas.faltaCantidadProduccion')
}
}

tabSelected(event){
console.log(event);
if (event.index==1 || event ==1){
this.printReady=true;
// setTimeout(() => {
//   this.printIngredientes();
// }, 800);
}else{
this.printReady=false;
}
}
tabReady(){
  console.log('TAB READY');
  //if (this.printReady) this.printIngredientes();
  if (this.printReady) this.printIngredientesV2(false);

}

printIngredientes(){
  console.log('PRINTPDF');
  let orientacion ="landscape"
  let pdf = new jsPDF(orientacion,'mm','a4');
  let options = {
      pagesplit: false,
      orientation:orientacion
  };

  pdf.addHTML(this.el.nativeElement, 25, 30, options, () => {
         // pdf.save(this.orden.numlote +".pdf");
         pdf.autoPrint();
         //pdf.save('autoprint.pdf')
         window.open(pdf.output('bloburl'), '_blank');
  });

//window.open(pdf.output('bloburl'), '_blank');
// pdf.output('dataurlnewwindow');
}
printIngredientesV2(print){
  let cabecera=['Proveedor','NombreMP','Lote','Fecha Caducidad','Cantidad'];
  let linea=20;
  let columna=10;
  let x=0;
  var doc = new jsPDF("portrait", "mm", "a4");
  doc.setFontSize(10);
  doc.setFontStyle('bold');
  doc.text(50, 20, 'Listado Ingredientes ' + this.receta.nombre + ' para ' + this.cantidadProduccion + ' ' + this.receta.tipo_medida);
  doc.setFontSize(9);
  this.ingredientes.forEach((ingrediente)=>{
    linea+=6;
    doc.setFontStyle('bold');
    columna=10;
    cabecera.forEach((item)=>{
      doc.text(columna,linea,item);
      columna+=40;
    });
  
    doc.setFontStyle('normal');

    let y=0;
    this.lotesIng[x].forEach((lote)=>{
      linea+=4;
      columna=10;
      if (this.loteSelected[x][y].cantidad>0){
        doc.text(columna,linea,this.getProv(lote.idproveedor));
        columna+=40;
        doc.text(columna,linea,this.loteSelected[x][y].nombreMP);
        columna+=40;
        doc.text(columna,linea,lote.numlote_proveedor);
        columna+=40;
        doc.text(columna,linea,moment(lote.fecha_caducidad).format("DD-MM-YYYY"));
        columna+=40;
        doc.text(columna,linea,this.loteSelected[x][y].cantidad + ' ' + lote.tipo_medida);
        columna+=40;
      }
      y++;
    })
 


    x++;
  })
  
  doc.autoPrint();
  if(print){
    window.open(doc.output('bloburl'), '_blank');
  }else{
    this.pdfIngredientesSrc = doc.output('bloburl');
  }
  
  //window.open(doc.output('bloburl'), '_blank');
  //window.open(this.pdfSrc).print();
  
}
print(){
  
}

//********************PDF */
//********************PDF */
//********************PDF */
//********************PDF */
//********************PDF */
//********************PDF */
checkPdf(){
  if(this.receta.doc && this.receta.doc.substr(this.receta.doc.length-3,3)=='pdf'){  
    let baseurl = URLS.DOCS + this.empresasService.seleccionada + '/productos/';
    this.pdfSrc = baseurl + this.receta.id +'_'+this.receta.doc;
    //  this.pdfSrc = 'https://tfc2.proacciona.es/docs/33/productos/'+ this.receta.id +'_'+this.receta.doc;

    
  }else{
    this.pdfSrc = null;
}
// this.pdfSrc = "assets/demos/receta.pdf";
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
    // console.log('Progress',event)
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



  checkCobertura(){
    //Consulta entradasMP con id de MPHomologada
    console.log('CHECKING COBERTURA');
    //let cabecera=['Proveedor','NombreMP','Lote','Fecha Caducidad','Cantidad'];
    let x=0;
    this.ingredientes.forEach((ingrediente)=>{
      let y=0;
      let loteAcumulado =[];
      this.lotesIng[x].forEach((lote)=>{
        let indexLA = loteAcumulado.findIndex((LA)=>LA["idproducto"]==lote.idproducto && LA["idproveedor"]==lote.idproveedor);
        if (indexLA==-1){
          loteAcumulado.push({'idproducto':lote.idproducto,"idproveedor":lote.idproveedor,'cantidad':0+lote.cantidad_remanente,'tipo_medida':lote.tipo_medida});
          indexLA = loteAcumulado.length-1;
        }else{
          let a:number=parseInt(loteAcumulado[indexLA]["cantidad"]);
          let b:number=0+parseInt(lote.cantidad_remanente.toString());
          console.log(typeof(a),a);
          console.log(typeof(b),b);
          let cantidadRemanente:number= 0+a+b;
          console.log(typeof(a),typeof(b),typeof(cantidadRemanente),a,b,cantidadRemanente)
          loteAcumulado[indexLA]["cantidad"]=cantidadRemanente;
        }

        if (this.loteSelected[x][y].cantidad>0){
          // lote.idproveedor
          // lote.idproducto
          //let indexLA = loteAcumulado.findIndex((LA)=>LA["idproducto"]==lote.idproducto && LA["idproveedor"]==lote.idproveedor);
          //if (indexLA==-1){
          //  loteAcumulado.push({'idproducto':lote.idproducto,"idproveedor":lote.idproveedor,'cantidad':this.loteSelected[x][y].cantidad,'tipo_medida':lote.tipo_medida});
          //}else{
            let cantidad= loteAcumulado[indexLA]["cantidad"]-this.loteSelected[x][y].cantidad;
            loteAcumulado[indexLA]["cantidad"]=cantidad;
          //}
          // this.loteSelected[x][y].nombreMP
          // lote.numlote_proveedor
          // lote.fecha_caducidad
          // this.loteSelected[x][y].cantidad 
          // lote.tipo_medida
          //Acumula cantidades por idMateriaprima == idProductoProveedor && lote.idproveedor

        }
        y++;
      })
      //Comprueba todos los lotes afectados para el ingrediente x;
      loteAcumulado.forEach((loteA)=>{
        // console.log('***',this.materiasPrimas.findIndex((MP)=>{MP.id==loteA.idproducto && MP.idproveedor==loteA.idproveedor}));
        // console.log('***',this.materiasPrimas.findIndex((MP)=>MP.id==loteA.idproducto && MP.idproveedor==loteA.idproveedor));
        // console.log('***',this.materiasPrimas.findIndex((MP)=>MP.id==loteA.idproducto));
        // console.log('***',this.materiasPrimas[0].id,loteA.idproducto);


        let indexMP = this.materiasPrimas.findIndex((MP)=>MP.id==loteA.idproducto && MP.idproveedor==loteA.idproveedor);
        if (indexMP<0){
          //ALGO RARO ESTÁ OCURRIENDO
          console.log('ALGO RARO ESTÁ OCURRIENDO',this.materiasPrimas,loteA);
        }else{
      //this.materiasPrimas[indexMP].stockMin > Diferencia (lotestotal - sumacantidades), realizar pedido MP.
          console.log(this.materiasPrimas[indexMP]["stockMinim"],loteA["cantidad"])
        if (this.materiasPrimas[indexMP]["stockMinim"]>loteA["cantidad"]){
          console.log('Se ha sobrepasado el limite de cobertura y hay que realizar un pedido  de [1] al proveedor [2]',loteA["idproducto"],loteA["idproveedor"])
          this.sendMailCoberturaRota(loteA["idproducto"],loteA["idproveedor"])
        }else{
          console.log('no hay que hacer nada');
        }
        }
      })
      x++;
    })
  }


  sendMailCoberturaRota(idProducto,idProveedor){
    console.log("sendmail start: ",idProducto,idProveedor);
    let nomProveedor= this.getProv(idProveedor);
    let indexProd = this.materiasPrimas.findIndex((MP)=>MP["id"]==idProducto);
    let nomProductos = this.materiasPrimas[indexProd]["nombre"] + " stock Mínimo " + this.materiasPrimas[indexProd]["stockMinim"]
    console.log();
    let cabecera = "Alerta cobertura stock con fecha y hora: <b>" + moment().format('DD-MM-YYYY hh:mm')+"</b><BR>";
    // let User = "Solicitado por: <b>" +  user["label"]  + "</b> con prioridad: <b>" + this.ticket.priority +  "</b><BR>";
     let cobertura =   "Producto: <b>" + nomProductos +  "</b><BR>Proveedor: " + nomProveedor+"<BR>";

     let url =   encodeURI(URLS.SERVER)+"%23"+ encodeURI('/empresas/'+this.empresasService.seleccionada+'/proveedores/'+idProveedor+'/'+idProducto) ;
     let link = "ir a la página del proveedor:" + encodeURI(url);

    let body = cabecera + cobertura + link+"<BR>";
    // console.log (body);
   
    let parametros2 = "&remite=cobertura&body="+body+"&idempresa="+this.empresasService.seleccionada.toString();
    //let idEmpresa = this.empresasService.seleccionada.toString();
        // this.servidor.getObjects(URLS.ALERTES, parametros2).subscribe(
          this.servidor.getObjects(URLS.ALERTES,parametros2).subscribe(
          response => {
            if (response.success && response.data) {
              console.log('email COBERTURA enviado');
            }
        },
        error =>{
            console.log('ERROR email',error)
        }
        );
        //this.support = false;
  }
}
