import { Component, OnInit,OnChanges, Input, Output, EventEmitter } from '@angular/core';


import { EmpresasService } from '../../../services/empresas.service';
import { Servidor } from '../../../services/servidor.service';
import { URLS } from '../../../models/urls';
import { Usuario } from '../../../models/usuario';
import { LimpiezaProducto } from '../../../models/limpiezaproducto';
import { LimpiezaElemento } from '../../../models/limpiezaelemento';
import { Protocolo } from '../../../models/limpiezaprotocolo';

@Component({
  selector: 'app-protocolos-cuadro',
  templateUrl: './protocolos-cuadro.component.html',
  styleUrls: ['./protocolos-cuadro.component.css']
})
export class ProtocolosCuadroComponent implements OnInit, OnChanges {
  @Input() items: LimpiezaElemento[];
  @Input() tipoControl;
  @Input() protocolos: Protocolo[];
  @Output() onPermisos: EventEmitter<number> = new EventEmitter<number>();

  public hayproducto: any[] = [];
  public misproductos:any[]=[];
  public tabla: object[];
  public cols: object[];
  public procesando: boolean = false;


  constructor(public servidor: Servidor, public empresasService: EmpresasService) { }
  
  ngOnInit() {
  }
  ngOnChanges() {
    this.procesando = true;
    let x = 0;
    let i=0;
    //console.log(x,i,this.protocolos,this.items)
    if (this.protocolos && this.items){
    this.items.forEach((elementoLimpieza)=>{
      //console.log(x,i,elementoLimpieza)
      this.getMisProductos(elementoLimpieza.id,x).then(
        (response) =>{
          //console.log(x,i)
          i++;

          if (i == this.items.length){
           // console.log(x,i,this.items.length)
            this.mergeData();
            this.procesando=false;
            //console.log(this.misproductos)
           }
        }
      )
      x++;
     

    });
    // this.setHayProductos().then(
    //   (resultado)=>{
    //     if (resultado)
    //     this.mergeData();
    //   });
    }
  }
  getMisProductos(idElementoLimpieza,x){
    return new Promise((resolve, reject) => {
  //   this.hayproducto[x] = [];
  //   this.misproductos[x] = [];
  // if (this.items ){
  //         let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=limpieza_productos_elemento"+"&field=idelemento&idItem="+idElementoLimpieza; 
  //       this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
  //         response => {
             
  //           if (response.success && response.data) {
  //             for (let element of response.data) {  
  //               this.misproductos[x].push(element.id)
  //                 this.hayproducto[x].push(element.idproducto);
  //            }
  //               resolve(x);
  //           }else{
  //             resolve(x);
  //           }
  //       },
  //       error=>console.log(error),
  //       ()=>{
          
  //       }
  //       );
  // }else{
     resolve(x);
  // }
    });
}


  mergeData() {
    console.log('###Merging Prods',this.hayproducto);
    this.tabla = [];
    this.cols = [];
    this.cols.push({ field: 'protocolo', header: 'Protocolo' });
    this.items.forEach(control => {
      this.cols.push({ field: control.nombre, header: control.nombre })
    });
    
    this.protocolos.forEach(protocolo => {
      let generalSwitch = true;
      let row = '{"protocolo":"' + protocolo.nombre + '","idprotocolo":"' + protocolo.id + '"'
      this.items.forEach(control => {
        let valor;
      try {
        let prots = JSON.parse(control.protocolo);
        valor = prots.findIndex((prot)=> prot == protocolo.id);
    } catch (e) {
        valor= -1
    }
       let check: boolean;
        if (valor < 0) {
          check = false;
          generalSwitch = false;
        } else {
          check = true
        };
        row += ',"' + control.nombre + '":' + check + ''
      });
      row += ',"generalSwitch":' + generalSwitch + '}';
      this.tabla.push(JSON.parse(row))
    })
    this.procesando = false;
    console.log(this.tabla)
  }

  setPermiso(idprotocolo, event, indexControl, indexProt,col?) {
    console.log(idprotocolo,event,col);
    this.procesando = true;
    if (col) {
        console.log(this.tabla[indexProt][col]);
        if (event) {
          this.addPermiso(idprotocolo,this.items[indexControl-1].id,indexControl-1).then(
            (valor) => {
              console.log(this.tabla[indexProt][col])
              if (valor){
                //this.tabla[indexProt][indexControl]=event;
                this.tabla[indexProt][col] = event;
              }
              this.switchGeneral(idprotocolo)
              this.procesando = false;
            }
          )
        } else {
          this.deletePermiso(idprotocolo,this.items[indexControl-1].id,indexControl-1).then(
            (response) => {
              this.tabla[indexProt][col]=event;
              this.switchGeneral(idprotocolo)
              this.procesando = false;
            }
          )
        }

    } else {
      let index = 0;
      this.items.forEach(control => {
        //let existe = this.tabla[indexProt][control.nombre].findIndex((hayprod)=>hayprod==idprotocolo)
        //console.log (idprotocolo, control['id'],index,existe,this.hayproducto[index],event);
        if (event) {
          if (!this.tabla[indexProt][control.nombre]) {
            this.addPermiso(idprotocolo, control['id'],index).then(
              (response) => {
                this.tabla[indexProt][control.nombre]=true;
                this.switch(idprotocolo, control['id'], true);
              });
          }
        } else {
          if (this.tabla[indexProt][control.nombre]) {
            this.deletePermiso(idprotocolo, control['id'],index).then(
              () => {
                this.tabla[indexProt][control.nombre]=false;
                this.switch(idprotocolo, control['id'], false);
              }
            )
          }
        }
       index++; 
      });
      setTimeout(() => {
        this.procesando = false;
      }, 900);
    }
  }



  addPermiso(idProtocolo, idElementoLimpieza,i) {
    return new Promise((resolve, reject) => {
      let valor;
      let myProt = [];
      try {
        myProt = JSON.parse(this.items[i].protocolo);
        valor = myProt.findIndex((prot)=> prot == idProtocolo);
    } catch (e) {
      console.log(e);
        valor= -1
    }
    if (valor <0){
      myProt.push(idProtocolo);

      let miniItem = {'protocolo':JSON.stringify(myProt)};
      this.saveItem(miniItem,idElementoLimpieza).then(
        (respuesta)=>{
          if (respuesta){
            this.items[i].protocolo = JSON.stringify(myProt);
            resolve(true);
          }else{
            resolve(false);
          }
        }
      );
    }else{
        resolve(false);
      }
     } );
  }


  deletePermiso(idProtocolo, idElementoLimpieza,i) {
    return new Promise((resolve, reject) => {
      let valor;
      let myProt = [];
      try {
        myProt = JSON.parse(this.items[i].protocolo);
        valor = myProt.findIndex((prot)=> prot == idProtocolo);
    } catch (e) {
      console.log(e);
        valor= -1
    }
    if (valor >=0){
      myProt.splice(valor,1);

      let miniItem = {'protocolo':JSON.stringify(myProt)};
      this.saveItem(miniItem,idElementoLimpieza).then(
        (respuesta)=>{
          if (respuesta){
            this.items[i].protocolo = JSON.stringify(myProt);
            resolve(true);
          }else{
            resolve(false);
          }
        }
      );
    }else{
        resolve(false);
      }

    });
  }

  saveItem(item: object,id: number) {
    return new Promise((resolve, reject) => {
    let parametros = '?id=' + id+"&entidad=limpieza_elemento";    
    this.servidor.putObject(URLS.STD_ITEM, parametros, item).subscribe(
      response => {
        if (response.success) {
          resolve(true)
        }
    });
  });
  }

  switch(idProtocolo, idControl, estado) {
    //console.log(idProtocolo, idControl, estado)
    let nombreControl = this.items[this.items.findIndex((control) => control.id == idControl)].nombre;
    //let index = this.tabla.findIndex((usuario) => usuario['iduser'] == user);
    let index = this.tabla.findIndex((prot) => prot['idprotocolo'] == idProtocolo);
    //console.log(nombreControl, index);
    this.tabla[index][nombreControl] = estado;
  }

  switchGeneral(idProtocolo) {
    let index = this.tabla.findIndex((prod) => prod['idprotocolo'] == idProtocolo);
    let generalSwitch = true;
    this.items.forEach(control => {
      //console.log(index, control.nombre,this.tabla[index]['protocolo'], this.tabla[index][control.nombre])
      if (this.tabla[index][control.nombre] == false) generalSwitch = false;
    });
   console.log(this.tabla[index]['generalSwitch'], index, generalSwitch)
    this.tabla[index]['generalSwitch'] = generalSwitch;
  }
}

