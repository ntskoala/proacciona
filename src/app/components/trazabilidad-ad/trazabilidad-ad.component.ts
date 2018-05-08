import { Component, OnInit, Input, OnChanges, ViewChild,ElementRef } from '@angular/core';

import {Tree,TreeNode } from 'primeng/primeng';
import { TranslateService } from 'ng2-translate';
import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { ProveedorLoteProducto } from '../../models/proveedorlote';
import { Proveedor } from '../../models/proveedor';
import { ProduccionOrden } from '../../models/produccionorden';
import { ProduccionDetalle } from '../../models/producciondetalle';
import { Almacen } from '../../models/almacenes';
import { Cliente } from '../../models/clientes';
import { Modal } from '../../models/modal';

declare let jsPDF;

@Component({
  selector: 'app-trazabilidad-ad',
  templateUrl: './trazabilidad-ad.component.html',
  styleUrls: ['./trazabilidad-ad.component.css']
})
export class TrazabilidadAdComponent implements OnInit {
  @ViewChild('expandingTree')
  @ViewChild('toPDF') el: ElementRef;
  @ViewChild('toPDF2') el2: ElementRef;
  @ViewChild('toPDFTitle') elTitle: ElementRef;
  
  expandingTree: Tree;
  tree: TreeNode[];
  tree2:TreeNode[];
  msgs: any[]=[];
  message:string;
  selectedNode: TreeNode;
  selectedNodes: TreeNode[];
  selectedFile2: TreeNode;
  @Input() orden: ProduccionOrden;
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
  modal: Modal = new Modal();
  entidad:string="&entidad=produccion_detalle";
  field:string="&field=idorden&idItem=";//campo de relación con tabla padre
  es;

  constructor(public servidor: Servidor,public empresasService: EmpresasService, 
    public translate: TranslateService) {}

  ngOnInit() {
      this.getAlmacenes();
      this.getClientes();
     // this.getProveedores();

    // this.setItems();
  }

  ngOnChanges(){
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
     // this.getProductos();
     this.nodoProveedor(this.orden.id,'idorden');
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
                //this.getOrdenes(tree,element.idloteinterno,"idorden",level)
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
                      "label":element.proveedor + " " + element.numlote_proveedor,
                      "parent":parent,
                      //"expanded":true,
                      "data":{"tipo":"materia prima","idOrden":element.idorden,"fecha_inicio_orden":element.fecha_inicio,"idDetalleOrden":element.id,"numlote_proveedor":element.numlote_proveedor,"level":level,"almacen":element.idalmacen,"cantidad":element.cantidad,"cliente":element.idcliente,"proveedor":element.proveedor,"fecha_caducidad":element.fecha_caducidad}
                        });
                        
                        i++
                      }else{
                          lastItem = false;
                      nodo.children.push({
                      "label":element.numlote,
                      "expanded":true,
                      "data":{"tipo":"orden","idOrden":element.idorden,"fecha_inicio_orden":element.fecha_inicio,"idDetalleOrden":element.id,"numlote_proveedor":element.numlote_proveedor,"level":level,"almacen":element.idalmacen,"cantidad":element.cantidad,"remanente":element.remanente,"cliente":element.idcliente,"fecha_caducidad":element.fecha_caducidad,"cantidad_remanente_origen":element.cantidad_remanente_origen,"cantidad_real_origen":element.cantidad_real_origen}
                        });
                       nodo.parent = parent;
                        this.getChildren(nodo.children[i],element.idorden,'idloteinterno',level,nodo);
                    i++;
                      }

             }
             if (lastItem){
                 //this.tree[0] = this.tree[0].children[0];
                 if (this.empresasService.seleccionada == 26) this.nodoZero();
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
    let parametros = '&idempresa=' + this.empresasService.seleccionada+"&"+tipo+"="+id;
    this.servidor.getObjects(URLS.TRAZA_ATRAS, parametros).subscribe(
        response => {
          if (response.success && response.data && response.data[0].numlote_proveedor.length > 1) {
              console.log("ORIGEN",response.data)
            this.tree[0].label = response.data[0].proveedor
            this.tree[0].data = {"tipo":"materia prima","idOrden":response.data[0].idorden,"fecha_inicio_orden":response.data[0].fecha_inicio,"idDetalleOrden":response.data[0].id,"numlote_proveedor":response.data[0].numlote_proveedor,"level":0,"almacen":response.data[0].idalmacen,"cantidad":response.data[0].cantidad,"proveedor":response.data[0].proveedor}
          }
        });
}
////Quitar nodo "INICIO" substituir por Proveedor o TANQUE
///SOLO VAQUERIA. VER this.empresasService.seleccionada == 26
nodoZero(){
    if (!this.nodozero){
        this.nodozero = true;
    let tanque;
    this.translate.get('trazabilidad.tanque').subscribe((valor)=>tanque = valor);
    if (this.tree[0].children.length>1){

        this.tree[0].label = tanque + ' ' + this.findAlmacen(this.tree[0].children[0].data.almacen);
        this.tree[0].children.forEach(element => {
       this.tree[0].data.cantidad += element.data.cantidad;
    //    this.tree[0].data.fecha_caducidad = element.data.fecha_caducidad;
    //     if (new Date(this.tree[0].data.fecha_caducidad) > new Date(element.data.fecha_caducidad))
    //     this.tree[0].data.fecha_caducidad = element.data.fecha_caducidad;
        });
    }else{
        //this.tree2 = [];
        this.tree = this.tree[0].children;
        console.log('$$$$: ',this.tree[0].data.cliente);
    if(this.tree[0].data.cliente > 0){
    this.tree[0].label += ' ' + this.findCliente(this.tree[0].data.cliente);
    }else{
    this.tree[0].label += ' ' + this.findAlmacen(this.tree[0].data.almacen);
    }
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
    nodeSelect(event) {
        console.log(event,event.node)

        let almacen = this.findAlmacen(event.node.data.almacen);
        let nivel = this.findNivelAlmacen(event.node.data.almacen);
       

        let n_cliente = this.findCliente(event.node.data.cliente);
        if (n_cliente) nivel='2';



        //     if(event.node.children){
        //     event.node.children.forEach( childNode => {
        //         let almacen = this.getTanque(childNode.data.almacen)
        //         if (procedencia.length > 1) procedencia += " y ";
        //         if (childNode.data.proveedor){
        //             procedencia += almacen + " : " + childNode.data.cantidad + "l."  
        //         }else{
        //         procedencia += almacen + " : " + childNode.data.remanente + "l."  
        //         }                           
        //         cantidadProcedencia += childNode.data.cantidad;
        //     } );
        // }else{
        //     procedencia = "Proveedor"
        // }

        


        this.msgs.push({label: event.node.label, data: event.node.data, summary:'Node Selected', detail: event.node.label,almacen:almacen,nivel:nivel,cantidad:event.node.data.cantidad,cliente:n_cliente,cantidad_remanente_origen:event.node.data.cantidad_remanente_origen});
        this.message="";

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



}


