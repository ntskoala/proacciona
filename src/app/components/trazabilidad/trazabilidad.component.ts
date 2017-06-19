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

modal: Modal = new Modal();
entidad:string="&entidad=produccion_detalle";
field:string="&field=idorden&idItem=";//campo de relación con tabla padre
es;

  constructor(public servidor: Servidor,public empresasService: EmpresasService, public translate: TranslateService) {}

  ngOnInit() {
      this.getAlmacenes();
      this.getClientes();
     // this.getProveedores();

    // this.setItems();
  }

  ngOnChanges(){
    console.log("onChange");
    this.nodozero = false;
     this.tree = [];
     this.tree.push({"label": "inicio","data": "inicio","expanded":true,"expandedIcon": "fa-folder-open","collapsedIcon": "fa-folder"})

    //  this.tree.push({"label": this.orden.numlote,
    //   "data":{"tipo":"orden","idOrden":this.orden.id,"fecha_inicio_orden":this.orden.fecha_inicio,"level":0,"almacen":this.orden.idalmacen,"cliente":this.orden.idcliente,"fecha_caducidad":this.orden.fecha_caducidad},
    //  "expanded":true,"expandedIcon": "fa-folder-open","collapsedIcon": "fa-folder"})
     this.tree[0].children=[];
      //this.setItems(this.tree[0],this.orden.id,0);
      this.getParent(this.tree[0],this.orden.id,'idorden',0);
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

            if (response.success && response.data) {
                nodo.children=[];
                //console.log("Resultados Get Orden: ",response.data.length);
              for (let element of response.data) {
                  //this.tree[0].children[nodo].children.push({
                      console.log("idloteinterno"+element.idloteinterno + "idmateriaprima:" + element.idmateriaprima)
                //   if (element.numlote_proveedor){
                      if (element.idmateriaprima>0){
                      //  this.setItems(nodo.children[i],element.idmateriaprima)
                      nodo.children.push({
                      "label":element.proveedor + " " + element.numlote_proveedor,
                      "parent":nodo,
                      //"expanded":true,
                      "data":{"tipo":"materia prima","idOrden":element.idorden,"fecha_inicio_orden":element.fecha_inicio,"idDetalleOrden":element.id,"numlote_proveedor":element.numlote_proveedor,"level":level,"almacen":element.idalmacen,"cantidad":element.cantidad,"cliente":element.idcliente,"proveedor":element.proveedor,"fecha_caducidad":element.fecha_caducidad}
                        });
                        
                        i++
                      }else{
                          lastItem = false;
                      nodo.children.push({
                      "label":element.numlote,
                      "parent":nodo,
                      "expanded":true,
                      "data":{"tipo":"orden","idOrden":element.idorden,"fecha_inicio_orden":element.fecha_inicio,"idDetalleOrden":element.id,"numlote_proveedor":element.numlote_proveedor,"level":level,"almacen":element.idalmacen,"cantidad":element.cantidad,"cliente":element.idcliente,"fecha_caducidad":element.fecha_caducidad}
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
                 this.nodoZero();
             }
//             i++;
            }
        },
        error=>console.log("Error get_orden: ",error),
        ()=>{  
            //this.widthArbol = (+level * 150) + 'px !important';
            let width = 150 * (+level+2);         
            this.widthArbol =  width + 'px';
            console.log(this.widthArbol)
            }
        
        );
}

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
    closeFicha(index:number){
        this.msgs.splice(index,1);
    }
    nodeSelect(event) {
        //this.msgs = [];
        //let index= this.almacenes.findIndex((almacen)=>almacen.id==event.node.data.almacen);
        let almacen = this.findAlmacen(event.node.data.almacen);
        //(index <0)?almacen=false:almacen = this.almacenes[index].nombre;
       // let indice_cliente= this.clientes.findIndex((cliente)=>cliente.id==event.node.data.cliente);
        let n_cliente = this.findCliente(event.node.data.cliente);
        //(indice_cliente <0)?n_cliente=false:n_cliente = this.clientes[indice_cliente].nombre;
       // console.log(indice_cliente,n_cliente,this.clientes)

        let procedencia =""
        // if (event.node.children){
        //  let index0= this.almacenes.findIndex((almacen)=>almacen.id==event.node.children[0].data.almacen);
        // let almacen0;
        // (index0 <0)?almacen0=false:almacen0 = this.almacenes[index0].nombre;
        // procedencia += almacen0+": " + event.node.children[0].data.cantidad +"l."
        // if (event.node.children[1]){
        //     let index1= this.almacenes.findIndex((almacen)=>almacen.id==event.node.children[1].data.almacen);
        //     let almacen1;
        //     (index1 <0)?almacen1=false:almacen1 = this.almacenes[index1].nombre;
        //     procedencia += " y "+almacen1+": " + event.node.children[1].data.cantidad +"l."
        // }
        // }
            if(event.node.children){
            event.node.children.forEach( childNode => {
                let almacen = this.getTanque(childNode.data.almacen)
                if (procedencia.length > 1) procedencia += " y ";
                procedencia += almacen + " : " + childNode.data.cantidad + "l." 
            } );
        }else{
            procedencia = "Proveedor"
        }

        this.msgs.push({label: event.node.label, data: event.node.data, summary:'Node Selected', detail: event.node.label,almacen:almacen,cantidad:event.node.data.cantidad,cliente:n_cliente,procedencia: procedencia});
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
