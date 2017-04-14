import { Component, OnInit, Input, OnChanges } from '@angular/core';
//import {SelectItem} from 'primeng/primeng';
import { Servidor } from '../../services/servidor.service';
import { PermisosService } from '../../services/permisos.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { Almacen } from '../../models/almacenes';

import { Modal } from '../../models/modal';


export class alerg{
  constructor(
    public id:number,
    public nombre:string
  ){}
}

@Component({
  selector: 'almacenes',
  templateUrl: './almacenes.component.html',
  styleUrls:['produccion.css']
})

export class AlmacenesComponent implements OnInit, OnChanges{
public nuevoItem: Almacen = new Almacen(0,0,'',0,0,0,0);
public addnewItem: Almacen = new Almacen(0,0,'',0,0,0,0);
public items: Almacen[];
public lotes: string[]=[];
public guardar = [];
public idBorrar;
public url=[];
public verdoc: boolean = false;
public foto:string;

public baseurl = URLS.DOCS + this.empresasService.seleccionada + '/productos/';
modal: Modal = new Modal();
entidad:string="&entidad=almacenes";



  constructor(private servidor: Servidor,private empresasService: EmpresasService, private permisosService:PermisosService) {}

  ngOnInit() {
      this.setItems();

  }
  ngOnChanges(){
    console.log("onChange");
      this.setItems();
  }

//   photoURL(i,tipo) {
//     let extension = this.items[i].doc.substr(this.items[i].doc.length-3);
//     let url = this.baseurl+this.items[i].id +"_"+this.items[i].doc;
//     if (extension == 'jpg' || extension == 'epg' || extension == 'gif' || extension == 'png'){
//     this.verdoc=!this.verdoc;
//     this.foto = url
//     }else{
//       window.open(url,'_blank');
//     }
//   }

  setItems(){
     console.log('setting items...')
      let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad; 
        this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
          response => {
            let i=0;
            this.items = [];
            if (response.success && response.data) {
              for (let element of response.data) { 
                  if (element.idproduccionordenactual>0) this.getLote(element.idproduccionordenactual,i);
                  this.items.push(new Almacen(element.id,element.idempresa,element.nombre,element.capacidad,element.estado,element.idproduccionordenactual,element.level));
                  i++;
              }
            }
        },
        error=>console.log(error),
        ()=>{
          if(this.addnewItem.id != 0) this.addnewItem.id =0;
          }
        );
  }

getLote(lote:number,i:number){
      let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=produccion_orden"+"&field=id&idItem="+lote; 
        this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
          response => {
            //this.items = [];
            if (response.success && response.data) {
              for (let element of response.data) { 
                 this.lotes[i]= element.numlote;
             }
            }
        },
        error=>console.log(error),
        ()=>{}
        );
}

  newItem() {
    
    let param = this.entidad;
    this.nuevoItem.idempresa = this.empresasService.seleccionada;
    this.addnewItem = this.nuevoItem;
    this.servidor.postObject(URLS.STD_ITEM, this.addnewItem,param).subscribe(
      response => {
        if (response.success) {
          this.items.push(this.addnewItem);
          this.items[this.items.length-1].id= response.id;
        }
    },
    error =>console.log(error),
    () =>this.setItems()   
    );

   this.nuevoItem = new Almacen(0,0,'',0,0,0,0);
  }



    itemEdited(idItem: number, fecha?: any) {
    this.guardar[idItem] = true;
    //console.log (fecha.toString());
  }
 saveItem(item: Almacen,i: number) {
    this.guardar[item.id] = false;
    let parametros = '?id=' + item.id+this.entidad;    
    item.idempresa = this.empresasService.seleccionada;  
    this.servidor.putObject(URLS.STD_ITEM, parametros, item).subscribe(
      response => {
        if (response.success) {
        }
    });
  }


checkBorrar(idBorrar: number) {
    // Guardar el id del control a borrar
    this.idBorrar = idBorrar;
    // Crea el modal
    this.modal.titulo = 'produccion.borrarProductoT';
    this.modal.subtitulo = 'produccion.borrarProductoST';
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
            let controlBorrar = this.items.find(prod => prod.id == this.idBorrar);
            let indice = this.items.indexOf(controlBorrar);
            this.items.splice(indice, 1);
          }
      });
    }
  }

//   uploadImg(event, idItem,i,field) {
//     console.log(event)
//     var target = event.target || event.srcElement; //if target isn't there then take srcElement
//     let files = target.files;
//     //let files = event.srcElement.files;
//     let idEmpresa = this.empresasService.seleccionada.toString();
//     this.servidor.postDoc(URLS.UPLOAD_DOCS, files,'productos',idItem, this.empresasService.seleccionada.toString(),field).subscribe(
//       response => {
//         console.log('doc subido correctamente',files[0].name);
//         this.items[i].doc = files[0].name;
//         this.url[i]= URLS.DOCS + this.empresasService.seleccionada + '/productos/' +  idItem +'_'+files[0].name;
//         // let activa = this.empresas.find(emp => emp.id == this.empresasService.seleccionada);
//         // activa.logo = '1';
//       }
//     )
//   }

// setAlergenos(alergens: string, idItem?: number, i?: number){
//   console.log(alergens,idItem,i);
//   if (!idItem){
//   this.nuevoItem.alergenos = alergens;
//   }else{
//     this.itemEdited(idItem);
//     this.items[i].alergenos = alergens;
//     console.log(this.items[i]);
//   }
// }


}
