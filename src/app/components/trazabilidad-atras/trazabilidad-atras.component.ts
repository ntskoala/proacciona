import { Component, OnInit, Input, OnChanges, ViewChild,ElementRef,EventEmitter, Output } from '@angular/core';

import {Tree,TreeNode } from 'primeng/primeng';
import { TranslateService } from '@ngx-translate/core';
import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { PermisosService } from '../../services/permisos.service';
import { ProveedorLoteProducto } from '../../models/proveedorlote';
import { Proveedor } from '../../models/proveedor';
import { ProduccionOrden } from '../../models/produccionorden';
import { ProduccionDetalle } from '../../models/producciondetalle';
import { Almacen } from '../../models/almacenes';
import { Cliente } from '../../models/clientes';
import { Distribucion } from '../../models/distribucion';

import { Modal } from '../../models/modal';

declare let jsPDF;

export class alerg{
  constructor(
    public id:number,
    public nombre:string
  ){}
}



@Component({
  selector: 'app-trazabilidad-atras',
  templateUrl: './trazabilidad-atras.component.html',
  styleUrls: ['./trazabilidad-atras.component.css']
})

export class TrazabilidadAtrasComponent implements OnInit, OnChanges{
// @ViewChild('expandingTree')
@ViewChild('toPDF') el: ElementRef;
@ViewChild('toPDF2') el2: ElementRef;
@ViewChild('toPDF2') toPDF2: ElementRef;
@ViewChild('toPDFTitle') elTitle: ElementRef;
// @HostListener("window:scroll", ['$event'])
@Output() onHeightChanged: EventEmitter<string>=new EventEmitter<string>();
// expandingTree: Tree;
tree: TreeNode[];
tree2:TreeNode[];
msgs: any[]=[];
message:string;
selectedNode: TreeNode;
selectedNodes: TreeNode[];
selectedFile2: TreeNode;
@Input() orden: ProduccionOrden;
@Input() materiaPrima: ProveedorLoteProducto;
@Input() modo: string;
@Input() cliente: Cliente;
@Input() entrega: Distribucion;
public nuevoItem: ProduccionDetalle = new ProduccionDetalle(0,0,'','','',0,0,0,'');
//public addnewItem: ProveedorLoteProducto = new ProveedorLoteProducto('','','','',0,0);;
public items: ProduccionDetalle[];
public productos: any[]=[];
public proveedores: any[]=[];
public almacenes: Almacen[];
public clientes: Cliente[];
public entrada_productos: any[]=[];
public medidas: string[]=['Kg.','g.','l.','ml.','unidades'];
public guardar = [];
public idBorrar;
public url=[];
public verdoc: boolean = false;
public foto:string;
public widthArbol;
public informe:string;
public nodozero:boolean=false;
public orientacion:boolean=false;
public orientado:string='landscape';
public numberId:number=0;
public itemsMenu:any[]=[{label: 'traza atras', icon: 'fa-mail-reply',command:()=>{this.verNodo('atras')}},{label: 'traza adelante', icon: 'fa-mail-forward',command:()=>{this.verNodo('adelante')}}];
modal: Modal = new Modal();
entidad:string="&entidad=produccion_detalle";
field:string="&field=idorden&idItem=";//campo de relación con tabla padre
es;

  constructor(public servidor: Servidor,public empresasService: EmpresasService, 
    public translate: TranslateService, public permisos:PermisosService) {}
    
    // doSomethingOnWindowsScroll($event:Event){
    //     let scrollOffset = $event.srcElement.children[0].scrollTop;
    //     console.log("window scroll1: ", scrollOffset);
    //   }

  ngOnInit() {
      console.log(this.permisos.traspasos)
      this.getAlmacenes();
      this.getClientes();
     // this.getProveedores();

    // this.setItems();
  }

  ngOnChanges(){
      if (this.modo == 'atras'){
    this.initTree(this.orden.id);
      }else{
          if(this.materiaPrima){
            this.initTreeMateriaPrima();
          }else{
        this.initTreeAdelante();
          }
      }
  }

initTree(idOrden){
    console.log("onChange");
    this.nodozero = false;
    let label;
    label= this.orden.numlote;
     this.tree = [];
     //CLIENTE Y CANTIDAD ENTREGA PRODUCTO
     if (this.cliente){
     let parentId= (this.numberId++).toString();
     this.tree.push({"label": this.cliente.nombre,"data": "inicio","expanded":true,"expandedIcon": "fa-folder-open","collapsedIcon": "fa-folder"})
      this.tree[0]["data"]={"tipo":"entrega","idEntrega":this.entrega.id,"fecha_inicio_orden":this.entrega.fecha,"fecha_caducidad":this.entrega.fecha_caducidad,"cantidad":this.entrega.cantidad,"tipo_medida":this.entrega.tipo_medida,"numlote":this.entrega.numlote}
     this.tree[0].children=[];
    let nodo= this.tree[0];
    console.log('****',nodo);
     //PRODUCCION LOTE ENTREGADO
     this.tree[0].children.push({"label": label,"data": "inicio","expanded":true,"expandedIcon": "fa-folder-open","collapsedIcon": "fa-folder"})
     this.tree[0].children[0]["data"]={"parent":this.tree[0],"tipo":"orden","idOrden":this.orden.id,"fecha_inicio_orden":this.orden.fecha_inicio,"almacen":this.orden.idalmacen,"fecha_caducidad":this.orden.fecha_caducidad,"cantidad":this.orden.cantidad,"cantidad_remanente":this.orden.remanente,"tipo_medida":this.orden.tipo_medida,"nombreProduccion":this.orden.nombre}
     this.tree[0].children[0].parent = nodo;
     this.tree[0].children[0].children=[];
console.log('PARENT NODO',this.tree[0].children[0].parent);
      this.getParent(this.tree[0].children[0],idOrden,'idorden',1);
    }else{
      //PRODUCCION LOTE ENTREGADO
      this.tree.push({"label": label,"data": "inicio","expanded":true,"expandedIcon": "fa-folder-open","collapsedIcon": "fa-folder"})
      this.tree[0]["data"]={"parent":{data:{tipo:'entrega'}},"tipo":"orden","idOrden":this.orden.id,"fecha_inicio_orden":this.orden.fecha_inicio,"almacen":this.orden.idalmacen,"fecha_caducidad":this.orden.fecha_caducidad,"cantidad":this.orden.cantidad,"cantidad_remanente":this.orden.remanente,"tipo_medida":this.orden.tipo_medida,"nombreProduccion":this.orden.nombre}
      this.tree[0].children=[];
 //console.log('PARENT NODO',this.tree[0].children[0].parent);
       this.getParent(this.tree[0],idOrden,'idorden',1);        
    }
}

getAlmacenes() {

    let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=almacenes";

        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            //this.itemActivo = 0;
            // Vaciar la lista actual
            this.almacenes = [];
            if (response.success == 'true' && response.data) {
              for (let element of response.data) {
                this.almacenes.push(new Almacen(element.id,element.idempresa,element.nombre,element.capacidad,element.estado,element.idproduccionordenactual,element.level));
              }
             // this.listaZonas.emit(this.limpiezas);
            }
        });
   }
   getClientes() {
    let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=clientes";

        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            this.clientes = [];
            if (response.success == 'true' && response.data) {
              for (let element of response.data) {
                this.clientes.push(new Cliente(element.nombre,element.idempresa,element.contacto,element.telf,element.email,element.id));
              }
             // this.listaZonas.emit(this.limpiezas);
            }
        });
   }

  setItems(tree:any,idOrden?:number,level?:number){
      let i=0;
      if (!idOrden) idOrden= this.orden.id;
     console.log('setting items...', idOrden)
      let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+this.field+idOrden;
        this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
          response => {
            //this.tree[0].children=[];
            if (response.success && response.data) {
                tree.children =[];
              for (let element of response.data) {
                  //let node = ({"label" :element.numlote})
                  if (element.idmateriaprima >0){
                   //this.tree[0].children.push({
                       tree.children.push({
                       "label": element.producto + ' ' + element.proveedor,
                       "expanded":true,
                       //"parent": tree,
                        "data": {"tipo":"materiaprima","idmateriaprima":element.idmateriaprima,"proveedor":element.proveedor,"numlote_proveedor":element.numlote_proveedor,"level":level},
                        "expandedIcon": "fa-folder-open",
                        "collapsedIcon": "fa-folder"});
                       // this.getOrdenes(tree.children[i],element.idmateriaprima,"idmateriaprima",1);

                  //this.items.push(new ProduccionDetalle(element.id,element.idorden,element.proveedor,element.producto,element.numlote,element.idmateriaprima,element.idloteinterno,element.cantidad,element.tipo_medida));
                }else{
                this.getOrdenes(tree,element.idloteinterno,"idorden",level)
                //this.setItems(tree,element.idloteinterno)
                }
            }
            }
        },
        error=>console.log(error),
        ()=>{//this.getOrdenes()
            }
        );
  }

getOrdenes(nodo: any,id:number, tipo:string,level:number){
    //console.log("Get Orden: ",id);
    let i=0;
    level++;
//    this.tree[0].children.forEach((child)=> {
//        let parametros = '&idempresa=' + this.empresasService.seleccionada+"&idmateriaprima="+child.data.idmateriaprima;
        let parametros = '&idempresa=' + this.empresasService.seleccionada+"&"+tipo+"="+id;
        //console.log(parametros);
//        child.children=[];
       // this.tree[0].children[nodo].children=[];
       nodo.children=[];
        this.servidor.getObjects(URLS.TRAZA_ORDENES, parametros).subscribe(
          response => {
            //console.log("Resultados Get Orden: ",response.data.length);
            if (response.success && response.data) {
              for (let element of response.data) {
                  //this.tree[0].children[nodo].children.push({
                      console.log("idloteinterno"+element.idloteinterno + "idmateriaprima:" + element.idmateriaprima)
                      if (element.idmateriaprima>0){
                        this.setItems(nodo.children[i],element.idmateriaprima)

                      }else{
                      nodo.children.push({
                      "label":element.numlote,
                      "parent":nodo,
                      "expanded":true,
                      "data":{"tipo":"orden","idOrden":element.idorden,"fecha_inicio_orden":element.fecha_inicio,"idDetalleOrden":element.id,"numlote_proveedor":element.numlote_proveedor,"level":level,"almacen":element.idalmacen,"cliente":element.idcliente,"fecha_caducidad":element.fecha_caducidad}
                    });
                    this.getOrdenes(nodo.children[i],element.idloteinterno,"idorden",level);
                    //this.setItems(nodo.children[i],element.idloteinterno)
                    i++;
                      }
             }
//             i++;
            }
        },
        error=>console.log("Error get_orden: ",error),
        ()=>{ }
        );
//    });
}



getParent(nodo: any,id:number, tipo:string,level:number){
    console.log(nodo,this.tree[0])
    let i=0;
    level++;
    let lastItem = true;
//    this.tree[0].children.forEach((child)=> {
//        let parametros = '&idempresa=' + this.empresasService.seleccionada+"&idmateriaprima="+child.data.idmateriaprima;
        let parametros = '&idempresa=' + this.empresasService.seleccionada+"&"+tipo+"="+id;
        //console.log(parametros);
//        child.children=[];
       // this.tree[0].children[nodo].children=[];
       
        this.servidor.getObjects(URLS.TRAZA_ATRAS, parametros).subscribe(
          response => {
            //console.log("Resultados Get Orden: ",response.data);
            //if (response.data === null) response.data = [];
            if (response.success && response.data) {
                nodo.children=[];
                console.log("Resultados Get Orden: ",response.data);
              for (let element of response.data) {
                  //this.tree[0].children[nodo].children.push({
                      
                      console.log("idloteinterno"+element.idloteinterno + "idmateriaprima:" + element.idmateriaprima)
                //   if (element.numlote_proveedor){
                      if (element.idmateriaprima>0){
                      //  this.setItems(nodo.children[i],element.idmateriaprima)
                      nodo.children.push({
                      "label": element.producto + " (" + element.numlote_proveedor + ") -" + element.proveedor+ "-",
                      //"expanded":true,
                      "data":{"parent":nodo,"tipo":"entrada","idOrden":element.idorden,"fecha_inicio_orden":element.fecha_inicio,"idDetalleOrden":element.id,"numlote_proveedor":element.numlote_proveedor,"level":level,"almacen":element.idalmacen,"cantidad_inicial":element.cantidad,"cliente":element.idcliente,"proveedor":element.proveedor,"fecha_detalle":element.fecha_detalle,"fecha_caducidad":element.fecha_caducidad,"cantidad_remanente_origen":element.cantidad_remanente_origen,"cantidad_detalle":element.cantidad_detalle,"cantidad_real_origen":element.cantidad_real_origen,"tipo_medida":element.tipo_medida,"nombreMP":element.producto,"nombreProduccion":element.nombreProduccion}
                        });
                        
                        i++
                      }else{
                          let label
                        if (this.empresasService.seleccionada == 26 || this.empresasService.seleccionada == 77) {
                            label= element.numlote
                        }else{
                            label =element.numlote_proveedor
                           }
                          lastItem = false;
                      nodo.children.push({
                          
                      //"label":element.numlote,
                      "label":label,
                      "parent":nodo,
                      "expanded":true,
                      "data":{"parent":nodo,"tipo":"orden","idOrden":element.idorden,"fecha_inicio_orden":element.fecha_inicio,"idDetalleOrden":element.id,"numlote_proveedor":element.numlote_proveedor,"level":level,"almacen":element.idalmacen,"cantidad":element.cantidad,"cantidad_remanente":element.remanente,"cliente":element.idcliente,"fecha_detalle":element.fecha_detalle,"fecha_caducidad":element.fecha_caducidad,"cantidad_remanente_origen":element.cantidad_remanente_origen,"cantidad_detalle":element.cantidad_detalle,"cantidad_real_origen":element.cantidad_real_origen,"tipo_medida":element.tipo_medida,"nombreProduccion":element.nombreProduccion}
                        });
                        this.getParent(nodo.children[i],element.idloteinterno,'idorden',level);
                    //this.getOrdenes(nodo.children[i],element.idorden,"idorden",level);
                    //this.setItems(nodo.children[i],element.idloteinterno)
                    i++;
                      }
                // }else{
                //     this.getParent(nodo.children[i],element.idloteinterno,'idorden',level);
                // }
             }
             if (lastItem){
                 //this.tree[0] = this.tree[0].children[0];
                 if (this.empresasService.seleccionada == 26 || this.empresasService.seleccionada == 77) {
                     this.nodoZero();
                 }else{
                  //  this.nodoZero();
                    }

             }
//             i++;
            }
        },
        error=>console.log("Error get_orden: ",error),
        ()=>{  
            //this.widthArbol = (+level * 150) + 'px !important';
            let width = 150 * (+level+2);  
            width= 1200+width;
            this.widthArbol =  width + 'px';
            console.log(this.el.nativeElement.clientWidth,this.el.nativeElement.clientHeight)
            let ancho = this.el.nativeElement.clientWidth;
            let alto = this.el.nativeElement.clientHeight
            this.onHeightChanged.emit(alto);
            }
        
        );
}


////Quitar nodo "INICIO" substituir por cliente o TANQUE
///SOLO VAQUERIA. VER this.empresasService.seleccionada == 26
nodoZero(){
    console.log('NODO ZERO INIT');
    if (!this.nodozero){
        console.log('NODO ZERO EXISTS');
        this.nodozero = true;
        if (this.empresasService.seleccionada == 26 || this.empresasService.seleccionada == 77) {
            console.log('NODO ZERO  VAQUERIA');
            let tanque;
            this.translate.get('trazabilidad.tanque').subscribe((valor)=>tanque = valor);
        
            this.tree[0].label=this.tree[0].children[0].label,
            this.tree[0].data={"tipo":"orden","idOrden":this.tree[0].children[0].data.idorden,"level":0,"almacen":this.tree[0].children[0].data.idalmacen,"cantidad":0,"cantidad_real_origen":0}
        }else{
            console.log('NODO ZERO NOT VAQUERIA');
           }


    if (this.tree[0].children.length>1){
        console.log('NODO ZERO LENGTH',this.tree[0].children.length);
        console.log('##: ',this.tree[0].children.length);
        //this.tree[0].label = tanque + ' ' + this.findAlmacen(this.tree[0].children[0].data.almacen);
        this.tree[0].children.forEach(element => {
       this.tree[0].data.cantidad = 0 + parseInt(this.tree[0].data.cantidad) + parseInt(element.data.cantidad);
       this.tree[0].data.cantidad_real_origen = 0 + parseInt(this.tree[0].data.cantidad_real_origen) + parseInt(element.data.cantidad_real_origen);
    //    this.tree[0].data.fecha_caducidad = element.data.fecha_caducidad;
    //     if (new Date(this.tree[0].data.fecha_caducidad) > new Date(element.data.fecha_caducidad))
    //     this.tree[0].data.fecha_caducidad = element.data.fecha_caducidad;
        });
    }else{
        console.log('##: ',this.tree[0].children.length);
        this.nodozero = true;
        //this.tree2 = [];
        this.tree = this.tree[0].children;
        console.log('$$$$: ',this.tree[0].data.cliente);
        console.log('@1: ',this.tree[0].label);
    if(this.tree[0].data.cliente > 0){
        console.log('NODO ZERO CLIENTE');
    this.tree[0].label += ' ' + this.findCliente(this.tree[0].data.cliente);
    }else{
        console.log('NODO ZERO ALMACEN');
    this.tree[0].label += ' ' + this.findAlmacen(this.tree[0].data.almacen);
    }
    console.log('@2: ',this.tree[0].label);
}
    }
}

findCliente(cli:number){
        let indice_cliente= this.clientes.findIndex((cliente)=>cliente.id==cli);
        let n_cliente;
        (indice_cliente <0)?n_cliente=false:n_cliente = this.clientes[indice_cliente].nombre;
return n_cliente;
}
findAlmacen(alm:number):string{
let almacen;
        let index= this.almacenes.findIndex((almacen)=>almacen.id==alm);
        
        (index <0)?almacen=false:almacen = this.almacenes[index].nombre;
return almacen;
}
findNivelAlmacen(alm:number):string{
let nivel;
        let index= this.almacenes.findIndex((almacen)=>almacen.id==alm);
        
        (index <0)?nivel=false:nivel = this.almacenes[index].level;
return nivel;
}
    closeFicha(index:number){
        this.msgs.splice(index,1);
    }

    nodeSelect(event,toPDF,toPDF2) {
      console.log('NODO',event.node);
       console.log(this.el.nativeElement.clientHeight);
    //    console.log(this.el2.nativeElement.clientHeight);
       console.log(window);
       console.log(window.screen.availHeight);
       console.log('Fichas:'+this.msgs.length);
       let alto = parseInt(this.el.nativeElement.clientHeight)+ ((1+this.msgs.length)*155)
       this.onHeightChanged.emit(alto.toString());
        // let nivel=event.node["data"]["level"]-1;

        // let nivel = event.node["data"]["level"]-1;
        // let parentNodo=this.tree[0].children;
        // for (let x=1;x<=nivel;x++){
        //   parentNodo=parentNodo[].children
        // }
        // let indexPArent = .findIndex((nodo)=>nodo["data"]["id"]==event.node["data"]["parent"]);
        // console.log(indexPArent,this.tree[indexPArent]["label"])
    if (this.modo == 'atras'){
        this.nodeSelectAtras(event);
    }else{
        this.nodeSelectAlante(event);
    }
    }

    nodeSelectAtras(event) {
        //this.msgs = [];
        //let index= this.almacenes.findIndex((almacen)=>almacen.id==event.node.data.almacen);
        let almacen = this.findAlmacen(event.node.data.almacen);
        
        
        let nivel = this.findNivelAlmacen(event.node.data.almacen);
        console.log('Nivel',nivel);
        //(index <0)?almacen=false:almacen = this.almacenes[index].nombre;
       // let indice_cliente= this.clientes.findIndex((cliente)=>cliente.id==event.node.data.cliente);
        let n_cliente = this.findCliente(event.node.data.cliente);
        //(indice_cliente <0)?n_cliente=false:n_cliente = this.clientes[indice_cliente].nombre;
       // console.log(indice_cliente,n_cliente,this.clientes)

        let procedencia =""
        let cantidadProcedencia = 0;
        let cantidadRemanenteProcedencia = 0;

        // console.log(event.node);
        
            if(event.node.children){
                let almacenOrigen = this.findAlmacen(event.node.children[0].data.almacen);
                if(almacenOrigen){
                procedencia += almacenOrigen + " : " + event.node.data.cantidad_real_origen + "l." 
        //     event.node.children.forEach( childNode => {
        //         let almacen = this.getTanque(childNode.data.almacen)
        //         if (procedencia.length > 1) procedencia += " y ";
        //         if (childNode.data.proveedor){
        //             procedencia += almacen + " : " + childNode.data.cantidad_real_origen + "l."  
        //         }else{
        //         procedencia += almacen + " : " + childNode.data.cantidad_real_origen + "l."  
        //         }           
        //         cantidadRemanenteProcedencia += childNode.data.cantidad_remanente_origen;
        //     } );
                }
        }else{
            procedencia = event.node.label;
        }

        
        cantidadRemanenteProcedencia +=  event.node.data.cantidad_remanente_origen 

        this.msgs.push({label: event.node.label,children:event.node.children, data: event.node.data, summary:'Node Selected', detail: event.node.label,almacen:almacen,nivel:nivel,cantidad:event.node.data.cantidad,cliente:n_cliente,procedencia: procedencia,cantidad_remanente_origen:event.node.data.cantidad_remanente_origen});
        this.message="";

        // console.log(this.msgs);
        // switch(event.node.data.tipo){
        //     case "materiaprima":
        //     this.message="label:"+event.node.label+" idMateriaPrima:"+ event.node.data.idmateriaprima+" proveedor:"+ event.node.data.proveedor+" numlote proveedor:"+ event.node.data.numlote_proveedor;
        //     console.log("parent",event.node.parent);
        //     let index = this.tree[0].children.findIndex((item) => item.data.idmateriaprima == event.node.data.idmateriaprima);
        //     break;
        //     case "orden":
        //     this.message="label:"+event.node.label+" idOrden:"+ event.node.data.idOrden+" Fecha Inicio Orden:"+ event.node.data.fecha_inicio_orden+" idDetalleOrden:"+ event.node.data.idDetalleOrden+" numlote_proveedor:"+ event.node.data.numlote_proveedor;
        //     console.log("parent",event.node.parent);
        //     let indice = this.tree[0].children.findIndex((item) => item.data.idOrden == event.node.data.idOrden);
        //     break;
        //     case "materiainterna":
        //     break;
        // }
    }

    nodeUnselect(event) {
        this.msgs = [];
        this.msgs.push({severity: 'info', summary: 'Node Unselected', detail: event.node.label});
        this.message = "";
        console.log(this.msgs);
    }

    nodeExpandMessage(event) {
        this.msgs = [];
        this.msgs.push({severity: 'info', summary: 'Node Expanded', detail: event.node.label});
        console.log(this.msgs);
    }


    nodeExpand(event) {
        if(event.node) {
            //in a real application, make a call to a remote url to load children of the current node and add the new nodes as children
            //this.nodeService.getLazyFiles().then(nodes => event.node.children = nodes);
        }
    }

    viewFile(file: TreeNode) {
        this.msgs = [];
        this.msgs.push({severity: 'info', summary: 'Node Selected with Right Click', detail: file.label});
        console.log(this.msgs);
    }

    unselectFile() {
        this.selectedFile2 = null;
    }



    expandAll(){
        this.tree.forEach( node => {
            this.expandRecursive(node, true);
        } );
    }

    collapseAll(){
        this.tree.forEach( node => {
            this.expandRecursive(node, false);
        } );
    }

    public expandRecursive(node:TreeNode, isExpand:boolean){
        node.expanded = isExpand;
        if(node.children){
            node.children.forEach( childNode => {
                this.expandRecursive(childNode, isExpand);
            } );
        }
    }


    
askOrientacion(){
    this.orientacion=true;
}    
    
downloadPdf(){
    this.orientacion=false;
        let pdf = new jsPDF(this.orientado,'mm','a3');
        let options = {
            pagesplit: false,
            orientation:this.orientado
        };
        pdf.addHTML(this.elTitle.nativeElement,0,0,options,()=>{
        pdf.addHTML(this.el.nativeElement, 25, 30, options, () => {
            if (this.msgs.length>0){
            pdf.addPage();
             pdf.addHTML(this.el2.nativeElement, 15, 30, options,() =>{
                pdf.save(this.orden.numlote +".pdf");
             });
            }else{
                pdf.save(this.orden.numlote +".pdf");
            }
        });
        });
}


doInforme(){
    this.informe ="";
            //this.tree.forEach( node => {
            this.llenaInforme(this.tree[0].children[0]);
        //} );
}
llenaInforme(node:TreeNode){
    
// if (node.data.almacen > 0) {
//     let almacen = this.getCliente(node.data.cliente);
//     this.informe += " en " + almacen;
// }
if (node.data.cliente > 0) {
    this.informe += node.data.cantidad + " l. con número de lote: " + node.label;
    let cliente = this.getCliente(node.data.cliente);
    this.informe += " para " + cliente + " y fecha de caducidad " + node.data.fecha_caducidad + " procendente de ";
} 
if (node.data.tipo == "materia prima"){
    this.informe += " lote " + node.label + node.data.cantidad + " l."
}


    if(node.children){
            node.children.forEach( childNode => {
                this.llenaInforme(childNode);
            } );
        }
}

getTanque(idAlmacen):string{
    let tanque=""
         let index= this.almacenes.findIndex((almacen)=>almacen.id==idAlmacen);
        (index <0)?tanque="Desconocido":tanque = this.almacenes[index].nombre;
    return tanque;
}
getCliente(idCliente):string{
let  cliente="";
        let indice= this.clientes.findIndex((cliente)=>cliente.id==idCliente);

        (indice <0)?cliente="desconocido":cliente = this.clientes[indice].nombre;
return cliente;
}




verNodo(modo){
    console.log('Ver Nodo',modo,this.selectedNode);
    if (modo=='atras'){
        this.modo = 'atras';
    this.initTree(this.selectedNode.data.idOrden);
    }else{
        this.modo = 'adelante';
        let orden = this.getOrden(this.selectedNode.data.idOrden).then(
            (resultado)=>{
            this.initTreeAdelante()
            });
    }
}




















































//****     TRAZA ALANTE */
//****     TRAZA ALANTE */
//****     TRAZA ALANTE */
//****     TRAZA ALANTE */
//****     TRAZA ALANTE */
//****     TRAZA ALANTE */
//****     TRAZA ALANTE */
//****     TRAZA ALANTE */
//****     TRAZA ALANTE */
//****     TRAZA ALANTE */
initTreeMateriaPrima(){

    this.orden=new ProduccionOrden(null,null,this.materiaPrima.numlote_proveedor,this.materiaPrima.fecha_entrada,this.materiaPrima.fecha_entrada);
    console.log("onChange",this.materiaPrima);
    this.nodozero = false;
     this.tree = [];
     this.tree.push({"label": this.materiaPrima.numlote_proveedor,
     //"data": "inicio",
     "data":{"tipo":"Entrada M.P.","fecha_inicio_orden":this.materiaPrima.fecha_entrada,"level":0,"fecha_caducidad":this.materiaPrima.fecha_caducidad,"cantidad_inicial":this.materiaPrima.cantidad_inicial,"cantidad_remanente":this.materiaPrima.cantidad_remanente,"tipo_medida":this.materiaPrima.tipo_medida},
     "expanded":true,"expandedIcon": "fa-folder-open","collapsedIcon": "fa-folder"})     
     this.tree[0].children=[];

    this.getMPHomologada(this.materiaPrima.idproducto,this.materiaPrima.idproveedor).then(
        (nombreMP)=>{
            this.tree[0]["data"]["nombreMP"]=nombreMP["nombre"]; 
        }
    )
    //  this.nodoProveedor(this.materiaPrima.id,'idmateriaprima').then(
    //      (idOrden)=>{
    //          console.log(idOrden)
    //      //   this.getChildren(this.tree[0],idOrden["idOrden"],'idmateriaprima',1,this.tree[0].children[0]);
    //      }
    //      )

         this.getChildren(this.tree[0],this.materiaPrima.id,'idmateriaprima',1,this.tree[0].children[0]);

    //  this.tree[0].children.push({"label": this.orden.numlote,
    //   "data":{"tipo":"orden","idOrden":this.orden.id,"fecha_inicio_orden":this.orden.fecha_inicio,"level":0,"almacen":this.orden.idalmacen,"cantidad":this.orden.cantidad,"cliente":this.orden.idcliente,"fecha_caducidad":this.orden.fecha_caducidad},
    //  "expanded":true,"expandedIcon": "fa-folder-open","collapsedIcon": "fa-folder"})
    //   this.getChildren(this.tree[0].children[0],this.orden.id,'idloteinterno',1,this.tree[0].children[0]);
//    this.getChildren(this.tree[0],this.orden.id,'idloteinterno',1,this.tree[0].children[0]);
  }


initTreeAdelante(){
    //if (typeof(nodo)== 'ProduccionOrden')
    console.log("onChange",this.orden);
    this.nodozero = false;
     this.tree = [];
     this.tree.push({"label": "inicio","data": "inicio","expanded":true,"expandedIcon": "fa-folder-open","collapsedIcon": "fa-folder"})     
     this.tree[0].children=[];
     this.tree[0].children.push({"label": this.orden.numlote,
      "data":{"tipo":"orden","idOrden":this.orden.id,"fecha_inicio_orden":this.orden.fecha_inicio,"level":0,"almacen":this.orden.idalmacen,"cantidad":this.orden.cantidad,"cliente":this.orden.idcliente,"fecha_caducidad":this.orden.fecha_caducidad},
     "expanded":true,"expandedIcon": "fa-folder-open","collapsedIcon": "fa-folder"})
      //this.setItems(this.tree[0],this.orden.id,0);

      this.getChildren(this.tree[0].children[0],this.orden.id,'idloteinterno',1,this.tree[0].children[0]);
    // this.nodoProveedor(this.orden.id,'idorden');
  }

nodeSelectAlante(event) {
    console.log('NODO',event.node);


    let almacen = this.findAlmacen(event.node.data.almacen);
    let nivel = this.findNivelAlmacen(event.node.data.almacen);

    let n_cliente = this.findCliente(event.node.data.cliente);
    if (n_cliente) nivel='2';
    this.msgs.push({label: event.node.label, data: event.node.data, summary:'Node Selected', detail: event.node.label,almacen:almacen,nivel:nivel,cantidad:event.node.data.cantidad,cliente:n_cliente,cantidad_remanente_origen:event.node.data.cantidad_remanente_origen});
    this.message="";
    console.log('cards',this.msgs);
}

getOrden(idOrden){
    return new Promise((resolve)=>{
    let parametros = '&idempresa=' + this.empresasService.seleccionada +"&entidad=produccion_orden&order=id DESC&WHERE=id=&valor="+idOrden+"";
    this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
        response => {
            if (response.success && response.data) {
                for (let element of response.data) {
                 this.orden = new ProduccionOrden(element.id,element.idempresa,element.numlote,new Date(element.fecha_inicio),new Date(element.fecha_fin),new Date(element.fecha_caducidad),element.responsable,element.cantidad,element.remanente,element.tipo_medida,element.idproductopropio,element.nombre,element.familia,element.estado,element.idalmacen);
                resolve ('ok');
                }
            }else{
                resolve ('notOk');
            }

        });
    });
}

getChildren(nodo: TreeNode,id:number, tipo:string,level:number,parent?:TreeNode){
    let i=0;
    level++;
    let lastItem = true;
//    this.tree[0].children.forEach((child)=> {
//        let parametros = '&idempresa=' + this.empresasService.seleccionada+"&idmateriaprima="+child.data.idmateriaprima;
        let parametros = '&idempresa=' + this.empresasService.seleccionada+"&"+tipo+"="+id;
        //console.log(parametros);
//        child.children=[];
       // this.tree[0].children[nodo].children=[];
       
        this.servidor.getObjects(URLS.TRAZA_ADELANTE, parametros).subscribe(
          response => {
            if (response.data === null) response.data = [];
            if (response.success && response.data) {
                nodo.children=[];
                console.log("Resultados Get Orden: ",response.data);
              for (let element of response.data) {
                      console.log("idloteinterno"+element.idloteinterno + "idmateriaprima:" + element.idmateriaprima)
                          lastItem = false;
                      nodo.children.push({
                      "label":element.numlote,
                      "expanded":true,
                      "data":{"tipo":"orden","idOrden":element.idorden,"fecha_inicio_orden":element.fecha_inicio,"idDetalleOrden":element.id,"numlote_proveedor":element.numlote_proveedor,"level":level,"almacen":element.idalmacen,"cantidad":element.cantidad_detalle,"remanente":element.remanente,"cliente":element.idcliente,"fecha_caducidad":element.fecha_caducidad,"cantidad_remanente_origen":element.cantidad_remanente_origen,"cantidad_real_origen":element.cantidad_real_origen,"tipo_medida":element.tipo_medida,"fecha_detalle":element.fecha_detalle,"nombreProduccion":element.nombreProduccion}
                        });
                       nodo.parent = parent;
                        this.getChildren(nodo.children[i],element.idorden,'idloteinterno',level,nodo);
                        i++;
                      //}

             }
             if (lastItem){
                 if (this.empresasService.seleccionada == 26 || this.empresasService.seleccionada == 77) {
                    this.nodoZero();
                 }else{
                    this.nodoClientes(nodo,id,tipo);
                 }

                 //if (this.empresasService.seleccionada == 77) this.nodoZero();
                //this.nodoZero();
             }else{
                if (this.empresasService.seleccionada != 26 && this.empresasService.seleccionada != 77) {
                    this.nodoClientes(nodo,id,tipo);
                 }
             }
             
//             i++;
            }else{//NOT Success or NOT Data
                console.log('FIN RAMA',nodo);
                nodo.expanded = false;
            }

        },
        error=>console.log("Error get_orden: ",error),
        ()=>{  
            //this.widthArbol = (+level * 150) + 'px !important';
            let width = 175 * (+level+2);  
            width= 1200+width;
            this.widthArbol =  width + 'px';
            console.log(this.widthArbol)
            }
        
        );
}



nodoProveedor(id:number, tipo:string){
    return new Promise((resolve)=>{
    let parametros = '&idempresa=' + this.empresasService.seleccionada+"&"+tipo+"="+id;
    this.servidor.getObjects(URLS.TRAZA_ATRAS, parametros).subscribe(
        response => {
          if (response.success && response.data && response.data[0].numlote_proveedor.length > 1) {
              console.log("ORIGEN",response.data)
              for (let element of response.data) {
                this.tree[0].children.push({
            "label" : response.data[0].proveedor,
            "expanded":true,
            "data" : {"tipo":"materia prima","idOrden":response.data[0].idorden,"fecha_inicio_orden":response.data[0].fecha_inicio,"idDetalleOrden":response.data[0].id,"numlote_proveedor":response.data[0].numlote_proveedor,"level":0,"almacen":response.data[0].idalmacen,"cantidad":response.data[0].cantidad,"proveedor":response.data[0].proveedor}
                });
                let x= this.tree[0].children.length-1;
                this.getChildren(this.tree[0].children[x],response.data[0].idorden,'idloteinterno',2)
                }
                resolve({"idOrden":response.data[0].idorden});
          }else{
              if(this.tree[0].children.length ==1)
              this.tree[0] = this.tree[0].children[0];
          }
        });
    });
}

getMPHomologada(idproducto,idproveedor){
    return new Promise((resolve)=>{
        let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=proveedores_productos&field=id&idItem="+idproducto+"&where=idproveedor="+idproveedor;
        this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
        response => {
          if (response.success && response.data) {
            let nombre='';
            for (let element of response.data) {
                nombre=element.nombre;
       }
            resolve({'nombre':nombre})            
          }else{
            resolve(false)
          }
        });
});
}

nodoClientes(nodo: TreeNode,id:number, tipo:string){
    //this.getClientes();
    let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=clientes_distribucion&WHERE=idordenproduccion=&valor="+id;
    this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
        response => {
          if (response.success && response.data) {
              if (nodo.children==undefined)
            nodo.children=[];
            for (let element of response.data) {
                nodo.children.push({
                "label":this.getCliente(element.idcliente),
                "expanded":false,
                "data":{"tipo":"orden","idOrden":element.id,"fecha_inicio_orden":element.fecha,"cantidad":element.cantidad,"fecha_caducidad":element.fecha_caducidad}
                  });
                 nodo.parent = parent;
       }            
             // console.log("DESTINO",response.data)
          }else{
            //   if(this.tree[0].children.length ==1)
            //   this.tree[0] = this.tree[0].children[0];
          }
        });
}
}

