import { Component, OnInit, Input, OnChanges, ViewChild,Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment/moment';
import { TranslateService } from '@ngx-translate/core';
import {MessageService} from 'primeng/components/common/messageservice';

import {DataTable} from 'primeng/primeng';
import { Servidor } from '../../services/servidor.service';
import { URLS,cal,dropDownMedidas } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { ProveedorLoteProducto } from '../../models/proveedorlote';
import { Proveedor } from '../../models/proveedor';
import { ProduccionOrden } from '../../models/produccionorden';
import { ProduccionDetalle } from '../../models/producciondetalle';
import { Usuario } from '../../models/usuario';
import { Incidencia } from '../../models/incidencia';
import { Modal } from '../../models/modal';
import { Checklist } from 'app/models/checklist';
import { ResultadoChecklist } from 'app/models/resultadochecklist';
import { AlertasComponent } from '../alertas/alertas.component';


export class alerg{
  constructor(
    public id:number,
    public nombre:string
  ){}
}

@Component({
  selector: 'entrada-productos',
  templateUrl: './entrada-productos.component.html',
  styleUrls:['proveedores.component.css','entrada-productos.component.css']
})

export class EntradaProductosComponent implements OnInit, OnChanges{
@Input() proveedor: Proveedor;
@Input() cambioProductos: boolean;
@Output() onHeightChanged: EventEmitter<string>=new EventEmitter<string>();
@ViewChild('#DT') tabla: DataTable;
public nuevoItem: ProveedorLoteProducto = new ProveedorLoteProducto('',new Date(),new Date(),null,'',null,'',null,0,0,0);
//public addnewItem: ProveedorLoteProducto = new ProveedorLoteProducto('','','','',0,0);;
public items: ProveedorLoteProducto[];
public alertaGuardar:object={'guardar':false,'ordenar':false};
public cols:any[];
public newRow:boolean=false;
// public fechas_inicio:Object={fecha_inicio:moment(new Date()).subtract(30,'days').format('YYYY-MM-DD').toString(),fecha_fin:moment(new Date()).format('YYYY-MM-DD').toString()}//ultimos 30 dias
public fechas_inicio:Object={fecha_inicio:moment(new Date()).subtract(30,'days').toDate(),fecha_fin:moment(new Date()).toDate()}//ultimos 30 dias
public filtro_inicio:String;
public filtro_fin:String;
public filter:boolean=false;
public productos: any[]=[];
public medidas: object[]=dropDownMedidas;
public guardar = [];
public idBorrar;
public url=[];
public verdoc: boolean = false;
public foto:string;
public tablaPosition=0;
public baseurl = URLS.DOCS + this.empresasService.seleccionada + '/proveedores_entradas_producto/';
public modal: Modal = new Modal();
public modal2: Modal;

public entidad:string="&entidad=proveedores_entradas_producto";
public field:string="&field=idproveedor&idItem=";//campo de relación con tabla padre
public es;
public productoBuscado:number=null;
public hoy = new Date().setHours(0,0,0,0);

public trazabilidad:boolean=false;
public modo:string='adelante';
public nodoOrdenProd: ProveedorLoteProducto=null;
public alturaTraza:string='0px';
public heightTraza:string='1200px';

//***   EXPORT DATA */
public exportar_informes: boolean =false;
public exportando:boolean=false;
public informeData:any;
//***   EXPORT DATA */

//***   CHECKLIST */
public hayTrigger:boolean;
public checklistcontroles:any[]=[];
public origenIncidencia:any;
public sOrigen:string='';
public incidencias:Incidencia[];
public resultadosChecklists:ResultadoChecklist[];
public usuarios:Usuario[];
public opciones:any[]=[{'value':'todosOk','label':'todosOk'},{'value':'true','label':'correcto'},{'value':'false','label':'incorrecto'},{'value':'na','label':'no aplica'},{'value':'valor','label':'Valor'}];
public CustomOpciones:String[]=['Selecciona'];
public checkDobleSl:RegExp= new RegExp("//","g");
public fotoCheck:string;
public fotoCheckControl:string;
public foto1:number=null;
public foto2:number=null;

resultadoschecklist: ResultadoChecklist[];
public tabla1: object[];
public idrs: string[];
public selectedItems: any[];
public selectedId: any;
resultado: Object = {};

  constructor(public servidor: Servidor,
    public empresasService: EmpresasService,
  public router: Router,  
  public translate: TranslateService,
  private route: ActivatedRoute,
  private messageService: MessageService) {}

  ngOnInit() {
     // this.setItems();
     this.hayTriggerServiciosEntrada();
     this.es=cal;
        this.cols = [
          { field: 'idproducto', header: 'proveedores.producto', type: 'custom', width:160,orden:true,'required':true },
          { field: 'albaran', header: 'proveedores.albaran', type: 'std', width:120,orden:false,'required':false },
          { field: 'numlote_proveedor', header: 'proveedores.numlotep', type: 'std', width:120,orden:false,'required':true },
          { field: 'fecha_entrada', header: 'proveedores.fecha_entrada', type: 'fecha', width:120,orden:true,'required':true },
          { field: 'fecha_caducidad', header: 'proveedores.fecha_caducidad', type: 'fecha', width:120,orden:true,'required':true },
          { field: 'cantidad_inicial', header: 'proveedores.cantidad', type: 'std', width:90,orden:false,'required':true },
          { field: 'tipo_medida', header: 'proveedores.tipo medida', type: 'dropdown', width:120,orden:false,'required':false },
          { field: 'cantidad_remanente', header: 'proveedores.remanente', type: 'std', width:90,orden:false,'required':false, 'disabled':true },
        ];
  }

  ngOnChanges(){
    console.log("onChange");
      //this.setItems();
      this.getProductos();
      // if(this.hayTrigger) this.getAllResultadosChecklist();
  }


  incidenciaSelection(){
    let x=0;
    this.route.paramMap.forEach((param)=>{
      x++;
        console.log(param["params"]["id"],param["params"]["modulo"]);
        if (param["params"]["modulo"] == "proveedores"){
          console.log(param["params"]["id"],param["params"]["modulo"]);
          if (param["params"]["id"]>0){
            console.log(param["params"]["id"],param["params"]["modulo"]);
            let idOrigen = param["params"]["id"];
            let index = this.items.findIndex((item)=>item.idproducto==idOrigen);
            this.productoBuscado = idOrigen;
            console.log('***===',index,this.items)
             if (index > -1){
              let prod=this.items[index].idproducto;
              this.selectedItems = this.items.filter((item)=>{item.idproducto==prod})
            //   this.selectedItem = this.items[index]
            //   this.tablaPosition = index;
            //   console.log('***_',index,this.selectedItem)
               }else{
                 this.setAlerta('entradaProducto.noencontrada')
               }
          }
        }
      });
  }



  getOptions(option){
    //console.log('*****',option);
    switch (option[0]){
    case 'idproducto':
    return this.productos;
    break;
    case 'tipo_medida':
    return this.medidas;
    break;
    }
    }

  photoURL(i,tipo) {
    let extension = this.items[i].doc.substr(this.items[i].doc.length-3);
    let url = this.baseurl+this.items[i].id +"_"+this.items[i].doc;
    if (extension == 'jpg' || extension == 'epg' || extension == 'gif' || extension == 'png'){
    this.verdoc=!this.verdoc;
    this.foto = url
    }else{
      window.open(url,'_blank');
    }
  }




  setItems(filterDates?:string){
    let parametros ="";
     if (filterDates){
       parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+this.field+this.proveedor.id+filterDates+"&order=fecha_entrada desc"; 
     }else{
       parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+this.field+this.proveedor.id+"&order=fecha_entrada desc"; 
     }
     // let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+this.field+this.proveedor.id; 
        this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
          response => {
            this.items = [];
            if (response.success && response.data) {
              for (let element of response.data) { 
                  this.items.push(new ProveedorLoteProducto(element.numlote_proveedor,new Date(element.fecha_entrada),new Date(element.fecha_caducidad),element.cantidad_inicial,element.tipo_medida,element.cantidad_remanente,element.doc,element.idproducto,element.idproveedor,element.idempresa,element.id,element.albaran,element.idResultadoChecklist,element.idResultadoChecklistLocal));
             }
             this.incidenciaSelection();
            }
        },
        error=>console.log(error),
        ()=>{}
        );
  }

getProductos(){
  console.log('get_prods');
         let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=proveedores_productos"+this.field+this.proveedor.id; 
        this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
          response => {
            this.productos = [];
            //this.productos.push({"id":null,"nombre":'producto'})
            if (response.success && response.data) {
              for (let element of response.data) { 
                  // this.productos.push({"id":element.id,"nombre":element.nombre});
                  this.productos.push({"value":element.id,"label":element.nombre});
             }
             //console.log("PRODS",this.productos);
            }
        },
        error=>console.log(error),
        ()=>{
          //this.setItems()
          this.setDates();
          }
        ); 
}


cambioInput(){
  this.nuevoItem.cantidad_remanente = this.nuevoItem.cantidad_inicial;
}
  newItem() {
    let param = this.entidad+this.field+this.proveedor.id;
    this.nuevoItem.idproveedor = this.proveedor.id;
    this.nuevoItem.idempresa = this.empresasService.seleccionada;
    this.nuevoItem.cantidad_remanente = this.nuevoItem.cantidad_inicial;
    this.nuevoItem.id = 0;
    //this.addnewItem = this.nuevoItem;
    console.log(this.nuevoItem);
    this.servidor.postObject(URLS.STD_ITEM, this.nuevoItem,param).subscribe(
      response => {
        if (response.success) {
          this.items.push(this.nuevoItem);
          this.items[this.items.length-1].id= response.id;
        }
    },
    error =>console.log(error),
    () =>this.setDates()   
    );

   this.nuevoItem =  new ProveedorLoteProducto('',new Date(),new Date(),null,'',null,'',null,0,0,0);
  }


  onEdit(event){
    console.log(event);
    this.itemEdited(event.data.id);
  }
    itemEdited(idItem: number, fecha?: any) {
    this.guardar[idItem] = true;
    //console.log (fecha.toString());
    if (!this.alertaGuardar['guardar']){
      this.alertaGuardar['guardar'] = true;
      this.setAlerta('alertas.guardar');
      }
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

 saveItem(item: ProveedorLoteProducto,i: number) {
    this.guardar[item.id] = false;
    item.fecha_entrada = moment(item.fecha_entrada).add(2,'h').utc().toDate();
    item.fecha_caducidad = moment(item.fecha_caducidad).add(2,'h').utc().toDate();
    let parametros = '?id=' + item.id+this.entidad;    
    this.servidor.putObject(URLS.STD_ITEM, parametros, item).subscribe(
      response => {
        if (response.success) {
          this.setAlerta('alertas.saveOk');
        }
    });
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


checkBorrar(idBorrar: number) {
    // Guardar el id del control a borrar
    this.idBorrar = idBorrar;
    // Crea el modal
    this.modal.titulo = 'proveedores.borrarEntradaProductoT';
    this.modal.subtitulo = 'proveedores.borrarEntradaProductoST';
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

  uploadImg(event, idItem,i,field) {
    console.log(event)
    var target = event.target || event.srcElement; //if target isn't there then take srcElement
    let files = target.files;
    //let files = event.srcElement.files;
    let idEmpresa = this.empresasService.seleccionada.toString();
    this.servidor.postDoc(URLS.UPLOAD_DOCS, files,'proveedores_entradas_producto',idItem, this.empresasService.seleccionada.toString(),field).subscribe(
      response => {
        console.log('doc subido correctamente',files[0].name);
        this.items[i].doc = files[0].name;
        this.url[i]= URLS.DOCS + this.empresasService.seleccionada + '/proveedores_entradas_producto/' +  idItem +'_'+files[0].name;
        // let activa = this.empresas.find(emp => emp.id == this.empresasService.seleccionada);
        // activa.logo = '1';
      }
    )
  }

setDates(){
 this.filtro_inicio = moment(new Date (this.fechas_inicio['fecha_inicio'])).format('YYYY-MM-DD').toString();
 this.filtro_fin = moment(new Date (this.fechas_inicio['fecha_fin'])).format('YYYY-MM-DD').toString();
  this.setItems("&filterdates=true&fecha_field=fecha_entrada&fecha_inicio="+ this.filtro_inicio +  "&fecha_fin="+this.filtro_fin);
}
// excel(){
//   console.log("send to excel");

//  let columnas=['Materia Prima','Lote Proveedor','fecha','fecha_caducidad','cantidad','tipo_medida','remanente'];
//  let data=[];
//  this.items.forEach((item)=>{
//    let indice = this.productos.findIndex((prod)=>prod['id'] == item.idproducto);
//    let producto;
//    (indice<0)?producto="":producto= this.productos[indice].nombre;
   
//    data.push({'Materia Prima':producto,'Lote Proveedor':item.numlote_proveedor,'fecha':moment(item.fecha_entrada).format('DD-MM-YYYY'),'fecha_caducidad':moment(item.fecha_caducidad).format('DD-MM-YYYY'),'cantidad':item.cantidad_inicial,'tipo_medida':item.tipo_medida,'remanente':item.cantidad_remanente})
//  });
// var csvData = this.ConvertToCSV(columnas, data);
//     var a = document.createElement("a");
//     a.setAttribute('style', 'display:none;');
//     document.body.appendChild(a);
//     var blob = new Blob([csvData], { type: 'text/csv' });
//     var url= window.URL.createObjectURL(blob);
//     //window.open(url,'_blank');
//     a.href = url;
    
//     a.download = 'Entrada_Productos'+this.proveedor.nombre+'.csv';
//     a.click();
// }

// ConvertToCSV_OLD(controles,objArray){
// var cabecera =  typeof controles != 'object' ? JSON.parse(controles) : controles;
// var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
//             var str = '';
//             var row = "";
//             //row += "Usuario;Fecha;"
//             for (var i = 0; i < cabecera.length; i++) {
//               row += cabecera[i] + ';';
//             }
//             row = row.slice(0, -1);
//             //append Label row with line break
//             str += row + '\r\n';
 
//             for (var i = 0; i < array.length; i++) {
                
//                 var line ="";//array[i].usuario+";"+array[i].fecha + ";";

//               for (var x = 0; x < cabecera.length; x++) {
//                 let columna = cabecera[x];
//                 let resultado = array[i][cabecera[x]];
//               line += ((array[i][cabecera[x]] !== undefined) ?array[i][cabecera[x]] + ';':';');
//             }
//             line = line.slice(0,-1);
//                 str += line + '\r\n';
//             }
//             return str;
// }




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
                      case 'custom':
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
                this.translate.get('proveedores.entradaproductos').subscribe((desc)=>{informe=desc});
                return {'cabecera':[informeCabecera],'rows':informeRows,'comentarios':[],'informes':informe};
    }

    getDropDownValor(tabla,valor){
      let Value;
      let index
      switch (tabla){
        case 'idproducto':
         index=this.productos.findIndex((prod)=>prod["value"]==valor);
        if (index>-1)
        Value = this.productos[index]["label"];
        return Value;
        break;
        case 'tipo_medida':
         index=this.medidas.findIndex((medida)=>medida["value"]==valor);
        if (index>-1)
        Value = this.medidas[index]["label"];
        return Value;       
        break;
      }
      console.log(tabla,valor,Value);
      return Value;
    }


//*****CHECKLIST ENTRADAS*/
hayTriggerServiciosEntrada(){
  //let where= encodeURI("entidadOrigen=\'proveedores_entradas_producto\' AND entidadDestino=\'checklist\'");
    let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=triggers";
      this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
        response => {
          console.log(response);
          if (response.success == 'true' && response.data) {
            console.log(response.data,response.data.length)

            for (let element of response.data) {
              if (element.entidadOrigen == 'proveedores_entradas_producto' && element.entidadDestino=='checklist'){
                this.hayTrigger=true;
                this.getUsers();
                localStorage.setItem('triggerEntradasMP',element.idDestino);
                this.getControlesChecklist(element.idDestino);
                if(!this.idrs)
                this.getAllResultadosChecklist();
              }
              }
          }
      },
  error =>{
      console.debug(error);
      console.log('hay Trigger servicios entrada' + error);
      },
      ()=>{});
}

getControlesChecklist(idChecklist){
  let param = "&entidad=controlchecklist"+"&field=idchecklist&idItem="+idChecklist+"&order=orden";
  this.servidor.getObjects(URLS.STD_SUBITEM,param).subscribe(
    (response)=>{
      this.checklistcontroles=[];
      // let x=0;
      if (response.success && response.data) { 
        for (let item of response.data) { 
          this.checklistcontroles.push({
            "id": item.id,
            "idchecklist": item.idchecklist,
            "nombrechecklist": "",
            "idcontrol":item.id,
            "nombrecontrol":item.nombre,
            "checked":"",
            "valor":"",
            "descripcion":"",
            "foto": ""
      });   
      // this.incidencia[x]={'origen':'Checklists','origenasociado':'Checklists','idOrigenasociado':item.idchecklist,'idOrigen':item.id,'hayIncidencia':false,'incidencia':'Incidencia en ' +item.nombre+ ' de ' + this.nombrechecklist}
      // x++;            
       }
}
    })
}




setFotoControl(fotocontrol){
  this.fotoCheckControl = URLS.FOTOS +'/controles/' + this.empresasService.seleccionada + '/checklistcontrol' + fotocontrol + '.jpg'
}
getResultadosChecklist(event){

let incidencia='Albaran:'+event.data.albaran + ' Lote:'+event.data.numlote_proveedor;
this.origenIncidencia = {'origen':'Checklists','idOrigen':null,'origenasociado':'Checklists','idOrigenasociado':localStorage.getItem('triggerEntradasMP'),'incidencia':incidencia,'descripcion':''};
  console.log('ROW EXPANDED',event);
  if(event.data.idResultadoChecklist){
  let idResultadoChecklist = event.data.idResultadoChecklist;
  let idResultadoChecklistLocal = event.data.idResultadoChecklistLocal;
    let descripcion='';
    this.fotoCheck = URLS.FOTOS + this.empresasService.seleccionada + '/checklist' + idResultadoChecklist + '.jpg'
  let parametros = '&idempresa=' + this.empresasService.seleccionada+'&entidad=resultadoschecklistcontrol&field=idresultadochecklist&idItem='+idResultadoChecklist; 

  this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
    response => {
      if (response.success && response.data) {
        console.log(response.data);
        this.getIncidencia(idResultadoChecklist);
        for (let element of response.data) {
        let index = this.checklistcontroles.findIndex((control)=>control.idcontrol==element.idcontrolchecklist);
        this.checklistcontroles[index]['checked']=element.resultado;
        this.checklistcontroles[index]['descripcion']=element.descripcion;
        this.checklistcontroles[index]['resultadoChecklistControl']=element.id;
        this.checklistcontroles[index]['foto']=element.fotocontrol;
       if (element.resultado != 'true' &&  element.resultado != 'false'  &&  element.resultado != 'na') this.checklistcontroles[index]['valor']=element.resultado;
       if(element.resultado=='false') descripcion=descripcion+' ' + 'checkList incorrecto';
}
this.origenIncidencia = {'origen':'Checklists','idOrigen':idResultadoChecklist,'origenasociado':'Checklists','idOrigenasociado':localStorage.getItem('triggerEntradasMP'),'incidencia':incidencia,'descripcion':descripcion};
this.sOrigen=JSON.stringify(this.origenIncidencia);
  }
},
error=>{console.log('Error getting checklist1',error)});
  }
  else{
    let filtrarFechas="&filterdates=true&fecha_inicio="+ moment().subtract(30,"days").format("YYYY-MM-DD")+"&fecha_fin="+ moment().add(1,"day").format("YYYY-MM-DD")+"&fecha_field=fecha"
    let parametros='';
    if(event.data.idResultadoChecklistLocal){
    let idResultadoChecklistLocal = event.data.idResultadoChecklistLocal;
    parametros = '&idempresa=' + this.empresasService.seleccionada+'&entidad=resultadoschecklist&field=idlocal&idItem='+idResultadoChecklistLocal+"&WHERE=idchecklist="+localStorage.getItem('triggerEntradasMP')+filtrarFechas; 
    }else{
      let strFilter = "NOT EXISTS (select `idResultadoChecklist` from proveedores_entradas_producto PEP where idempresa = " + this.empresasService.seleccionada + " AND RSCL.id = PEP.`idResultadoChecklist`)"
      parametros = '&idempresa=' + this.empresasService.seleccionada + '&entidad=resultadoschecklist&nickentidad=RSCL&field=idchecklist&idItem='+localStorage.getItem('triggerEntradasMP')+'&WHERE='+strFilter+filtrarFechas; 
    }
    this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
      response => {
        this.resultadosChecklists=[];
        if (response.success && response.data) {
          console.log(response.data);
          for (let element of response.data) {
            console.log('RESULTADOS CHECKLIST:',element);
            this.resultadosChecklists.push(new ResultadoChecklist(
              element.id,element.idcontrolchecklist,element.idchecklist,element.idusuario,element.resultado,element.descripcion,element.fecha,element.foto,element.fotocontrol,element.idrc
            ))
          }
        }
      });
  }


}



endResultadosChecklist(event){
console.log('ROW COLLAPSED',event);
this.checklistcontroles.forEach((control)=>{
  control.checked='';
  control.descripcion=''
})
}

// vinculaResultadoChecklist(idEntrada,idResultadoChecklist){
//   let updateEntrada={
//     'idResultadoChecklist':idResultadoChecklist
//     }
//       let parametros = '?id=' + idEntrada+this.entidad;    
//       this.servidor.putObject(URLS.STD_ITEM, parametros, updateEntrada).subscribe(
//         response => {
//           if (response.success) {
//             console.log('ENTRADA UPDATED .saveOk');
//             this.items[this.items.findIndex((entrada)=>entrada.id==idEntrada)].idResultadoChecklist=resultadoChecklist;
//             this.items=this.items.slice(0);
//           }
//       });
// }


getIncidencia(idResultadoChecklist){
  let parametros = '&idempresa=' + this.empresasService.seleccionada+'&entidad=incidencias&field=idOrigen&idItem='+idResultadoChecklist; 
  this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
    response => {
      if (response.success && response.data) {
        this.incidencias=[];
        console.log(response.data);
        for (let element of response.data) {
          this.incidencias.push(new Incidencia(element.id,element.idempresa,element.incidencia,element.responsable,new Date(element.fecha),element.responsable_cierre,new Date(element.fecha_cierre),element.solucion,element.nc,element.origen,element.idOrigen,element.origenasociado,element.idOrigenasociado,element.foto,element.descripcion,element.estado))
}
// this.incidenciaCL = {'origen':'Checklists','idOrigen':idResultadoChecklist,'origenasociado':'Checklists','idOrigenasociado':localStorage.getItem('triggerEntradasMP'),'incidencia':incidencia,'descripcion':descripcion};

  }else{
    this.incidencias=null;
  }
},
error=>{console.log('Error getting incidencias del Checklist',error)});
}
incidenciaCreada(incidencia){
  console.log(incidencia)
  this.incidencias=[incidencia];
  // this.incidencias.push(incidencia);
}
gotoIncidencia(item:Incidencia){

  console.log('goto Origen',item);
  let origenAsociado = 'incidencias'
  let id=item.id;
  let url = 'empresas/'+ this.empresasService.seleccionada + '/'+ origenAsociado +'/'+item.idOrigenasociado+'/'+id
  //let cleanUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);

  this.router.navigate([url]);
}
  nuevoCL(item) {
    console.log(item);
    let param = "&entidad=resultadoschecklist"
    let newChecklist={
      'id':null,
      'fecha':moment().format('YYYY-MM-DD HH:mm:ss'),
      'foto':'false',
      'idchecklist':localStorage.getItem('triggerEntradasMP'),
      'idusuario':this.empresasService.userId
    }
    console.log(newChecklist);
    this.servidor.postObject(URLS.STD_ITEM, newChecklist,param).subscribe(
      response => {
        if (response.success) {
          this.setAlerta('alertas.saveOk');
          this.newcontrolesChecklist(response.id,localStorage.getItem('triggerEntradasMP'));
          this.updateLote(item.id,response.id);
          if(this.origenIncidencia['descripcion']){
            this.origenIncidencia['idOrigen']=response.id;
            this.setIncidencia();
          }
        }
    },
    error =>console.log(error),
    () =>this.setDates()   
    );

  //  this.nuevoItem =  new ProveedorLoteProducto('',new Date(),new Date(),null,'',null,'',null,0,0,0);
  }
newcontrolesChecklist(idResultadoChecklist,idChecklist){
  let param="&entidad=resultadoschecklistcontrol";
  this.checklistcontroles.forEach((control)=>{
    if(control.checked=='valor') control.checked = control.valor;
  let resultadoControl={
    'id':null,
    'idcontrolchecklist':control.id,
    'idresultadochecklist':idResultadoChecklist,
    'resultado':control.checked,
    'descripcion':control.descripcion,
    'fotocontrol':'false'
  }
  this.servidor.postObject(URLS.STD_ITEM, resultadoControl,param).subscribe(
    response => {
      if (response.success) {
        control["resultadoChecklistControl"]=response.id;
        console.log('OK')
      }
  },
  error =>console.log(error)
  );
  });

}

emparejaLote(idItem: number,resultadoChecklist:number){
  this.updateLote(idItem,resultadoChecklist);
  let indice= this.items.findIndex((entrada)=>entrada.id==idItem);
  let event= {'data':{'idResultadoChecklist':resultadoChecklist}};
  if (indice>=0){
    event['data']["albaran"] = this.items[indice].albaran;
    event['data']["numlote_proveedor"] = this.items[indice].numlote_proveedor;
  }
  this.getResultadosChecklist(event);
}
updateLote(idItem: number,resultadoChecklist:number) {
let uLote={
'idResultadoChecklist':resultadoChecklist
}
  let parametros = '?id=' + idItem+this.entidad;    
  this.servidor.putObject(URLS.STD_ITEM, parametros, uLote).subscribe(
    response => {
      if (response.success) {
        console.log('Lote UPDATED .saveOk');
        this.items[this.items.findIndex((lote)=>lote.id==idItem)].idResultadoChecklist=resultadoChecklist;
        this.items=this.items.slice(0);
      }
  });
}

guardarCL(DT?:DataTable,item?){

  setTimeout(()=>{DT.toggleRow(item);},900);
  let entidad="&entidad=resultadoschecklistcontrol";
  this.checklistcontroles.forEach((control)=>{
    console.log(control.resultadoChecklistControl);
    if(control.checked=='valor') control.checked = control.valor;
    let resultadoControl={
      'resultado':control.checked,
      'descripcion':control.descripcion
    }
    let parametros = '?id=' + control.resultadoChecklistControl+entidad;    
    this.servidor.putObject(URLS.STD_ITEM, parametros, resultadoControl).subscribe(
      response => {
        if (response.success) {
          this.setAlerta('alertas.saveOk');
          if(this.origenIncidencia['descripcion']){
            this.setIncidencia();
          }
        }
    });
  })
}

setOpciones(nombrecontrol){
  console.log(nombrecontrol);
  if (nombrecontrol.indexOf('//')>0){
    this.CustomOpciones=nombrecontrol.split('//');
    console.log(this.CustomOpciones);
  }else{
    this.opciones= [{'value':'todosOk','label':'todosOk'},{'value':'true','label':'correcto'},{'value':'false','label':'incorrecto'},{'value':'na','label':'no aplica'},{'value':'valor','label':'Valor'}]
          }
}
changeSelected(event,item:ProveedorLoteProducto,control1){
console.log(event)
if(event.value=='todosOk'){
  this.checklistcontroles.forEach((control)=>{
    if(control.checked!='valor')
    control.checked='true';
  })
}else{
  if(control1.valor)control1.valor=event.value;
}

this.incidenciaChecklist(item);
}

changeValor(control){
  if (control.valor === null || control.valor === null || control.valor === undefined){
    console.log('VALOR VACÏO');

  }
}

incidenciaChecklist(item:ProveedorLoteProducto,esBoton?:string ){
  console.log('item',item);
  let descripcion='';
  this.checklistcontroles.forEach((control)=>{
    if(control.checked=='false')
    descripcion=descripcion+' ' + control.nombrecontrol+':incorrecto';
  })
    this.sOrigen='';
    this.origenIncidencia['descripcion']=descripcion;
    if (esBoton=='botonI') {
      this.origenIncidencia['open']=true
    }else{
        this.origenIncidencia['open']=null
      }
    this.sOrigen=JSON.stringify(this.origenIncidencia);
}


setIncidencia(){
  this.origenIncidencia['open']=true;
  this.sOrigen=JSON.stringify(this.origenIncidencia);
  // let param="&entidad=incidencias";
  // let fecha = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours(), new Date().getMinutes()))
  // let fecha_cierre = null;//new Date(Date.UTC(this.newIncidencia.fecha_cierre.getFullYear(), this.newIncidencia.fecha_cierre.getMonth(), this.newIncidencia.fecha_cierre.getDate(), this.newIncidencia.fecha_cierre.getHours(), this.newIncidencia.fecha_cierre.getMinutes()))

  // let incidencia:Incidencia=new Incidencia(null,this.empresasService.seleccionada,this.origenIncidencia['incidencia'],this.empresasService.userId,fecha,null,fecha_cierre,'',null,this.origenIncidencia['origen'],this.origenIncidencia['idOrigen'],this.origenIncidencia['origenasociado'],this.origenIncidencia['idOrigenasociado'],null,this.origenIncidencia['descripcion'],0);
  // this.servidor.postObject(URLS.STD_ITEM, incidencia,param).subscribe(
  //   response => {
  //     if (response.success) {
  //       console.log('OK INCIDENCIA');
  //     }
  // },
  // error =>console.log(error)
  // );
}



trazabilidadAdelante(item: ProveedorLoteProducto,i){
  console.log(item,i)
//  this.loadItems(item.id).then(
//    (resultados)=>{
//      console.log('RESULTADOS',resultados);
//      if(resultados){
        this.nodoOrdenProd=item;
        this.modo = 'adelante';
        this.trazabilidad= !this.trazabilidad;
//      }
//    }
//  )

// this.trazabilidadAd= !this.trazabilidadAd;
}

// loadItems(idMateriaPria) {
//   return new Promise((resolve)=>{
//    let parametros ="";

//     //  parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=produccion_orden&order=id DESC&WHERE=estado=&valor="+estat+"";
//     parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=produccion_detalle&field=idmateriaprima&idItem="+idMateriaPria+"&order=id DESC";

  
//     let ordenes:ProduccionOrden[]=[]
//       this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
//         response => {
//           // Vaciar la lista actual
//           if (response.success == 'true' && response.data) {
//             for (let element of response.data) {
//               ordenes.push(new ProduccionOrden(element.idorden,this.empresasService.seleccionada,'',new Date(),new Date(),new Date()));
//             }
//             resolve(ordenes);
//            console.log(ordenes);
//           }
//       },
//       (error) =>{
//         console.log(error);
//         resolve(false);
//       },
//       ()=>{
//       }
//       );
//     });
//  }


getUsers(){
let parametros = '&idempresa=' + this.empresasService.seleccionada;
// llamada al servidor para conseguir los usuarios
console.log('GETTING USERS')
this.servidor.getObjects(URLS.USUARIOS, parametros).subscribe(
  response => {
    this.usuarios = [];
    if (response.success && response.data) {
      for (let element of response.data) {
        this.usuarios.push(new Usuario(element.id, element.usuario, '*',element.tipouser, '*', element.idempresa));
      }
    }
});
}
getUser(idUser){
  console.log('GETTING USER',idUser,this.usuarios)
  let user ='Desconocido';
  this.translate.get('Desconocido').subscribe((valor)=>{
    user = valor;
  })
  let resultado = '('+idUser + '-'+user+')';
  let indiceUser = this.usuarios.findIndex((user)=>user.id==idUser)
  if (indiceUser>=0){
    resultado = this.usuarios[indiceUser].usuario;
  }
  return resultado;

}

doSomethingOnWindowScroll(evento:any){
  console.log("window scroll2 ",evento);
   let scrollOffset = evento.srcElement.children[0].scrollTop;
           console.log("window scroll1: ", scrollOffset);
           this.alturaTraza = '-'+scrollOffset+'px';
  }





  //**************** */
  getAllResultadosChecklist(){
    console.log('getAllResultadosChecklist')
    this.idrs = [];
    // Conseguir resultadoschecklist
    let parametros = '&idchecklist=' + localStorage.getItem('triggerEntradasMP') + 
    //'&fechainicio=' + fecha.inicio.formatted + '&fechafin=' + fecha.fin.formatted;
          '&fechainicio=' + moment(this.fechas_inicio['fecha_inicio']).format('YYYY-MM-DD') + '&fechafin=' + moment(this.fechas_inicio['fecha_fin']).format('YYYY-MM-DD');

    this.servidor.getObjects(URLS.RESULTADOS_CHECKLIST, parametros).subscribe(
      response => {
        this.resultadoschecklist = [];
        this.tabla1 = [];
        if (response.success && response.data) {
          for (let element of response.data) {
            let fecha = new Date(element.fecha);
              this.resultadoschecklist.push(new ResultadoChecklist(element.idr, element.idcontrolchecklist,
                element.idchecklist,element.usuario, element.resultado, element.descripcion, moment(element.fecha).toDate(), element.foto, element.fotocontrol,element.idrc));
            if (this.idrs.indexOf(element.idr) == -1) this.idrs.push(element.idr);
          }
        }
        for (let idr of this.idrs) {
          let contador = 0;
          for (let resultado of this.resultadoschecklist) {
            if (idr == resultado.idr) {
              if(this.selectedItems){
              if (this.selectedItems[0] && this.selectedItems[0]== resultado.idrc) this.selectedId = resultado.idr
              }
              this.resultado['id'] = resultado.idr;
              this.resultado['idrc' + resultado.idcontrolchecklist] = resultado.idrc;
              this.resultado['usuario'] = resultado.usuario;
              //this.resultado['fecha'] =  this.formatFecha(resultado.fecha);
              this.resultado['fecha'] = moment(resultado.fecha).format('DD/MM/YYYY HH:mm');
              
              if (resultado.foto == 'true') this.resultado['foto'] = true;
//              if (resultado.resultado == 'true') {
//                this.resultado['id' + resultado.idcontrolchecklist] = true;
                  this.resultado['id' + resultado.idcontrolchecklist] = resultado.resultado;
//              }
              if (resultado.descripcion) {
                this.resultado['id2' + resultado.idcontrolchecklist] = resultado.descripcion;
              }
               if (resultado.fotocontrol != "false") {
                this.resultado['fotocontrol' + resultado.idcontrolchecklist] =  resultado.idcontrolchecklist + "_" + resultado.idr;
              }                
              contador++;
            }
          }
          this.tabla1.push(this.resultado);
          this.resultado = {};
          console.log("tabla",this.tabla1,this.selectedId,this.selectedItems);
        }
    },
    error=>{console.log('getAllResultadosChecklist ERROR',error)});
  }

  getRR(item,origen?){
   // console.log('getRR',origen);
    let resultado='true';
    if (item.idResultadoChecklist>0){
      let indiceIdr = this.idrs.findIndex((idr)=>idr==item.idResultadoChecklist)
      if (indiceIdr>=0 && this.tabla1[indiceIdr]){
        for (let key of Object.keys(this.tabla1[indiceIdr])){
          if (this.tabla1[indiceIdr][key]=="false" || 
              this.tabla1[indiceIdr][key]=="Retenido" || 
              this.tabla1[indiceIdr][key]=="Devuelto"){
            resultado='false';
          }
        } 
      }
    }
    return resultado;
  }


  changeTrazaHeight(event){
    console.log("height ",event);
    let calculoheight = 300 +parseInt(event);

    this.heightTraza=calculoheight+'px';
    console.log("height ",this.heightTraza);
    this.onHeightChanged.emit(this.heightTraza);
  }


  tooltipFecha(){
    //this.setAlerta('TOOLTIP');
    console.log('TOOLTIP ENTRADA MANUAL');
  }
}
