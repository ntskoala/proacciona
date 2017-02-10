import { Component, OnInit, Input } from '@angular/core';

import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { Lubricante } from '../../models/lubricante';
import { Modal } from '../../models/modal';

@Component({
  selector: 'lubricantes',
  templateUrl: './lubricantes.component.html',
  styleUrls:['ficha-maquina.css']
})

export class LubricantesComponent implements OnInit {

public nuevoItem: Lubricante = new Lubricante(0,this.empresasService.seleccionada);
public items: Lubricante[];
public guardar = [];
public idBorrar;
public url=[];
public verdoc: boolean = false;
public foto:string;
public baseurl = URLS.DOCS + this.empresasService.seleccionada + '/lubricantes/';
modal: Modal = new Modal();

  constructor(private servidor: Servidor,private empresasService: EmpresasService) {}

  ngOnInit() {
      this.setItems();
  }
  photoURL(i,tipo) {
    this.verdoc=!this.verdoc;
    this.foto = this.url[i][tipo];
  }

  setItems(){
  //  let params = this.maquina.id;
  //  let parametros = '&idmaquina=' + params;
      let parametros = '&idempresa=' + this.empresasService.seleccionada; 
        this.servidor.getObjects(URLS.LUBRICANTES, parametros).subscribe(
          response => {
            this.items = [];
            if (response.success && response.data) {
              for (let element of response.data) {  
                  this.items.push(new Lubricante(element.id,element.idempresa,element.nombre,element.marca,element.tipo,element.imgficha,element.imgcertificado));
                   this.url.push({"imgficha":this.baseurl + element.id +'_'+element.imgficha,"imgcertificado":this.baseurl + element.id +'_'+element.imgcertificado});
             }
            }
             console.log("mantenimientos",this.items);
        });
       
  }



  newItem() {
    console.log (this.nuevoItem);
    this.servidor.postObject(URLS.LUBRICANTES, this.nuevoItem).subscribe(
      response => {
        if (response.success) {
          this.nuevoItem.id = response.id;
          this.items.push(this.nuevoItem);
          this.nuevoItem = new Lubricante(0,this.empresasService.seleccionada);
        }
    });
  }


    itemEdited(idMantenimiento: number) {
    this.guardar[idMantenimiento] = true;
    //console.log (fecha.toString());
  }
 saveItem(item: Lubricante) {
    this.guardar[item.id] = false;
    let parametros = '?id=' + item.id;        
    this.servidor.putObject(URLS.LUBRICANTES, parametros, item).subscribe(
      response => {
        if (response.success) {
          console.log('item updated');
        }
    });

  }

checkBorrar(){}

  uploadImg(event, idItem,i,field) {
    console.log(event)
    var target = event.target || event.srcElement; //if target isn't there then take srcElement
    let files = target.files;
    //let files = event.srcElement.files;
    let idEmpresa = this.empresasService.seleccionada.toString();
    this.servidor.postDoc(URLS.UPLOAD_DOCS, files,'lubricantes',idItem, this.empresasService.seleccionada.toString(),field).subscribe(
      response => {
        console.log('doc subido correctamente',files[0].name);
        this.items[i].imgficha = files[0].name;
        this.url[i]= URLS.DOCS + this.empresasService.seleccionada + '/lubricantes/' +  idItem +'_'+files[0].name;
        // let activa = this.empresas.find(emp => emp.id == this.empresasService.seleccionada);
        // activa.logo = '1';
      }
    )
  }

}
