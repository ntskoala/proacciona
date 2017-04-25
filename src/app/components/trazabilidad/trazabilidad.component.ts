import { Component, OnInit, Input, OnChanges, ViewChild,ElementRef } from '@angular/core';
import {Tree,TreeNode } from 'primeng/primeng';

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

export class alerg{
  constructor(
    public id:number,
    public nombre:string
  ){}
}

@Component({
  selector: 'trazabilidad',
  templateUrl: './trazabilidad.component.html',
  styleUrls:['trazabilidad.css']
})

export class TrazabilidadComponent implements OnInit, OnChanges{
@ViewChild('expandingTree')
@ViewChild('toPDF') el: ElementRef;
@ViewChild('toPDF2') el2: ElementRef;
@ViewChild('toPDFTitle') elTitle: ElementRef;
expandingTree: Tree;
tree: TreeNode[];
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


modal: Modal = new Modal();
entidad:string="&entidad=produccion_detalle";
field:string="&field=idorden&idItem=";//campo de relación con tabla padre
es;

  constructor(public servidor: Servidor,public empresasService: EmpresasService) {}

  ngOnInit() {
      this.getAlmacenes();
      this.getClientes();
     // this.getProveedores();

    // this.setItems();
  }

  ngOnChanges(){
    console.log("onChange");
     this.tree = [];
     this.tree.push({"label": "inicio","data": "inicio","expanded":true,"expandedIcon": "fa-folder-open","collapsedIcon": "fa-folder"})
     this.tree[0].children=[];
      this.setItems(this.tree[0]);
     // this.getProductos();
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

  setItems(tree:any,idOrden?:number){
      let i=0;
      if (!idOrden) idOrden= this.orden.id;
     console.log('setting items...',tree, idOrden)
      let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+this.field+idOrden; 
        this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
          response => {
            //this.tree[0].children=[];
            if (response.success && response.data) {
              for (let element of response.data) { 
                  //let node = ({"label" :element.numlote})
                  if (element.idmateriaprima >0){
                   //this.tree[0].children.push({
                       tree.children.push({
                       "label": element.producto + ' ' + element.proveedor,
                       "expanded":true,
                       //"parent": tree,
                        "data": {"tipo":"materiaprima","idmateriaprima":element.idmateriaprima,"proveedor":element.proveedor,"numlote_proveedor":element.numlote_proveedor,"level":0},
                        "expandedIcon": "fa-folder-open",
                        "collapsedIcon": "fa-folder"});
                        this.getOrdenes(tree.children[i],element.idmateriaprima,"idmateriaprima",1);
                        
                  //this.items.push(new ProduccionDetalle(element.id,element.idorden,element.proveedor,element.producto,element.numlote,element.idmateriaprima,element.idloteinterno,element.cantidad,element.tipo_medida));
                }else{
                this.setItems(tree,element.idloteinterno)
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
    let i=0;
    level++;
//    this.tree[0].children.forEach((child)=> {
//        let parametros = '&idempresa=' + this.empresasService.seleccionada+"&idmateriaprima="+child.data.idmateriaprima; 
        let parametros = '&idempresa=' + this.empresasService.seleccionada+"&"+tipo+"="+id; 
        console.log(parametros);
//        child.children=[];
       // this.tree[0].children[nodo].children=[];
       nodo.children=[];
        this.servidor.getObjects(URLS.TRAZA_ORDENES, parametros).subscribe(
          response => {

            if (response.success && response.data) {
              for (let element of response.data) { 
                  //this.tree[0].children[nodo].children.push({
                      nodo.children.push({
                      "label":element.numlote,
                      "parent":nodo,
                      "expanded":true,
                      "data":{"tipo":"orden","idOrden":element.idorden,"fecha_inicio_orden":element.fecha_inicio,"idDetalleOrden":element.id,"numlote_proveedor":element.numlote_proveedor,"level":level,"almacen":element.idalmacen,"cliente":element.idcliente,"fecha_caducidad":element.fecha_caducidad}
                    });
                    this.getOrdenes(nodo.children[i],element.idorden,"idorden",level);
                    i++;
             }
//             i++;
            }
        },
        error=>console.log(error),
        ()=>{ }
        ); 
//    });
}

getParent(idOrden){

}

    closeFicha(index:number){
        this.msgs.splice(index,1);
    }
    nodeSelect(event) {
        //this.msgs = [];
        let index= this.almacenes.findIndex((almacen)=>almacen.id==event.node.data.almacen);
        let almacen;
        (index <0)?almacen=false:almacen = this.almacenes[index].nombre;
        let indice_cliente= this.clientes.findIndex((cliente)=>cliente.id==event.node.data.cliente);
        let n_cliente;
        (indice_cliente <0)?n_cliente=false:n_cliente = this.clientes[indice_cliente].nombre;
        console.log(indice_cliente,n_cliente,this.clientes)
        this.msgs.push({label: event.node.label, data: event.node.data, summary:'Node Selected', detail: event.node.label,almacen:almacen,cliente:n_cliente});
        this.message="";
        
        console.log(this.msgs);
        switch(event.node.data.tipo){
            case "materiaprima":
            this.message="label:"+event.node.label+" idMateriaPrima:"+ event.node.data.idmateriaprima+" proveedor:"+ event.node.data.proveedor+" numlote proveedor:"+ event.node.data.numlote_proveedor;
            console.log("parent",event.node.parent);
            let index = this.tree[0].children.findIndex((item) => item.data.idmateriaprima == event.node.data.idmateriaprima);
            this.getOrdenes(event.node,event.node.data.idmateriaprima,"idmateriaprima",0);
            break;
            case "orden":
            this.message="label:"+event.node.label+" idOrden:"+ event.node.data.idOrden+" Fecha Inicio Orden:"+ event.node.data.fecha_inicio_orden+" idDetalleOrden:"+ event.node.data.idDetalleOrden+" numlote_proveedor:"+ event.node.data.numlote_proveedor;
            console.log("parent",event.node.parent);
            let indice = this.tree[0].children.findIndex((item) => item.data.idOrden == event.node.data.idOrden);
            this.getOrdenes(event.node,event.node.data.idOrden,"idorden",event.node.data.level);
            break;
            case "materiainterna":

            break;
        }
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

downloadPdf(){
        let pdf = new jsPDF();
        let options = {
            pagesplit: true
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
// getProductos(idProveedor:number){
//          let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=proveedores_productos&field=idproveedor&idItem="+idProveedor; 
//         this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
//           response => {
//             this.productos = [];
//             if (response.success && response.data) {
//               for (let element of response.data) { 
//                   this.productos.push({"id":element.id,"nombre":element.nombre});
//              }
//             }
//         },
//         error=>console.log(error),
//         ()=>{this.setItems()}
//         ); 
// }

// getEntradasProducto(idProducto: number){
//          let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=proveedores_entradas_producto&field=idproducto&idItem="+idProducto; 
//         this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
//           response => {
//             this.entrada_productos = [];
//             if (response.success && response.data) {
//               for (let element of response.data) { 
//                   this.entrada_productos.push({"id":element.id,"lote":element.numlote});
//              }
//             }
//         },
//         error=>console.log(error),
//         ()=>{this.setItems()}
//         ); 
// }

// getProveedores(){
//          let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=proveedores"; 
//         this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
//           response => {
//             this.proveedores = [];
//             this.proveedores.push({"id":0,"nombre":"Interno"})
//             if (response.success && response.data) {
//               for (let element of response.data) { 
//                   this.proveedores.push({"id":element.id,"nombre":element.nombre});
//              }
//             }
//         },
//         error=>console.log(error),
//         ()=>{this.setItems()}
//         ); 
// }


}
