import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from '@ngx-translate/core';

import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { LimpiezaElemento } from '../../models/limpiezaelemento';
import { LimpiezaZona } from '../../models/limpiezazona';
import { Modal } from '../../models/modal';
import { ProductoPropio } from '../../models/productopropio';

@Component({
  selector: 'select-alergenos',
  templateUrl: './alergenos.component.html',
  styleUrls:['alergenos.css']
})

export class AlergenosComponent implements OnInit{
@Input() parentAlergenos:string;
@Output() selectedAlergenosChange:EventEmitter<string>=new EventEmitter<string>();
public productos: ProductoPropio[];
public viewAlergenos: boolean;
//public alergenos:string[]=['Ing Cereales con gluten','Trz Cereales con gluten','Ing Huevos','Trz Huevos','Ing Leche','Trz Leche','Ing Cacahuetes','Trz Cacahuetes','Ing Soja','Trz Soja','Ing Fruits secs de closca','Trz Fruits secs de closca','Ing Apio','Trz Apio','Ing Mostaza','Trz Mostaza','Ing Sésamo','Trz Sésamo','Ing Pescado','Trz Pescado','Ing Crustaceos','Trz Crustaceos','Ing Moluscos','Trz Moluscos','Ing Altramuces','Trz Altramuces','Ing Dioxido de azufre y sulfitos','Trz Dioxido de azufre y sulfitos'];
public alergenos:string[]=['Cereales con gluten','Huevos','Leche','Cacahuetes','Soja','Fruits secs de closca','Apio','Mostaza','Sésamo','Pescado','Crustaceos','Moluscos','Altramuces','Dioxido de azufre y sulfitos'];
//public alergenos:string[]=['frutos secos','lacteos','gluten','huevos','otros'];
public selectedAlergenos:string[]=[];
public tabla: object[];
public cols: object[];
public procesando: boolean = false;

public columnas: object[] = [];
public exportar_informes: boolean =false;
public exportando:boolean=false;
public informeData:any;


entidad:string="&entidad=productos";

  constructor(
    public servidor: Servidor,
    public empresasService: EmpresasService,
    public translate: TranslateService,
    private messageService: MessageService) {}

  ngOnInit() {
      if(this.parentAlergenos) {
          try{
          this.selectedAlergenos = JSON.parse(this.parentAlergenos);
          }
          catch (e){
              console.log (e);
          }
          console.log(this.selectedAlergenos);
      }
      this.getProductos();

}

getProductos(){
    console.log('setting items...')
     let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad; 
       this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
         response => {
           this.productos = [];
           if (response.success && response.data) {
             for (let element of response.data) { 
                 this.productos.push(new ProductoPropio(element.nombre,element.descripcion,element.alergenos,element.doc,element.id,element.idempresa));
            }
            this.mergeData();
           }
       },
       error=>console.log(error),
       ()=>{
         }
       );
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
        this.alergenos.forEach(alergeno => {this.tabla[x]['cols'].push({ Ing:false, Trz:false })});
      let alergenosProducto = [];

      if (producto.alergenos)
        alergenosProducto = JSON.parse(producto.alergenos);
          alergenosProducto.forEach(alergeno => {   
            let ingrediente = alergeno.substr(4,alergeno.length-4);
            let tipo = alergeno.substr(0,3);
        //let valor = this.permisos.findIndex((permiso) => permiso.idusuario == user.id && permiso.idItem == control.id);
        let indice = this.alergenos.findIndex((alergia)=>alergia ==ingrediente);
        
        if (tipo == 'Trz'){
            this.tabla[x]['cols'][indice]['Trz'] =true;
        }else{
            this.tabla[x]['cols'][indice]['Ing'] =true;
        }
        console.log("Alergeno:",alergeno,"indice:",indice);
      });
 
      x++;
    })
    console.log("TABLA:",this.tabla)
    this.procesando = false;
  }

  setPermiso(idproducto,tipo,ingrediente,estado){
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
        }else{console.log('yatá ese ingrediente')}
      }else{
        if (indice>=0){
            alergenosProd.splice(indice,1);
        }else{console.log('no estaba ese ingrediente')}
      }
      this.productos[indiceProducto].alergenos = JSON.stringify(alergenosProd);
      console.log(this.productos[indiceProducto].alergenos);
      this.saveItem(this.productos[indiceProducto]);
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





saveItem(item: ProductoPropio) {
    let parametros = '?id=' + item.id+this.entidad;    
    item.idempresa = this.empresasService.seleccionada;  
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




ConvertToCSV(controles,objArray){
var cabecera =  typeof controles != 'object' ? JSON.parse(controles) : controles;
var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
console.log(cabecera,array)
let informeCabecera=[];
let informeRows=[];
let comentarios = [];
            var str = '';
            var row = "";
            row += "Usuario;Foto;Fecha;"
            for (var i = 0; i < cabecera.length; i++) {
              row += cabecera[i]["header"] + ';';
            }
            row = row.slice(0, -1);
            //append Label row with line break
            //str += row + '\r\n';
            informeCabecera = row.split(";");
            str='';
            for (var i = 0; i < array.length; i++) {
              let fotoUrl = ''
              let comentario='';
              if (array[i].foto){
                //+ '/control' + idResultado + '.jpg';
                //fotoUrl = '=hyperlink("'+URLS.FOTOS + this.empresasService.seleccionada + '/control'+ array[i].id + '.jpg";"foto")';
                fotoUrl =URLS.FOTOS + this.empresasService.seleccionada + '/control'+ array[i].id + '.jpg'
             }                            
                var line =array[i].usuario+";"+ fotoUrl+";"+array[i].fecha +";";
                //var line =array[i].usuario+";"+array[i].fecha +";";
                //var line =array[i].usuario+";"+array[i].fecha + ";";

              for (var x = 0; x < cabecera.length; x++) {
                let columna = cabecera[x]["header"];
                //let resultado = array[i][cabecera[x]];
                let resultado = array[i]["nombre"];
                if (array[i][columna + 'mensaje']) {
                  this.translate.get(array[i][columna + 'mensaje']).subscribe((mensaje)=>{comentario +=  columna +": "+mensaje})
                } 
              //line += ((array[i][cabecera[x]] !== undefined) ?array[i][cabecera[x]] + ';':';');
              line += ((columna == resultado && array[i]["valor"] !== undefined) ?array[i]["valor"] + ';':';');
            }
            line = line.slice(0,-1);
                //str += line + '\r\n';
                informeRows.push(line.split(";"));
                comentarios.push(comentario);

            }
            //return str;
            return {'cabecera':[informeCabecera],'rows':informeRows,'comentarios':comentarios,'informes':'Alergias Productos'};
}




}
