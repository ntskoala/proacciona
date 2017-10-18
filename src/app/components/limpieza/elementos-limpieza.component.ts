import { Component, OnInit, Input,Output,EventEmitter, OnChanges } from '@angular/core';
//import {SelectItem} from 'primeng/primeng';
import {DataTable} from 'primeng/primeng';


import * as moment from 'moment';

import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { LimpiezaElemento } from '../../models/limpiezaelemento';
import { LimpiezaZona } from '../../models/limpiezazona';
import { Modal } from '../../models/modal';
import { LimpiezaProducto } from '../../models/limpiezaproducto';
import { Protocolo } from '../../models/limpiezaprotocolo';


export class prods{
  constructor(
    public id:number,
    public nombre:string
  ){}
}

@Component({
  selector: 'elementos-limpieza',
  templateUrl: './elementos-limpieza.component.html',
  styleUrls:['limpieza.component.css']
})

export class ElementosLimpiezaComponent implements OnInit, OnChanges{
@Input() limpieza: LimpiezaZona;
@Output() onElementosLimpieza: EventEmitter<LimpiezaElemento[]> = new EventEmitter<LimpiezaElemento[]>();
public nuevoItem: LimpiezaElemento = new LimpiezaElemento(0,0,'','');
public addnewItem: LimpiezaElemento = new LimpiezaElemento(0,0,'','');;
public items: LimpiezaElemento[];
public guardar = [];
public idBorrar;
public url=[];
public verdoc: boolean = false;
public foto:string;
public protocolo:number[][];
public newItemprotocolo:boolean;
public color:string="accent";
public tipo:string="limpieza";
public baseurl = URLS.DOCS + this.empresasService.seleccionada + '/limpieza_elemento/';
public modal: Modal = new Modal();
public modal2: Modal;
public entidad:string="&entidad=limpieza_elemento";
public field:string="&field=idlimpiezazona&idItem=";
public es;
public cantidad:number=1;
public productosSeleccionadosItem:Object[]=[];
public productosSeleccionados: string[]=[];
public misproductos:LimpiezaProducto[]=[];
public productos: prods[][]=[];
public protocolos: Protocolo[]=[];
public elemsProtocolo: any[]=[];
public protocoloActual: any[]=[];
public procesando:boolean=false;
public display:boolean[];
public fotoProd:string;
public fotoProt:string;

  constructor(public servidor: Servidor,public empresasService: EmpresasService) {}

  ngOnInit() {
     // this.setItems();
     // this.setProductos();
                 this.es = {
            monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
                'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            dayNames: ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'],
            dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
            dayNamesMin: ["Do","Lu","Ma","Mi","Ju","Vi","Sa"],
            firstDayOfWeek: 1
        }; 
  }
  ngOnChanges(){
    this.getProtocolos().then(
      (resultado)=>{
        console.log("******PROTOCOLOS",this.protocolos);
    this.getProductos().then(
      (resultado)=>{
        if (resultado){
          console.log(this.misproductos)
           this.setItems();
        }
      });
    });
  }

  // photoURL(i,tipo) {
  //   let extension = this.items[i].protocolo.substr(this.items[i].protocolo.length-3);
  //   let url = this.baseurl+this.items[i].id +"_"+this.items[i].protocolo;
  //   if (extension == 'jpg' || extension == 'epg' || extension == 'gif' || extension == 'png'){
  //   this.verdoc=!this.verdoc;
  //   this.foto = url
  //   }else{
  //     window.open(url,'_blank');

  //   }}
  
  photoURL(url) {
    let extension = url.substr(url.length-3);
    if (extension == 'jpg' || extension == 'peg' || extension == 'gif' || extension == 'png'){
    this.verdoc=!this.verdoc;
    this.foto = url
    }else{
      window.open(url,'_blank');
    }
  }
  openTabProducto(evento,rowIndex){
    let indice = evento.index;
    let index = this.misproductos.findIndex((producto)=> producto.nombre == this.productos[rowIndex][indice].nombre);

   this.fotoProd = URLS.DOCS + this.empresasService.seleccionada + '/limpieza_producto/'+this.misproductos[index].id +"_"+this.misproductos[index].doc;
    console.log(evento,this.fotoProd)
  }
  openTabProtocolo(evento,index){
    this.fotoProt = null;
    console.log(evento.index,this.protocolo[index][evento.index]);
    let indice = this.protocolo[index][evento.index];
    //let index = this.misproductos.findIndex((producto)=> producto.nombre == this.productos[rowIndex][indice].nombre);
    if (this.protocolos[indice].doc){
   this.fotoProt = URLS.DOCS + this.empresasService.seleccionada + '/limpieza_protocolos/'+indice +"_"+this.protocolos[indice].doc;
    }
   console.log(this.protocolos[indice],this.fotoProt);
  }


  setItems(){
      console.log('setting items...')
      let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+this.field+this.limpieza.id; 
        this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
          response => {
            this.items = [];
            this.protocolo =[];
            this.productos=[];
            if (response.success && response.data) {
              let orden:number = 0;
              let index=0;
              for (let element of response.data) {

                let app = element.app== "1"? true:false;
                  if (element.orden == 0){
                  this.itemEdited(element.id);
                  orden++;
                  }else{orden=parseInt(element.orden);}
                  
                  this.items.push(new LimpiezaElemento(element.id,element.idlimpiezazona,element.nombre,new Date(element.fecha),element.tipo,element.periodicidad,element.productos,element.protocol,element.protocolo,element.usuario,element.responsable,app,element.supervisor,0+orden));
                  try{
                    this.protocolo[index]=JSON.parse(element.protocolo)
                  }catch(e){
                    this.protocolo[index]=[];
                  }
                  this.getProdsElemtento(element.id,index);
                  index++;
             }
                this.onElementosLimpieza.emit(this.items);
                console.log ('items',this.items,this.protocolo);
            }
        },
        error=>console.log(error),
        ()=>{
          if(this.addnewItem.id != 0) this.addnewItem.id =0;
          }
        );
  }



  newItem() {
    console.log (this.nuevoItem, this.cantidad);
    let param = this.entidad+this.field+this.limpieza.id;
    this.nuevoItem.idlimpiezazona = this.limpieza.id;
    this.nuevoItem.fecha = new Date(Date.UTC(this.nuevoItem.fecha.getFullYear(), this.nuevoItem.fecha.getMonth(), this.nuevoItem.fecha.getDate()))
    //this.nuevoItem.periodicidad = this.mantenimientos[i].periodicidad;
    this.addnewItem = this.nuevoItem;
    for (let x=0;x<this.cantidad;x++){
    this.servidor.postObject(URLS.STD_ITEM, this.addnewItem,param).subscribe(
      response => {
        if (response.success) {
          this.items.push(this.addnewItem);
          this.items[this.items.length-1].id= response.id;
          //this.setProdsElemtento(response.id);
        }
    },
    error =>console.log(error),
    () =>  {}
    );
  }
  setTimeout(()=>{
      this.setItems()
  },500);
   this.nuevoItem = new LimpiezaElemento(0,0,'','');
  }


getProdsElemtento(idElemento:number,index:number){
  let parametros = "&entidad=limpieza_productos_elemento"+"&field=idelemento&idItem="+idElemento;
    this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
      response => {
        this.productos[index] = [];
        if (response.success && response.data) {
          for (let element of response.data) {

            let indice = this.misproductos.findIndex((producto)=>producto.id==element.idproducto);
            //console.log('indice',indice);
            if (indice >= 0){
            let nombre = this.misproductos[indice].nombre;
            this.productos[index].push(new prods(indice,nombre));
            }
          }
          
        }
    });
}

getProductos(){
  return new Promise((resolve,reject)=>{
  let parametros = "&entidad=limpieza_producto&idempresa="+this.empresasService.seleccionada;
  this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
    response => {
      this.misproductos = [];
      this.display = [];
      if (response.success && response.data) {
        for (let element of response.data) {
          this.display.push(false);
          this.misproductos.push(new LimpiezaProducto(element.id,element.idempresa,element.nombre,element.marca,element.desinfectante,element.dosificacion,element.doc));
        }
        resolve(true);
      }else
      {resolve(true)}
  });
});
}

getProtocolos(){
  return new Promise((resolve, reject) => {
    let x=0;
    let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=limpieza_protocolos"+"&order=id"; 
      this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
        response => {
          if (response.success && response.data) {
            for (let element of response.data) {  
                this.protocolos[element.id] = (new Protocolo(element.id,element.idempresa,element.protocolo,element.nombre,element.doc));
                
                if (element.protocolo) {
                  this.elemsProtocolo[element.id]= JSON.parse(element.protocolo);
                }else{
                  this.elemsProtocolo[element.id] = [];
                }
                x++;
           }
              resolve(true);
          }else{
            resolve(false);
          }
      });
  });
}




onEdit(evento){
this.itemEdited(evento.data.id);
}
    itemEdited(idItem: number, fecha?: any) {
    this.guardar[idItem] = true;
    //console.log (fecha.toString());
  }
 saveItem(item: LimpiezaElemento,i: number) {
    this.guardar[item.id] = false;
    let parametros = '?id=' + item.id+this.entidad;    
    item.idlimpiezazona = this.limpieza.id;  
    item.fecha = new Date(Date.UTC(item.fecha.getFullYear(), item.fecha.getMonth(), item.fecha.getDate()))
    item.periodicidad = this.items[i].periodicidad; 
   // item.productos = this.items[i].productos;
   // item.protocol = this.items[i].protocol;
    item.supervisor = this.items[i].supervisor;
    console.log(item);
    this.servidor.putObject(URLS.STD_ITEM, parametros, item).subscribe(
      response => {
        if (response.success) {
          console.log('item updated');
        }
    });
  }


checkBorrar(idBorrar: number) {
    // Guardar el id del control a borrar
    this.idBorrar = idBorrar;
    // Crea el modal
    this.modal.titulo = 'borrarControlT';
    this.modal.subtitulo = 'borrarControlST';
    this.modal.eliminar = true;
    this.modal.visible = true;
}
  cerrarModal(event: boolean) {
    this.modal.visible = false;
    if (event) {
      let parametros = '?id=' + this.idBorrar+this.entidad;
      this.servidor.deleteObject(URLS.STD_ITEM, parametros).subscribe(
        response => {
          if (response.success) {
            let controlBorrar = this.items.find(mantenimiento => mantenimiento.id == this.idBorrar);
            let indice = this.items.indexOf(controlBorrar);
            this.items.splice(indice, 1);
          }
      });
    }
  }

  // uploadImg(event, idItem,i,field) {
  //   console.log(event)
  //   var target = event.target || event.srcElement; //if target isn't there then take srcElement
  //   let files = target.files;
  //   //let files = event.srcElement.files;
  //   let idEmpresa = this.empresasService.seleccionada.toString();
  //   this.servidor.postDoc(URLS.UPLOAD_DOCS, files,'limpieza_elemento',idItem, this.empresasService.seleccionada.toString(),field).subscribe(
  //     response => {
  //       console.log('doc subido correctamente',files[0].name);
  //       this.items[i].protocolo = files[0].name;
  //       this.url[i]= URLS.DOCS + this.empresasService.seleccionada + '/limpieza_elementos/' +  idItem +'_'+files[0].name;
  //       // let activa = this.empresas.find(emp => emp.id == this.empresasService.seleccionada);
  //       // activa.logo = '1';
  //     }
  //   )
  // }

setPeriodicidad(periodicidad: string, idItem?: number, i?: number){
  if (!idItem){
  this.nuevoItem.periodicidad = periodicidad;
  console.log(this.nuevoItem.periodicidad);

  }else{
    console.log(idItem,i,periodicidad);
    this.itemEdited(idItem);
    this.items[i].periodicidad = periodicidad;
    console.log(this.items[i]);
  }
}
// setProtocol(protocol:string,i:number,itemId:number){
//  if (i<0){
// this.nuevoItem.protocol = protocol;
// this.newItemprotocolo = false;
//  }else{
//   this.items[i].protocol = protocol;
//   this.protocolo[i] = false;
//   //this.itemEdited(itemId);
// this.saveItem(this.items[i],i);
//  }
// }
// verProtocolo(i){
//   if (i<0){
//     this.newItemprotocolo = !this.newItemprotocolo;
//   }else{
//   this.protocolo[i] = !this.protocolo[i];
//   this.protocolo[i]? this.color='primary':this.color='accent';
// }
// }

// setProducts(productos:string[]){
//   this.productosSeleccionados = productos;
// }

setSupervisor(idUsuario: number,item: LimpiezaElemento){
item.supervisor = idUsuario;
this.itemEdited(item.id);
}
//**********************TEMP */
//   setProductos(){
//           let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=limpieza_producto"; 
//         this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
//           response => {
//             this.productos = [];
//             if (response.success && response.data) {
//               for (let element of response.data) {  
//                   this.productos.push(new prods(element.id,element.nombre));
//              }
//             }
//         },
//         error=>console.log(error),
//         ()=>{
//           console.log('completd products');
//          // this.setItems();
//         }
//         );
//   }

// SETPROCESO(){
// console.log("procesando")
// this.items.forEach((element) => {
//   console.log("procesando",element)
// if (element.productos){
//   let tempprods=[];
//   this.productosSeleccionados =[];
// tempprods = JSON.parse(element.productos);
// tempprods.forEach((prod) => {
//                               console.log("procesando producto", prod)
//                               let i = this.productos.findIndex((elem) => this.busca(elem,prod));
//                               console.log("añadir prod", this.productos[i],i);
//                               this.productosSeleccionados.push(this.productos[i].id.toString());
//                             })
// this.setProdsElemtento(element.id)
// }

// });
// }
// busca(elem,prod){
// if (elem.nombre == prod) {
//   return true
// }else{return false}
// }


goUp(index:number,evento:Event){
if (index >0){
    this.items[index].orden--;
    this.saveItem(this.items[index],index);
    this.items[index-1].orden++;
    this.saveItem(this.items[index-1],index-1);
    let temp1:any = this.items.splice(index-1,1);
    console.log(this.items);
    this.items.splice(index,0,temp1[0]);
    console.log(this.items);
    
   this.items = this.items.slice();
  //   setTimeout(()=>{
  //     this.setOrden(evento,dt);
  //   },500);
}else{
  console.log('primer elemento');
}
}

goDown(index:number,evento:Event){
  if (index < this.items.length-1){
    this.items[index].orden++;
    this.saveItem(this.items[index],index);
    this.items[index+1].orden--;

    this.saveItem(this.items[index+1],index+1);
    let temp1:any = this.items.splice(index,1);
    
    console.log(this.items);
    this.items.splice(index+1,0,temp1[0]);
    console.log(this.items);
  this.items = this.items.slice();

    // setTimeout(()=>{
    //   this.setOrden(evento,dt);
    // },500);
  }else{
    console.log('ultimo elemento');
  }
}

exportData(tabla: DataTable){
  console.log(tabla);
  let origin_Value = tabla._value;

  tabla._value = tabla.dataToRender;
  tabla._value.map((limpieza)=>{
      (moment(limpieza.fecha).isValid())?limpieza.fecha = moment(limpieza.fecha).format("DD/MM/YYYY"):'';
      limpieza.periodicidad=this.checkPeriodo(limpieza.periodicidad);
      });

  tabla.csvSeparator = ";";
  tabla.exportFilename = "Elementos_Limpieza_"+this.limpieza.nombre;
  tabla.exportCSV();
  tabla._value = origin_Value;
}

checkPeriodo(periodicidad: string): string{
  if (periodicidad){
    let valor:string;
    let periodo = JSON.parse(periodicidad);
    return periodo.repeticion;
    }else{
      return 'Nul';
    }
  }


}
