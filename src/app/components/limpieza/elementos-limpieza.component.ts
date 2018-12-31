import { Component, OnInit, Input,Output,EventEmitter, OnChanges } from '@angular/core';
//import {SelectItem} from 'primeng/primeng';
import {DataTable} from 'primeng/primeng';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from '@ngx-translate/core';

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
public addnewItem: LimpiezaElemento = new LimpiezaElemento(0,0,'','');
public items: LimpiezaElemento[];
public cols:any[];
public newRow:boolean=false;

public periodicidadActivada:boolean;
public guardar = [];
public alertaGuardar:object={'guardar':false,'ordenar':false};
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
public fotourl:string;
public currentExpandedId: number;
public tipos:object[]=[{label:'interno', value:'interno'},{label:'externo', value:'externo'}];
public viewPeriodicidad: any=null;
public expanded:boolean=false;
//***   EXPORT DATA */
public exportar_informes: boolean =false;
public exportando:boolean=false;
public informeData:any;
//***   EXPORT DATA */
  constructor(public servidor: Servidor,public empresasService: EmpresasService
    , public translate: TranslateService, private messageService: MessageService) {}

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
        if (localStorage.getItem("idioma")=="cat") this.tipos=[{label:'intern', value:'interno'},{label:'extern', value:'externo'}];
        this.cols = [
          { field: 'nombre', header: 'Nombre', type: 'std', width:160,orden:true,'required':true },
          { field: 'fecha', header: 'fecha', type: 'fecha', width:120,orden:true,'required':true },
          { field: 'tipo', header: 'tipo', type: 'dropdown', width:115,orden:true,'required':true },
          { field: 'periodicidad', header: 'periodicidad', type: 'periodicidad', width:110,orden:false,'required':false },
          { field: 'responsable', header: 'responsable', type: 'std', width:130,orden:true,'required':false }
        ];
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


  getOptions(option){
    if (option=='tipo'){
    return this.tipos;
    }
    }


  periodicidadActiva(activada){
    this.periodicidadActivada=activada;
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
  // setExpanded(evento){
  //   console.log(evento)
  //   this.currentExpandedId = evento.data.id;
  // }
  rowExpanded(evento){
    console.log(evento)
    this.currentExpandedId = evento.data.id;
    this.expanded=true;
  }
  rowCollapsed(evento){
    console.log(evento)
    this.expanded=false;
  }

  openTabProtocolo(evento,index){
    this.fotoProt = null;
    console.log(this.protocolo);
    //let indice = this.protocolo[index][evento.index];
    
    let indice = this.protocolo[this.currentExpandedId][evento.index]

    let extension = this.protocolos[indice].doc.substr(-3,3);
    //let index = this.misproductos.findIndex((producto)=> producto.nombre == this.productos[rowIndex][indice].nombre);
    if (this.protocolos[indice].doc){
      if (extension == 'jpg' || extension == 'peg' || extension == 'png' || extension == 'gif'){
        this.fotoProt = URLS.DOCS + this.empresasService.seleccionada + '/limpieza_protocolos/'+indice +"_"+this.protocolos[indice].doc;        
       this.fotourl=this.fotoProt;
        console.log('imagen',this.fotoProt,this.protocolos[indice].doc.substr(-3,3));
      }else{
        this.fotoProt = URLS.DOCS + this.empresasService.seleccionada + '/limpieza_protocolos/'+indice +"_"+this.protocolos[indice].doc;                
        this.fotourl="./assets/images/viewpdf.jpeg";
        //this.fotoProt = "./assets/images/viewpdf.jpeg";
   console.log('doc',this.fotoProt);
    }
  }
   
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
                    this.protocolo[element.id]=JSON.parse(element.protocolo)
                  }catch(e){
                    this.protocolo[element.id]=[];
                  }
                  this.getProdsElemtento(element.id,index);
                  index++;
             }
                
            }
            this.onElementosLimpieza.emit(this.items);
                console.log ('items',this.items,this.protocolo);
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
            console.log('indice',indice);
            if (indice >= 0){
            let nombre = this.misproductos[indice].nombre;
            this.productos[index].push(new prods(indice,nombre));
            }
          }
          console.log(this.productos)
          
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
    if (!this.alertaGuardar['guardar']){
      this.alertaGuardar['guardar'] = true;
      this.setAlerta('alertas.guardar');
      }
  }
  setAlerta(concept:string){
    let concepto;
    this.translate.get(concept).subscribe((valor)=>concepto=valor)  
    this.messageService.clear();this.messageService.add(
      {severity:'warn', 
      summary:'Info', 
      detail: concepto
      }
    );
  }
  saveAll(){
    for (let x=0;x<this.guardar.length;x++){
      if (this.guardar[x]==true) {
        let indice = this.items.findIndex((myitem)=>myitem.id==x);
        console.log ("id",x,this.items[indice]);
        this.saveItem(this.items[indice],indice)
      }
    }
     
    }


 saveItem(item: LimpiezaElemento,i: number) {
  let indice = this.items.findIndex((myitem)=>myitem.id==item.id);
  console.log('item ',this.items[indice]);
    this.guardar[item.id] = false;
    this.alertaGuardar['guardar'] = false;
    let parametros = '?id=' + item.id+this.entidad;    
    item.idlimpiezazona = this.limpieza.id;  
    item.fecha = new Date(Date.UTC(item.fecha.getFullYear(), item.fecha.getMonth(), item.fecha.getDate()))
    item.periodicidad = this.items[indice].periodicidad; 
   // item.productos = this.items[i].productos;
   // item.protocol = this.items[i].protocol;
   // item.supervisor = this.items[i].supervisor;
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

// setPeriodicidad(periodicidad: string, idItem?: number, i?: number){
//   this.viewPeriodicidad=null;
//   this.periodicidadActivada=false;
//   if (!idItem){
//   this.nuevoItem.periodicidad = periodicidad;
//   // console.log(this.nuevoItem.periodicidad);

//   }else{
//     // console.log(idItem,i,periodicidad);
//     this.itemEdited(idItem);
//     let indice = this.items.findIndex((item)=>item.id==idItem);
//     this.items[indice].periodicidad = periodicidad;
//     // console.log(this.items[indice]);
//   }
// }


setPeriodicidad(periodicidad: string, idItem?: number, i?: number){
  this.viewPeriodicidad=null;
  if (!idItem){
  this.nuevoItem.periodicidad = periodicidad;
  console.log(this.nuevoItem.periodicidad);

  }else{
    this.itemEdited(idItem);
    let indice = this.items.findIndex((item)=>item.id==idItem);
    this.items[indice].periodicidad = periodicidad;
  }
  //this.nuevoItem  = new LimpiezaElemento(0,0,'','');
}
openPeriodicidad(Mantenimiento){
  console.log('view Periodicidad Ok',Mantenimiento);
  if (Mantenimiento.id == 0){
    this.viewPeriodicidad='true';
  }else{
    this.nuevoItem= Mantenimiento;
    this.viewPeriodicidad=Mantenimiento.periodicidad;
  }
}
closePeriodicidad(activo){
if (activo==false){
  this.nuevoItem  = new LimpiezaElemento(0,0,'','');
  this.viewPeriodicidad=false;
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

ordenar() {
  console.log('ORDENANDO')
  this.procesando = true;
  this.alertaGuardar['ordenar'] = false;
  this.items.forEach((item) => {
    this.saveItem(item, 0);
  });
  this.items = this.items.slice();
  this.procesando = false;
}

editOrden(){
  if (!this.alertaGuardar['ordenar']){
    this.alertaGuardar['ordenar'] = true;
    this.setAlerta('alertas.nuevoOrden');
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
//*************** */


openNewRow(){
  //this.nuevoMantenimiento =  new MantenimientosMaquina(0,0,'','');
  console.log('newRow',this.newRow);
  this.newRow = !this.newRow;
  }
  closeNewRow(){
    //this.nuevoMantenimiento =  new MantenimientosMaquina(0,0,'','');
    this.newRow = false;
    }
      //**** EXPORTAR DATA */

  async exportarTable(){
    this.exportando=true;
    this.informeData = await this.ConvertToCSV(this.cols, this.items);
  }

  informeRecibido(resultado){
    console.log('informe recibido:',resultado);
    if (resultado){
      setTimeout(()=>{this.exportando=false},1500)
    }else{
      this.exportando=false;
    }
  }

  ConvertToCSV(controles,objArray){
    var cabecera =  typeof controles != 'object' ? JSON.parse(controles) : controles;
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    console.log(cabecera,array)
    let informeCabecera=[];
    let informeRows=[];
                var str = '';
                var row = "";
                let titulo="";
                for (var i = 0; i < cabecera.length; i++) {
                  this.translate.get(cabecera[i]["header"]).subscribe((desc)=>{titulo=desc});
                  row += titulo + ';';
                }
                row = row.slice(0, -1);
                informeCabecera = row.split(";");

                str='';
                for (var i = 0; i < array.length; i++) {
                  var line ="";
                   for (var x = 0; x < cabecera.length; x++) {
                  
                    let valor='';
                    
                    switch (cabecera[x]['type']){
                      case 'fecha':
                      valor = moment(array[i][cabecera[x]['field']]).format('DD-MM-YYYY');
                      break;
                      case 'dropdown':
                      valor = (array[i][cabecera[x]['field']]==null)?'':this.getDropDownValor(cabecera[x]['field'], array[i][cabecera[x]['field']]);
                      break;
                      case 'periodicidad':
                      valor= JSON.parse(array[i][cabecera[x]['field']])["repeticion"];
                      break;
                      default:
                      valor = (array[i][cabecera[x]['field']]==null)?'':array[i][cabecera[x]['field']];
                      break;
                    }

                  line += valor + ';';
                }
                line = line.slice(0,-1);

                    informeRows.push(line.split(";"));
    
                }
                let informe='';
                this.translate.get('limpieza.limpiezas').subscribe((desc)=>{informe=desc});
                return {'cabecera':[informeCabecera],'rows':informeRows,'comentarios':[],'informes':informe};
    }

    getDropDownValor(tabla,valor){
      let Value;
      switch (tabla){
        case "tipo":
        Value = valor;
        break;
      }
      console.log(tabla,valor,Value);
      return Value;
    }

}
