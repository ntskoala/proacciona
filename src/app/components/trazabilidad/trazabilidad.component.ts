import { Component, OnInit, Input, OnChanges, ViewChild } from '@angular/core';
import {Tree,TreeNode } from 'primeng/primeng';


import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { ProveedorLoteProducto } from '../../models/proveedorlote';
import { Proveedor } from '../../models/proveedor';
import { ProduccionOrden } from '../../models/produccionorden';
import { ProduccionDetalle } from '../../models/producciondetalle';
import { Modal } from '../../models/modal';


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
expandingTree: Tree;
tree: TreeNode[];
msgs: any[];
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

  constructor(private servidor: Servidor,private empresasService: EmpresasService) {}

  ngOnInit() {
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
                        "data": {"tipo":"materiaprima","idmateriaprima":element.idmateriaprima,"proveedor":element.proveedor,"numlote_proveedor":element.numlote_proveedor,"level":1},
                        "expandedIcon": "fa-folder-open",
                        "collapsedIcon": "fa-folder"});
                        this.getOrdenes(tree.children[i],element.idmateriaprima,"idmateriaprima");
                        
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

getOrdenes(nodo: any,id:number, tipo:string){
    let i=0;
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
                      "data":{"tipo":"orden","idOrden":element.idorden,"fecha_inicio_orden":element.fecha_inicio,"idDetalleOrden":element.id,"numlote_proveedor":element.numlote_proveedor}
                    });
                    this.getOrdenes(nodo.children[i],element.idorden,"idorden");
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


    nodeSelect(event) {
        this.msgs = [];
        this.msgs.push({severity: 'info', data: event.node.data, summary:'Node Selected', detail: event.node.label});
        this.message="";
        
        console.log(this.msgs);
        switch(event.node.data.tipo){
            case "materiaprima":
            this.message="label:"+event.node.label+" idMateriaPrima:"+ event.node.data.idmateriaprima+" proveedor:"+ event.node.data.proveedor+" numlote proveedor:"+ event.node.data.numlote_proveedor;
            console.log("parent",event.node.parent);
            let index = this.tree[0].children.findIndex((item) => item.data.idmateriaprima == event.node.data.idmateriaprima);
            this.getOrdenes(event.node,event.node.data.idmateriaprima,"idmateriaprima");
            break;
            case "orden":
            this.message="label:"+event.node.label+" idOrden:"+ event.node.data.idOrden+" Fecha Inicio Orden:"+ event.node.data.fecha_inicio_orden+" idDetalleOrden:"+ event.node.data.idDetalleOrden+" numlote_proveedor:"+ event.node.data.numlote_proveedor;
            console.log("parent",event.node.parent);
            let indice = this.tree[0].children.findIndex((item) => item.data.idOrden == event.node.data.idOrden);
            this.getOrdenes(event.node,event.node.data.idOrden,"idorden");
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
    
    private expandRecursive(node:TreeNode, isExpand:boolean){
        node.expanded = isExpand;
        if(node.children){
            node.children.forEach( childNode => {
                this.expandRecursive(childNode, isExpand);
            } );
        }
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
