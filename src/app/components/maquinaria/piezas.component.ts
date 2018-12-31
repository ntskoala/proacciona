import { Component, OnInit, Input,Output, OnChanges, EventEmitter } from '@angular/core';

import {DataTable} from 'primeng/primeng';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from '@ngx-translate/core';

import * as moment from 'moment';

import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { Empresa } from '../../models/empresa';
import { PiezasMaquina } from '../../models/piezasmaquina';
 import { Maquina } from '../../models/maquina';
 import { Modal } from '../../models/modal';
@Component({
  selector: 'piezas',
  templateUrl: './piezas.component.html',
  styleUrls:['piezas.component.css','ficha-maquina.css']
})
export class PiezasComponent implements OnInit, OnChanges {
@Input() maquina:Maquina;
@Input() maquinas:Maquina[];
public maquinasSelect:any[]=[{label:'cualquiera', value:0}];
@Output() onPiezas:EventEmitter<PiezasMaquina[]>= new EventEmitter();
public piezas: PiezasMaquina[] =[]; 
public cols:any[];
public nuevoPieza: PiezasMaquina = new PiezasMaquina(0,0,'',0);
public fotoNuevoPieza:any=null;
public newRow:boolean=false;
public editPieza: PiezasMaquina[]=[];
public selectedItem:PiezasMaquina;
public guardar =[];
public alertaGuardar:boolean=false;
public cantidad:number=1;
public idBorrar;
public fotoSrc: string;
public modal2: boolean = false;;
public verdoc: boolean = false;
public url=[];
public foto:string;
public top:string;
public displayDialog:boolean;

//***   EXPORT DATA */
public exportar_informes: boolean =false;
public exportando:boolean=false;
public informeData:any;
//***   EXPORT DATA */

  modal: Modal = new Modal();
  constructor(public servidor: Servidor,public empresasService: EmpresasService
    , public translate: TranslateService, private messageService: MessageService) {}

  ngOnInit() {
    //solo se carga el control si hay una maquina seleccionada, por eso no necesito controlar
 //   this.setMantenimientos();
 this.cols = [
  { field: 'nombre', header: 'Nombre', type: 'std', width:180,'required':true },
  { field: 'maquina', header: 'Maquina', type: 'maquina', width:180,'required':true },
  { field: 'cantidad', header: 'Cantidad', type: 'std', width:95,'required':true },
  { field: 'material', header: 'Material', type: 'std', width:180,'required':false },
  { field: 'doc', header: 'Foto', type: 'foto', width:100,'required':false }
];
this.maquinas.forEach((maquina)=>{this.maquinasSelect.push({label:maquina.nombre, value:maquina.id})})

console.log('Init',this.maquina,this.maquinas);
  
  //this.setMantenimientos();
  }

  photoURL(i) {
   
    let calc = window.scrollY;
    this.top = calc + 'px';
    console.log(this.url[i],this.top)
    this.verdoc=!this.verdoc;
    this.foto = this.url[i];
  }

ngOnChanges(){
  console.log('Changes',this.maquina,this.maquinas);
    this.setMantenimientos();
}
  setMantenimientos(){
    let parametros
    if (this.maquina.id > 0){
     parametros = '&idmaquina=' + this.maquina.id + '&idempresa=' + this.empresasService.seleccionada;;
    }else{
       parametros = '&idempresa=' + this.empresasService.seleccionada;
    }
    //params=2;

    

       // let parametros = '&idempresa=' + seleccionada.id; 
        this.servidor.getObjects(URLS.PIEZAS, parametros).subscribe(
          response => {
            this.piezas = [];
            if (response.success && response.data) {
              for (let element of response.data) {
                this.piezas.push(new PiezasMaquina(element.id, element.idmaquina, element.nombre, element.idempresa, element.cantidad,element.material, element.doc));
                this.guardar[element.id] = false;
                this.url.push(URLS.DOCS + this.empresasService.seleccionada + '/maquina_piezas/' + element.id +'_'+element.doc);
              }
              this.onPiezas.emit(this.piezas);
            }
        },
       error=>console.log(error),
        ()=> {}//console.log("piezas",this.piezas)
        );
  }

  onEdit(evento){
    console.log(evento);
    this.itemEdited(evento.data.id);
    }
    itemEdited(idItem: number) {
    this.guardar[idItem] = true;
    if (!this.alertaGuardar){
      this.alertaGuardar = true;
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

 saveItem(pieza: PiezasMaquina) {
    this.guardar[pieza.id] = false;
    pieza.idempresa = this.empresasService.seleccionada;
    this.alertaGuardar = false;
    let parametros = '?id=' + pieza.id;        
    this.servidor.putObject(URLS.PIEZAS, parametros, pieza).subscribe(
      response => {
        if (response.success) {
          console.log('Pieza updated');
          this.piezas[this.piezas.findIndex((pz)=>pz.id==pieza.id)] = pieza;
        }
    });
  }
  crearItem() {
   // this.nuevoPieza.idmaquina = this.maquina.id;
    let nombreOrigen = this.nuevoPieza.nombre;
    this.nuevoPieza.idempresa = this.empresasService.seleccionada;
    for (let x=0;x<this.cantidad;x++){
      if (x>0) this.nuevoPieza.nombre= nombreOrigen + x;
      this.addItem(this.nuevoPieza,this.nuevoPieza.nombre).then(
        (valor)=>{
          this.cantidad--;
          console.log(this.cantidad,valor,typeof(valor))
          if (valor && this.cantidad == 0){
            this.nuevoPieza = new PiezasMaquina(0,0,'',0);
            this.piezas = this.piezas.slice();
          }
        }
      )
  }
  }

  addItem(item: PiezasMaquina, nombre){
    return new Promise((resolve,reject)=>{
      this.servidor.postObject(URLS.PIEZAS, this.nuevoPieza).subscribe(
      response => {
        if (response.success) {
          item.id = response.id;
          this.piezas.push(new PiezasMaquina(response.id,item.idmaquina,nombre,item.idempresa,item.cantidad,item.material));
          this.url.push('');
          if (this.fotoNuevoPieza){
            this.uploadImg(this.fotoNuevoPieza,item.id,0,'doc');
          }
          resolve(true);
        }
    },
    error =>{
      console.log(error);
      resolve(true);
    },
    () =>  {}
    );
  });
  }

  checkBorrar(idBorrar: number) {
    // Guardar el id del control a borrar
    this.idBorrar = idBorrar;
    // Crea el modal
    this.modal.titulo = 'borrar Pieza';
    this.modal.subtitulo = 'borrar Pieza';
    this.modal.eliminar = true;
    this.modal.visible = true;
  }

  cerrarModal(event: boolean) {
    this.modal.visible = false;
    if (event) {
      let parametros = '?id=' + this.idBorrar;
      this.servidor.deleteObject(URLS.PIEZAS, parametros).subscribe(
        response => {
          if (response.success) {
            let controlBorrar = this.piezas.find(pieza => pieza.id == this.idBorrar);
            let indice = this.piezas.indexOf(controlBorrar);
            this.piezas.splice(indice, 1);
          }
      });
    }
  }

  ventanaFoto(pieza: PiezasMaquina, entidad: string) {
    this.fotoSrc = URLS.DOCS + this.empresasService.seleccionada + '/'+ entidad + "/" + pieza.id+ "_"+ pieza.doc;
    this.modal2 = true;
  }

  uploadImg(event, idItem,i,tipo) {
    if (idItem==0){
      this.fotoNuevoPieza=event;
    }else{
    console.log(event)
    var target = event.target || event.srcElement; //if target isn't there then take srcElement
    let files = target.files;
    //let files = event.srcElement.files;
    let idEmpresa = this.empresasService.seleccionada.toString();
    i = this.piezas.findIndex((pz)=>pz.id==idItem);
    this.servidor.postDoc(URLS.UPLOAD_DOCS, files,'maquina_piezas',idItem, this.empresasService.seleccionada.toString(),tipo).subscribe(
      response => {
        console.log('doc subido correctamente',files[0].name);
        this.piezas[i].doc = files[0].name;
        this.url[i]= URLS.DOCS + this.empresasService.seleccionada + '/maquina_piezas/' +  idItem +'_'+files[0].name;
      }
    )     
  }
  }

  // exportData(tabla: DataTable){
  //   console.log(tabla);
  //   let origin_Value = tabla._value;
  //   tabla._value = tabla.dataToRender;
  //   //tabla._value.map((maquina)=>{});
  //   tabla.csvSeparator = ";";
  //   tabla.exportFilename = "Mantenimietos_preventivos_ "+this.maquina.nombre;
  //   tabla.exportCSV();
  //   tabla._value = origin_Value;
  // }

//************ */
//************ */
//************ */
save() {

    this.nuevoPieza = this.editPieza[0];
    this.crearItem();
  this.closeNewRow();
}
close(){
  this.displayDialog = false;
}
delete() {
  this.checkBorrar(this.editPieza[0].id);
  this.displayDialog = false;
}

showDialogToAdd() {
  this.alertaGuardar = false;
  this.editPieza[0] = this.nuevoPieza;
  this.editPieza[0].idempresa = this.empresasService.seleccionada;
  this.displayDialog = true;
}

onRowSelect(event) {
  //this.newCar = false;
  this.alertaGuardar = true;
  this.editPieza[0] = this.cloneItem(event.data);
  this.fotoSrc = URLS.DOCS + this.empresasService.seleccionada + '/'+ 'maquina_piezas' + "/" + this.editPieza[0].id+ "_"+ this.editPieza[0].doc;
  this.displayDialog = true;
}
cloneItem(p: PiezasMaquina): PiezasMaquina {
  let pieza: PiezasMaquina=new PiezasMaquina(null,null,null,null);
  for (let prop in p) {
      pieza[prop] = p[prop];
  }
  return pieza;
}


openNewRow(){
  this.editPieza.push(this.nuevoPieza);
  console.log('newRow',this.newRow,this.editPieza);
  this.newRow = !this.newRow;
  }
  closeNewRow(){
    //this.nuevoMantenimiento =  new MantenimientosMaquina(0,0,'','');
    this.newRow = false;
    }

  //**** EXPORTAR DATA */

  async exportarTable(){
      this.exportando=true;
      this.informeData = await this.ConvertToCSV(this.cols, this.piezas);
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
                  for (var i = 0; i < cabecera.length; i++) {
                    row += cabecera[i]["header"] + ';';
                  }
                  row = row.slice(0, -1);
                  informeCabecera = row.split(";");

                  str='';
                  for (var i = 0; i < array.length; i++) {
                    var line ="";
                     for (var x = 0; x < cabecera.length; x++) {
                    
                      let valor='';
                      valor = array[i][cabecera[x]['field']]
                    line += valor + ';';
                  }
                  line = line.slice(0,-1);

                      informeRows.push(line.split(";"));
      
                  }
                  let informe='';
                  this.translate.get('maquinas.piezas').subscribe((desc)=>{informe=desc});
                  return {'cabecera':[informeCabecera],'rows':informeRows,'comentarios':[],'informes':informe};
      }
  




    // ConvertToCSV(controles,objArray){
    //   var cabecera =  typeof controles != 'object' ? JSON.parse(controles) : controles;
    //   var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    //   console.log(cabecera,array)
    //   let informeCabecera=[];
    //   let informeRows=[];
    //   let comentarios = [];
    //               var str = '';
    //               var row = "";
    //               row += "Usuario;Foto;Fecha;"
    //               for (var i = 0; i < cabecera.length; i++) {
    //                 row += cabecera[i]["header"] + ';';
    //               }
    //               row = row.slice(0, -1);
    //               //append Label row with line break
    //               //str += row + '\r\n';
    //               informeCabecera = row.split(";");
    //               str='';
    //               for (var i = 0; i < array.length; i++) {
    //                 let fotoUrl = ''
    //                 let comentario='';
    //                 if (array[i].foto){
    //                   //+ '/control' + idResultado + '.jpg';
    //                   //fotoUrl = '=hyperlink("'+URLS.FOTOS + this.empresasService.seleccionada + '/control'+ array[i].id + '.jpg";"foto")';
    //                   fotoUrl =URLS.FOTOS + this.empresasService.seleccionada + '/control'+ array[i].id + '.jpg'
    //                }                            
    //                   var line =array[i].usuario+";"+ fotoUrl+";"+array[i].fecha +";";
    //                   //var line =array[i].usuario+";"+array[i].fecha +";";
    //                   //var line =array[i].usuario+";"+array[i].fecha + ";";
      
    //                 for (var x = 0; x < cabecera.length; x++) {
    //                   let columna = cabecera[x]["header"];
    //                   //let resultado = array[i][cabecera[x]];
    //                   let resultado = array[i]["nombre"];
    //                   if (array[i][columna + 'mensaje']) {
    //                     this.translate.get(array[i][columna + 'mensaje']).subscribe((mensaje)=>{comentario +=  columna +": "+mensaje})
    //                   } 
    //                 //line += ((array[i][cabecera[x]] !== undefined) ?array[i][cabecera[x]] + ';':';');
    //                 line += ((columna == resultado && array[i]["valor"] !== undefined) ?array[i]["valor"] + ';':';');
    //               }
    //               line = line.slice(0,-1);
    //                   //str += line + '\r\n';
    //                   informeRows.push(line.split(";"));
    //                   comentarios.push(comentario);
      
    //               }
    //               //return str;
    //               return {'cabecera':[informeCabecera],'rows':informeRows,'comentarios':comentarios,'informes':'Controles'};
    //   }


}