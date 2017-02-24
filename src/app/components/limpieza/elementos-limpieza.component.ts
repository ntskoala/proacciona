import { Component, OnInit, Input, OnChanges } from '@angular/core';
import {SelectItem} from 'primeng/primeng';
import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { LimpiezaElemento } from '../../models/limpiezaelemento';
import { LimpiezaZona } from '../../models/limpiezazona';
import { Modal } from '../../models/modal';

@Component({
  selector: 'elementos-limpieza',
  templateUrl: './elementos-limpieza.component.html',
  styleUrls:['limpieza.component.css']
})

export class ElementosLimpiezaComponent implements OnInit, OnChanges{
@Input() limpieza: LimpiezaZona;
public nuevoItem: LimpiezaElemento = new LimpiezaElemento(0,0,'','');
public items: LimpiezaElemento[];
public guardar = [];
public idBorrar;
public url=[];
public verdoc: boolean = false;
public foto:string;
public protocolo:boolean[];
public newItemprotocolo:boolean;
public color:string="accent";
public baseurl = URLS.DOCS + this.empresasService.seleccionada + '/limpieza_elemento/';
modal: Modal = new Modal();
entidad:string="&entidad=limpieza_elemento";
field:string="&field=idlimpiezazona&idItem=";
es;
public cantidad:number=1;
public productosSeleccionadosItem:Object[]=[];
public productosSeleccionados: string[]=[];
public productos:SelectItem[]=[];
  constructor(private servidor: Servidor,private empresasService: EmpresasService) {}

  ngOnInit() {
     // this.setItems();
      this.setProductos();
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
      this.setItems();
  }

  photoURL(i,tipo) {
    let extension = this.items[i].protocolo.substr(this.items[i].protocolo.length-3);
    let url = this.baseurl+this.items[i].id +"_"+this.items[i].protocolo;
    if (extension == 'jpg' || extension == 'epg' || extension == 'gif' || extension == 'png'){
    this.verdoc=!this.verdoc;
    this.foto = url
    }else{
      window.open(url,'_blank');

    }

  }
  setProductos(){
          let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=limpieza_producto"; 
        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            this.items = [];
            if (response.success && response.data) {
              for (let element of response.data) {  
                  this.productos.push(element.nombre);
             }
            }
        },
        error=>console.log(error),
        ()=>{
          console.log('completd products');
          this.setItems();
        }
        );

  }

  setItems(){
      console.log('setting items...')
      let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+this.field+this.limpieza.id; 
        this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
          response => {
            this.items = [];
            this.protocolo =[];
            if (response.success && response.data) {
              for (let element of response.data) { 
                  this.items.push(new LimpiezaElemento(element.id,element.idlimpiezazona,element.nombre,new Date(element.fecha),element.tipo,element.periodicidad,element.productos,element.protocol,element.protocolo,element.usuario,element.responsable));
                  this.protocolo.push(false);
             }
            }
        },
        error=>console.log(error),
        ()=>{
          //if(this.nuevoItem.id != 0) this.nuevoItem.id =0;
          console.log("elementos de limpieza:",this.items)
          console.log('Fin elemento de limpieza');
          }
        );
  }



  newItem() {
    console.log (this.nuevoItem, this.cantidad);
    let param = this.entidad+this.field+this.limpieza.id;
    this.nuevoItem.idlimpiezazona = this.limpieza.id;
    this.nuevoItem.fecha = new Date(Date.UTC(this.nuevoItem.fecha.getFullYear(), this.nuevoItem.fecha.getMonth(), this.nuevoItem.fecha.getDate()))
    //this.nuevoItem.productos = JSON.stringify(this.productosSeleccionados);
    //this.nuevoItem.periodicidad = this.mantenimientos[i].periodicidad;
    for (let x=0;x<this.cantidad;x++){
    this.servidor.postObject(URLS.STD_ITEM, this.nuevoItem,param).subscribe(
      response => {
        if (response.success) {
          //this.nuevoItem.id = response.id;
          this.items.push(this.nuevoItem);
          this.items[this.items.length-1].id= response.id;
          this.productosSeleccionados=[];
          //console.log(this.items, this.nuevoItem);
          //this.nuevoItem.id = 0;
        }
    },
    error =>console.log(error),
    () =>this.setItems()   
    //this.nuevoItem = new LimpiezaElemento(0,0,'','');
    );
    }
   // this.nuevoItem = new LimpiezaElemento(0,0,'','');
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
    item.productos = this.items[i].productos;
    item.protocol = this.items[i].protocol;
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

  uploadImg(event, idItem,i,field) {
    console.log(event)
    var target = event.target || event.srcElement; //if target isn't there then take srcElement
    let files = target.files;
    //let files = event.srcElement.files;
    let idEmpresa = this.empresasService.seleccionada.toString();
    this.servidor.postDoc(URLS.UPLOAD_DOCS, files,'limpieza_elemento',idItem, this.empresasService.seleccionada.toString(),field).subscribe(
      response => {
        console.log('doc subido correctamente',files[0].name);
        this.items[i].protocolo = files[0].name;
        this.url[i]= URLS.DOCS + this.empresasService.seleccionada + '/limpieza_elementos/' +  idItem +'_'+files[0].name;
        // let activa = this.empresas.find(emp => emp.id == this.empresasService.seleccionada);
        // activa.logo = '1';
      }
    )
  }

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
setProtocol(protocol:string,i:number,itemId:number){
 if (i<0){
this.nuevoItem.protocol = protocol;
this.newItemprotocolo = false;
 }else{
  this.items[i].protocol = protocol;
  this.protocolo[i] = false;
  this.itemEdited(itemId);
 }
}
verProtocolo(i){
  if (i<0){
    this.newItemprotocolo = !this.newItemprotocolo;
  }else{
  this.protocolo[i] = !this.protocolo[i];
  this.protocolo[i]? this.color='primary':this.color='accent';
}
}

setProducts(productos:string,i?: number, itemId?:number){
  console.log(productos,i,itemId)
if (i >=0){
  this.items[i].productos = productos;
  this.itemEdited(itemId);
}else{
  this.nuevoItem.productos = productos;
}

}

}
