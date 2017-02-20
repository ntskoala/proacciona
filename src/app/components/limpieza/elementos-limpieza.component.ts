import { Component, OnInit, Input, OnChanges } from '@angular/core';

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
public baseurl = URLS.DOCS + this.empresasService.seleccionada + '/limpieza_elemento/';
modal: Modal = new Modal();
entidad:string="&entidad=limpieza_elemento";
field:string="&field=idlimpiezazona&idItem=";
es
  constructor(private servidor: Servidor,private empresasService: EmpresasService) {}

  ngOnInit() {
      this.setItems();
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
    this.verdoc=!this.verdoc;
    this.foto = this.baseurl+this.items[i].id +"_"+this.items[i].protocolo;
  }

  setItems(){
  //  let params = this.maquina.id;
  //  let parametros = '&idmaquina=' + params;
      let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+this.field+this.limpieza.id; 
        this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
          response => {
            this.items = [];
            if (response.success && response.data) {
              for (let element of response.data) {  
                  this.items.push(new LimpiezaElemento(element.id,element.idlimpiezazona,element.nombre,new Date(element.fecha),element.tipo,element.periodicidad,element.protocolo,element.usuario,element.responsable));
                  // this.url.push({"imgficha":this.baseurl + element.id +'_'+element.imgficha,"imgcertificado":this.baseurl + element.id +'_'+element.imgcertificado});
             }
            }
             console.log("elementos_limpieza",this.items);
        });
       
  }



  newItem() {
    console.log (this.nuevoItem);
    let param = this.entidad+this.field+this.limpieza.id;
    this.nuevoItem.idlimpiezazona = this.limpieza.id;
    this.nuevoItem.fecha = new Date(Date.UTC(this.nuevoItem.fecha.getFullYear(), this.nuevoItem.fecha.getMonth(), this.nuevoItem.fecha.getDate()))
    //this.nuevoItem.periodicidad = this.mantenimientos[i].periodicidad;
    this.servidor.postObject(URLS.STD_ITEM, this.nuevoItem,param).subscribe(
      response => {
        if (response.success) {
          this.nuevoItem.id = response.id;
          this.items.push(this.nuevoItem);
          this.nuevoItem = new LimpiezaElemento(0,0,'','');
        }
    });
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

}
