import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import * as moment from 'moment/moment';


import { Servidor } from '../../../services/servidor.service';
import { URLS,dropDownMedidas } from '../../../models/urls';
import { EmpresasService } from '../../../services/empresas.service';
import { ProductoPropio } from '../../../models/productopropio';
import { ProveedorProducto } from '../../../models/proveedorproductos';
import { Proveedor } from '../../../models/proveedor';
import { Ingrediente } from '../../../models/recetas';

import { Modal } from '../../../models/modal';
import { ProveedoresComponent } from 'app/components/proveedores/proveedores.component';


@Component({
  selector: 'app-recetas',
  templateUrl: './recetas.component.html',
  styleUrls: ['./recetas.component.css']
})
export class RecetasComponent  implements OnInit, OnChanges {
  @Input() producto: ProductoPropio;
  public nuevoItem: Ingrediente = new Ingrediente(null,this.empresasService.seleccionada,0,'',null,null);
  public addnewItem: Ingrediente = new Ingrediente(null,this.empresasService.seleccionada,0,'',null,null);
  public items: Ingrediente[];
  public proveedores: any[];
  public ingredientes: any[];
  public medidas: object[]=dropDownMedidas;
  public guardar = [];
  public idBorrar;
  public url=[];
  public verdoc: boolean = false;
  public foto:string;
  
//  public baseurl = URLS.DOCS + this.empresasService.seleccionada + '/productos/';
  public modal: Modal = new Modal();
  public modal2: Modal;
  
  public entidad:string="&entidad=Recetas";
  
  public cols:any[];
  public newRow:boolean=false;
  //***   EXPORT DATA */
  public exportar_informes: boolean =false;
  public exportando:boolean=false;
  public informeData:any;
  //***   EXPORT DATA */
  
    constructor(
      public servidor: Servidor,
      public empresasService: EmpresasService,
      public translate: TranslateService
      ) {}
  
    ngOnInit() {
      console.log('INIT',this.producto);
      this.setIngredientes();
        this.setItems();
        this.cols = [
          { field: 'ingrediente', header: 'recetas.ingrediente', type: 'dropdown', width:109,orden:false,'required':true },
          { field: 'cantidad', header: 'recetas.Cantidad', type: 'std', width:109,orden:false,'required':true },
          { field: 'tipo_medida', header: 'recetas.tipo_medida', type: 'dropdown', width:109,orden:false,'required':true }
        ];
  
    }
    ngOnChanges(){
      // console.log("onChange",this.producto);
      //   this.setItems();
    }
  
    getOptions(option){
      //console.log('*****',option);
      switch (option[0]){
      case 'idProveedor':
      return this.proveedores;
      break;
      case 'tipo_medida':
      return this.medidas;
      break;
      case 'ingrediente':
      return this.ingredientes;
      break;    
      }
      }
  
    setItems(){
       console.log('setting items...')
        let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+"&WHERE=idProducto="+this.producto.id;  
          this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
            response => {
              this.items = [];
              if (response.success && response.data) {
                for (let element of response.data) { 
                    this.items.push(new Ingrediente(element.id,element.idEmpresa,element.cantidad,element.tipo_medida,element.ingrediente,element.idproducto));
               }
              }
          },
          error=>console.log(error),
          ()=>{
            if(this.addnewItem.id != 0) this.addnewItem.id =0;
            }
          );
    }

  setIngredientes(){
    console.log('setting items...')
     let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=Recetas&fields=ingrediente&WHERE=ingrediente is not null GROUP BY ingrediente"; 
       this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
         response => {
           this.ingredientes=[];
           if (response.success && response.data) {
             for (let element of response.data) { 
                 this.ingredientes.push({'label':element.ingrediente,'value':element.ingrediente});
            }
           }
       },
       error=>console.log(error),
       ()=>{
         if(this.addnewItem.id != 0) this.addnewItem.id =0;
         }
       );
 }
  
    newItem() {
      let param = this.entidad;
      this.nuevoItem.idempresa = this.empresasService.seleccionada;
      this.nuevoItem.idproducto = this.producto.id;
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
     this.nuevoItem = new Ingrediente(null,this.empresasService.seleccionada,0,'',null,null);
    }
  
  
    onEdit(event){
      console.log(event);
      this.itemEdited(event.data.id);
    }
  
      itemEdited(idItem: number, fecha?: any) {
      this.guardar[idItem] = true;
      //console.log (fecha.toString());
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
  
   saveItem(item: Ingrediente,i: number) {
      this.guardar[item.id] = false;
      let parametros = '?id=' + item.id+this.entidad;    
      item.idempresa = this.empresasService.seleccionada;  
      //item.alergenos = this.items[i].alergenos;
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
      this.modal.titulo = 'recetas.borrarProductoT';
      this.modal.subtitulo = 'recetas.borrarProductoST';
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
  
    setMateriasPrimas(ingrediente){
      console.log('ingrediente',ingrediente)
    }
  
  setAlergenos(alergens: string, idItem?: number, i?: number){
    console.log(alergens,idItem,i);
    if (!idItem){
    //this.nuevoItem.alergenos = alergens;
    }else{
      this.itemEdited(idItem);
      // this.items[i].alergenos = alergens;
      console.log(this.items[i]);
    }
  }
  
  
  
  
  
  
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
                      this.translate.get('proveedores.productos').subscribe((desc)=>{informe=desc});
                      return {'cabecera':[informeCabecera],'rows':informeRows,'comentarios':[],'informes':informe};
          }
      
          getDropDownValor(tabla,valor){
            let Value;
            switch (tabla){
              case "idfamilia":
              break;
            }
            console.log(tabla,valor,Value);
            return Value;
          }


}
