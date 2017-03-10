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
selectedFile3: TreeNode;
selectedFile2: TreeNode;
@Input() orden: ProduccionOrden;
public nuevoItem: ProduccionDetalle = new ProduccionDetalle(0,0,'','','',0,0,0,'');
//public addnewItem: ProveedorLoteProducto = new ProveedorLoteProducto('','','','',0,0);;
public items: ProduccionDetalle[];
public productos: any[]=[];
public proveedores: any[]=[];
public entrada_productos: any[]=[];
public medidas: string[]=['Kg.','g.','l.','ml.','bolsa','caja','sacos','palet'];
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
     this.tree = [];
     this.tree.push({"label": "inicio","data": "inicio","expandedIcon": "fa-folder-open","collapsedIcon": "fa-folder"})
    // this.setItems();
  }

  ngOnChanges(){
    console.log("onChange");
      this.setItems();
     // this.getProductos();
  }






  setItems(){
     console.log('setting items...')
      let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+this.field+this.orden.id; 
        this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
          response => {
            this.tree[0].children=[];
            if (response.success && response.data) {
              for (let element of response.data) { 
                  //let node = ({"label" :element.numlote})
                   this.tree[0].children.push({"label": element.producto,
            "data": {"idmateriaprima":element.idmateriaprima,"proveedor":element.proveedor},
            //"children":[],
            "expandedIcon": "fa-folder-open",
                   "collapsedIcon": "fa-folder"})
                  //this.items.push(new ProduccionDetalle(element.id,element.idorden,element.proveedor,element.producto,element.numlote,element.idmateriaprima,element.idloteinterno,element.cantidad,element.tipo_medida));
             }
            }
        },
        error=>console.log(error),
        ()=>{this.getOrdenes()}
        );
  }

getOrdenes(){
    let i=0;
    this.tree[0].children.forEach((child)=> {
        let parametros = '&idempresa=' + this.empresasService.seleccionada+"&idmateriaprima="+child.data.idmateriaprima; 
        console.log(parametros);
        child.children=[];
        this.servidor.getObjects(URLS.TRAZA_ORDENES, parametros).subscribe(
          response => {
            //this.proveedores = [];
            //this.proveedores.push({"id":0,"nombre":"Interno"})
            if (response.success && response.data) {
              for (let element of response.data) { 
                  this.tree[0].children[i].children.push({"label":element.numlote,"data":{"idlote":element.id,"numlote_proveedor":element.numlote_proveedor}});
             }
             i++;
            }
        },
        error=>console.log(error),
        ()=>{}
        ); 
    });
}








    nodeSelect(event) {
        this.msgs = [];
        this.msgs.push({severity: 'info', data: event.node.data, summary:'Node Selected', detail: event.node.label});
        console.log(this.msgs);
    }
    
    nodeUnselect(event) {
        this.msgs = [];
        this.msgs.push({severity: 'info', summary: 'Node Unselected', detail: event.node.label});
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
