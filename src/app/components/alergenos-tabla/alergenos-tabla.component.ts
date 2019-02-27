import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from '@ngx-translate/core';

import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { LimpiezaElemento } from '../../models/limpiezaelemento';
import { LimpiezaZona } from '../../models/limpiezazona';
import { Modal } from '../../models/modal';
//import { ProductoPropio } from '../../models/productopropio';

export class ProductoAlergia {
  constructor(
    public id: number,
    public nombre: string,
    public alergenos: string,
  ) {}
}
@Component({
  selector: 'app-alergenos-tabla',
  templateUrl: './alergenos-tabla.component.html',
  styleUrls: ['./alergenos-tabla.component.css']
})
export class AlergenosTablaComponent implements OnInit, OnChanges {
  @Input() parentAlergenos:string;
  @Output() selectedAlergenosChange:EventEmitter<string>=new EventEmitter<string>();
  public productos: ProductoAlergia[];
  public viewAlergenos: boolean;
  //public alergenos:string[]=['Ing Cereales con gluten','Trz Cereales con gluten','Ing Huevos','Trz Huevos','Ing Leche','Trz Leche','Ing Cacahuetes','Trz Cacahuetes','Ing Soja','Trz Soja','Ing Fruits secs de closca','Trz Fruits secs de closca','Ing Apio','Trz Apio','Ing Mostaza','Trz Mostaza','Ing Sésamo','Trz Sésamo','Ing Pescado','Trz Pescado','Ing Crustaceos','Trz Crustaceos','Ing Moluscos','Trz Moluscos','Ing Altramuces','Trz Altramuces','Ing Dioxido de azufre y sulfitos','Trz Dioxido de azufre y sulfitos'];
  public alergenos:string[]=['Gluten','Huevos','Leche','Cacahuetes','Soja','Fruits secs','Apio','Mostaza','Sésamo','Pescado','Crustaceos','Moluscos','Altramuces','Sulfitos'];
  //public alergenos:string[]=['frutos secos','lacteos','gluten','huevos','otros'];
  public titulo:string='';
  public selectedAlergenos:string[]=[];
  public tabla: object[];
  public cols: object[];
  public procesando: boolean = false;
  
  public columnas: object[] = [];
  public exportar_informes: boolean =false;
  public exportando:boolean=false;
  public informeData:any;
  
  
  entidad:string="&entidad=productos";
  public field:string="&field=idproveedor&idItem=";

    constructor(
      public servidor: Servidor,
      public empresasService: EmpresasService,
      public translate: TranslateService,
      private messageService: MessageService) {}
  
    ngOnInit() {
      if (this.translate.currentLang=='cat'){
        this.alergenos=['Gluten','Ous','Llet','Cacauets','Soja','Fruits secs','Api','Mostassa','Sèsam','Peix','Crustacis','Mol·luscs','Tramussos','Sulfits'];
      }
        this.getProductos();
  
  }
  ngOnChanges() {
    this.getProductos();
}

  getProductos(){
      console.log('setting items...')
      let url='';
      let parametros='';
      if(this.parentAlergenos  == 'productos'){
        this.entidad = "&entidad=productos";
        this.titulo="produccion.alergenos";
        url= URLS.STD_ITEM;
        parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=productos"; 
      }else{
        this.entidad = "&entidad=proveedores_productos";
        this.titulo="proveedores.alergenos";
        url= URLS.STD_SUBITEM;
        parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=proveedores_productos&field=idproveedor&idItem="+this.parentAlergenos; 
      }
         this.servidor.getObjects(url, parametros).subscribe(
           response => {
             this.proccessProductos(response.data)
         },
         error=>console.log(error),
         ()=>{});

   }
  proccessProductos(data){
    this.productos = [];
    if (data) {
      for (let element of data) { 
         //  this.productos.push(new ProductoPropio(element.nombre,element.descripcion,element.alergenos,element.doc,element.id,element.idempresa));
         this.productos.push(new ProductoAlergia(element.id,element.nombre,element.alergenos));
     }
     this.mergeData();
    }
  }
   mergeData() {
      this.tabla = [];
      this.cols = [];
      //this.cols.push({ field: 'Producto', header: 'Productos' });
      this.alergenos.forEach(alergeno => {
        this.cols.push({ field: alergeno, header: alergeno, Ing:false, Trz:false })
      });
  let x=0;
  
  console.log(this.productos);
      this.productos.forEach(producto => {
        let generalSwitch = true;
        let row = '{"Producto":"' + producto.nombre + '","idproducto":"' + producto.id + '"}';
        this.tabla.push(JSON.parse(row));
        //let row = '{';
          this.tabla[x]['cols']=[];
          // this.alergenos.forEach(alergeno => {this.tabla[x]['cols'].push({ Ing:false, Trz:false })});
          this.alergenos.forEach(alergeno => {this.tabla[x]['cols'].push({Ing:null})});

        let alergenosProducto = [];
  
        if (producto.alergenos)
          alergenosProducto = JSON.parse(producto.alergenos);
            alergenosProducto.forEach(alergeno => {   
              let ingrediente = alergeno.substr(4,alergeno.length-4);
              let tipo = alergeno.substr(0,3);
          //let valor = this.permisos.findIndex((permiso) => permiso.idusuario == user.id && permiso.idItem == control.id);
          let indice = this.alergenos.findIndex((alergia)=>alergia ==ingrediente);
          if (indice >= 0){
          if (tipo == 'Trz'){
              this.tabla[x]['cols'][indice]['Ing'] ='Trz';
          }else{
              this.tabla[x]['cols'][indice]['Ing'] ='Ing';
          }
        }else{
          //this.tabla[x]['cols'][indice]['Ing'] =null;
          alergenosProducto.splice(alergenosProducto.findIndex((alergiaBorrar)=>alergiaBorrar==alergeno),1);
        }
          console.log("Alergeno:",alergeno,"indice:",indice);
        });
        x++;
      })
      // console.log("TABLA:",this.tabla);
      // console.log("PRODS:",this.productos)
      this.procesando = false;
    }
  
    setPermiso(idproducto,tipo,ingrediente,estado,i){
        console.log(idproducto,tipo,ingrediente,estado);
        let indiceProducto = this.productos.findIndex((prod)=>prod.id==idproducto);
          if (!this.productos[indiceProducto].alergenos) this.productos[indiceProducto].alergenos = '[]';
        let alergenosProd = JSON.parse(this.productos[indiceProducto].alergenos);
      let alergiaModificar = tipo + ' ' + ingrediente;
      let indice = alergenosProd.findIndex((alergia)=>alergia==alergiaModificar);
        console.log(this.productos[indiceProducto].alergenos);
        if ( estado == true){
          if (indice<0){
              alergenosProd.push(alergiaModificar);
              this.tabla[indiceProducto]['cols'][i]['Ing']=tipo;
          }else{console.log('yatá ese ingrediente')}
        }else{
          if (indice>=0){
              alergenosProd.splice(indice,1);
              this.tabla[indiceProducto]['cols'][i]['Ing']=null;
          }else{console.log('no estaba ese ingrediente')}
        }
        this.productos[indiceProducto].alergenos = JSON.stringify(alergenosProd);
        console.log(this.productos[indiceProducto].alergenos);
        if (tipo != 'Ing' || estado != false)
        this.saveItem(this.productos[indiceProducto]);
    }
  
    cambiaEstado(idproducto,tipo,ingrediente,i){
      console.log(idproducto,tipo,ingrediente);
      switch(tipo){
        case null:
        this.setPermiso(idproducto,'Ing',ingrediente,true,i);
        break;
        case 'Trz':
        this.setPermiso(idproducto,tipo,ingrediente,false,i);
        break;
        case 'Ing':
        this.setPermiso(idproducto,tipo,ingrediente,false,i);
        this.setPermiso(idproducto,'Trz',ingrediente,true,i);
        break;
      }

    }
  // cambiaEstadoAlergeno(alergeno: string){
  //     let index = this.selectedAlergenos.indexOf(alergeno);
  //     if (index < 0){
  //        this.addAlergeno(alergeno);
  //     }else{
  //         this.quitaAlergeno(index);
  //     }
  // }
  
  // addAlergeno(alergeno: string){
  // this.selectedAlergenos.push(alergeno);
  // }
  // quitaAlergeno(i){
  //     this.selectedAlergenos.splice(i,1);
  // }
  
  // setAlergenos(tipo:string){
  //     this.viewAlergenos = !this.viewAlergenos;
  //     if (!this.viewAlergenos) {
  //         console.log('...');
  //     this.selectedAlergenosChange.emit(JSON.stringify(this.selectedAlergenos));
  //     }
  // }
  
  
  
  
  
  saveItem(item: ProductoAlergia) {
      let parametros = '?id=' + item.id+this.entidad;    
      //item.idempresa = this.empresasService.seleccionada;  
      this.servidor.putObject(URLS.STD_ITEM, parametros, item).subscribe(
        response => {
          if (response.success) {
              this.setAlerta('alertas.saveOk');
          }else{
              this.setAlerta('alertas.saveNotOk');
          }
      },
      (error)=>{this.setAlerta('alertas.saveNotOk')});
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
  
  
  
  
    async downloads(){
      let informeData = await this.ConvertToCSV(this.columnas, this.tabla);
       let url ='https://script.google.com/a/proacciona.es/macros/s/AKfycbzIpotMyRcSxISIMvMLWN0-boPG8drRZ9wD8IQO5eQ/dev?idEmpresa='+this.empresasService.seleccionada+"&informes=controles";
      let params = {'tabla':this.tabla};
    }
    async excel2(){
      this.exportando=true;
      this.informeData = await this.ConvertToCSV(this.alergenos, this.tabla);
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
      let comentarios = ["",""];
      let lineLeyenda='';
                  var str = '';
                  var row = "";
                  row += "Producto;" 
                  for (var i = 0; i < cabecera.length; i++) {
                    lineLeyenda+=';';
                    row += cabecera[i] + ';';
                  }
                  row = row.slice(0, -1);
                  //append Label row with line break
                  //str += row + '\r\n';
                  informeCabecera = row.split(";");
                  str='';
                  for (var i = 0; i < array.length; i++) {
                              
                      var line =array[i].Producto+";";
      
                    for (var x = 0; x < cabecera.length; x++) {
                    //line += ((array[i][cabecera[x]] !== undefined) ?array[i][cabecera[x]] + ';':';');
                    let valor='';
                    switch (array[i]["cols"][x]["Ing"]){
                      case 'Ing':
                      valor = 'Si';
                      break;
                      case 'Trz':
                      valor = 'Trz';
                      break;
                      default:
                      valor = '';
                      break;
                    }
                    line += valor + ';';
                  }
                  line = line.slice(0,-1);
                      //str += line + '\r\n';
                      informeRows.push(line.split(";"));
      
                  }
                  let informe='';

                    this.translate.get(this.titulo).subscribe((inf)=>{informe=inf});
 
                  
                 this.translate.get('produccion.contieneIngrediente').subscribe((desc)=>{comentarios[0]='Si:'+desc+lineLeyenda});
                 this.translate.get('produccion.contieneTrazas').subscribe((desc)=>{comentarios[1]='Trz:'+desc+lineLeyenda});
                 console.log(comentarios);
                 informeRows.push(comentarios[0].split(";"),comentarios[1].split(";"));
                  //return str;
                  
                  return {'cabecera':[informeCabecera],'rows':informeRows,'comentarios':[],'informes':informe};
      }
  
  

}
