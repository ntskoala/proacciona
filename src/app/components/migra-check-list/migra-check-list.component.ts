import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { EmpresasService } from '../../services/empresas.service';
import { Servidor } from '../../services/servidor.service';
import { Empresa } from '../../models/empresa';
import { URLS } from '../../models/urls';
import { Checklist } from '../../models/checklist';
import { ControlChecklist } from '../../models/controlchecklist';
import { LimpiezaElemento } from '../../models/limpiezaelemento';
import { LimpiezaZona } from '../../models/limpiezazona';
import { myprods } from '../../models/limpiezamyprods';
import { Modal } from '../../models/modal';
import * as moment from 'moment';

@Component({
  selector: 'app-migra-check-list',
  templateUrl: './migra-check-list.component.html',
  styleUrls: ['./migra-check-list.component.css']
})
export class MigraCheckListComponent implements OnInit {
  @Output() finMigracion: EventEmitter<string> = new EventEmitter<string>();
public empresa: number;
  public checklistActiva: number = 0;
  public checklists: Checklist[] = [];
  //public controlchecklists: ControlChecklist[] = [];
  public limpiezas: any[]=[];
  public migrarList: object[]=[]
  public zonas: LimpiezaZona[];
  //public elementosLimpieza: LimpiezaElemento[];
 // public nuevoItem: LimpiezaElemento = new LimpiezaElemento(0,0,'','');
  public es;

  constructor(private empresasService: EmpresasService, private servidor: Servidor) { }

  ngOnInit() {
                     this.es = {
            monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
                'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            dayNames: ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'],
            dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
            dayNamesMin: ["Do","Lu","Ma","Mi","Ju","Vi","Sa"],
            firstDayOfWeek: 1
        }; 
    this.getChecklists();
  }



cambiaEstadoZona(pos:number){
 
console.log(this.migrarList[pos]['migrar'])
if (this.migrarList[pos]['migrar']){
this.cambiaEstadoLimpiezas(pos,false)
}else{
this.cambiaEstadoLimpiezas(pos,true)
}

}

cambiaEstadoLimpiezas( pos:number, estado: Boolean){
for (let x= 0; x < this.limpiezas[pos]['migracion'].length;x++) {
  if (this.limpiezas[pos]['migracion'][x]['origen'] == 'app'){
  this.limpiezas[pos]['migracion'][x]['migrar']= estado;
  }
}
}

getChecklists(){
    this.empresa = this.empresasService.empresaActiva;
    let cont=0;
    let parametros = '&idempresa=' + this.empresa.toString();
        //let parametros = '&idempresa=' + seleccionada.id;
        // Llamada al servidor para conseguir las checklists
        this.servidor.getObjects(URLS.CHECKLISTS, parametros).subscribe(
          response => {
            // Ocultar mostrar control checklists
            this.checklistActiva = 0;
            // Vaciar la lista actual
            //this.checklists = [];
            this.zonas =[];
            if (response.success == 'true' && response.data) {
              for (let element of response.data) {
                //console.log(cont);
                let pos = cont;
                let migrar = (element.migrado == 1)?false:true;
                this.migrarList.push({migrar:migrar,migrado:false,fecha:'',periodicidad:'',tipo:'interno',productos:'',responsable:this.empresasService.userName});
                this.limpiezas.push();
                this.zonas.push(new LimpiezaZona(null,element.idempresa,element.nombrechecklist,'importado de checklist' + element.id))
                this.checklists.push(new Checklist(element.id, element.idempresa, element.nombrechecklist,
                  element.periodicidad, element.tipoperiodo, element.migrado));
                  this.calcFecha(element.id).then((fecha:Date)=>{
                this.getControlesCheckList(pos,element.id,this.calcPeriodicidad(element.tipoperiodo,element.periodicidad),fecha); 
                  });
                  cont ++;
          }
            }
          },
    error => console.log("error getting usuarios en permisos",error),
    ()=>{

      // console.log('################',this.limpiezas[0],this.limpiezas['1'],this.migrarList[0]['migrar'],this.limpiezas)
      //  console.log('*************',this.limpiezas[0]['Alimpiezas'])
    }
    );
}

  getControlesCheckList(pos: number,idChecklist: number,periodicidad: string,fecha: Date) {
   // console.log(idChecklist,pos);
    if (!fecha) fecha = new Date();

      fecha = this.nuevaFecha(periodicidad,fecha);
    let misElementosLimpieza: LimpiezaElemento[] = [];
    let migraElemLimpieza: object[]=[];
    let controlchecklists: ControlChecklist[] = [];
    let productos: number[]=[];
    //console.log(fecha);
    let parametros = '&idchecklist=' + idChecklist;
    // llamada al servidor para conseguir los controlchecklist
    this.servidor.getObjects(URLS.CONTROLCHECKLISTS, parametros).subscribe(
      response => {
        //this.controlchecklists = [];
        
        if (response.success && response.data) {
          for (let element of response.data) {
            controlchecklists.push(new ControlChecklist(element.id, element.idchecklist, element.nombre, element.migrado));
              misElementosLimpieza.push(new LimpiezaElemento(null,null,element.nombre,new Date(fecha),'interno',periodicidad,'','','',this.empresasService.userId.toString(),this.empresasService.userName));
              productos.push(null);
              let migrar = (element.migrado == 1)?false:true;
              let origen = (element.migrado == 1)?'bd':'app';
              migraElemLimpieza.push({migrar:migrar,migrado:false,origen:origen});
        }
        }
      // mostramos la lista de control checklists
      //this.checklistActiva = parseInt(idChecklist.toString());        
    },
    (error)=>{console.log(error)},
    ()=>{
      //this.limpiezas.push(this.elementosLimpieza);
     // console.log(idChecklist,pos,misElementosLimpieza);
      this.limpiezas[pos] = new Object({Alimpiezas:misElementosLimpieza,AcontrolChecklist:controlchecklists,Aproductos:productos,migracion:migraElemLimpieza});
      // console.log('***',this.limpiezas[pos]['Alimpiezas'])
      // console.log('###',this.limpiezas[pos])
      
    }
    );
  }

  // setProductos(){
  //         let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=limpieza_producto"; 
  //       this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
  //         response => {
  //           this.productos = [];
  //           if (response.success && response.data) {
  //             for (let element of response.data) {  
  //                 this.productos.push(new prods(element.id,element.nombre));
  //            }
  //           }
  //       },
  //       error=>console.log(error),
  //       ()=>{
  //         console.log('completd products');
  //        // this.setItems();
  //       }
  //       );
  // }


calcPeriodicidad(tipoperiodo,periodicidad){
  let newPeriodicidad:string='';
              switch (tipoperiodo) {
              case 'Día':
                newPeriodicidad = '{"repeticion":"diaria","dias":[{"nombre":"lunes","checked":true},{"nombre":"martes","checked":true},{"nombre":"miercoles","checked":true},{"nombre":"jueves","checked":true},{"nombre":"viernes","checked":true},{"nombre":"sabados","checked":false},{"nombre":"domingos","checked":false}],"frecuencia":'+periodicidad+',"tipo":"diames","numdia":28,"nomdia":"1","numsemana":1,"mes":""}';
                break;
              case 'Semana':
                newPeriodicidad = '{"repeticion":"semanal","dias":[{"nombre":"lunes","checked":false},{"nombre":"martes","checked":false},{"nombre":"miercoles","checked":false},{"nombre":"jueves","checked":false},{"nombre":"viernes","checked":false},{"nombre":"sabados","checked":false},{"nombre":"domingos","checked":false}],"frecuencia":'+periodicidad+',"tipo":"diames","numdia":28,"nomdia":"1","numsemana":1,"mes":""}';
                break;
              case 'Mes':
                newPeriodicidad = '{"repeticion":"mensual","dias":[{"nombre":"lunes","checked":false},{"nombre":"martes","checked":false},{"nombre":"miercoles","checked":false},{"nombre":"jueves","checked":false},{"nombre":"viernes","checked":false},{"nombre":"sabados","checked":false},{"nombre":"domingos","checked":false}],"frecuencia":'+periodicidad+',"tipo":"diames","numdia":28,"nomdia":"1","numsemana":1,"mes":""}';
                break;
              case 'Año':
                newPeriodicidad = '{"repeticion":"anual","dias":[{"nombre":"lunes","checked":false},{"nombre":"martes","checked":false},{"nombre":"miercoles","checked":false},{"nombre":"jueves","checked":false},{"nombre":"viernes","checked":false},{"nombre":"sabados","checked":false},{"nombre":"domingos","checked":false}],"frecuencia":'+periodicidad+',"tipo":"diames","numdia":28,"nomdia":"1","numsemana":1,"mes":"1"}';
                break;
              case 'Any':
                newPeriodicidad = '{"repeticion":"anual","dias":[{"nombre":"lunes","checked":false},{"nombre":"martes","checked":false},{"nombre":"miercoles","checked":false},{"nombre":"jueves","checked":false},{"nombre":"viernes","checked":false},{"nombre":"sabados","checked":false},{"nombre":"domingos","checked":false}],"frecuencia":'+periodicidad+',"tipo":"diames","numdia":28,"nomdia":"1","numsemana":1,"mes":"1"}';
                break;
            }
  return newPeriodicidad;
}


calcFecha(idChecklist: number){
  return new Promise((resolve, reject) => {
  let fecha;
    //let parametros = '&idchecklist=' + idChecklist;
    // let parametros = '&idempresa=' + params+"&entidad=limpieza_zona&order=nombre";

      let parametros = '&idempresa=' + this.empresasService.seleccionada+"&entidad=resultadoschecklist"+"&field=idchecklist&idItem="+idChecklist + "&order=id desc"; 
        this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
      response => {
          if (response.success && response.data) {
          //for (let element of response.data) {
            fecha = response.data[0].fecha;
          //}
          }
      // mostramos la lista de control checklists
      //this.checklistActiva = parseInt(idChecklist.toString());        
    },
    (error)=>{
      //return new Date();
      console.log('ERROR obteniendo fecha:', error);
    },
    ()=>{
      //console.log('FIN obteniendo fecha:');
      resolve(fecha);
    }
        );
    
  });
}


setPeriodicidad(periodicidad: string, idItem: number, i: number, x:number){
   // console.log(this.limpiezas[i][x]);
   // this.limpiezas[i][x].periodicidad = periodicidad;
   this.limpiezas[i]['Alimpiezas'][x].periodicidad = periodicidad;
}


setProtocol(protocol:string,i:number,itemId:number){
  //this.elementosLimpieza[i].protocol = protocol;
  //this.protocolo[i] = false;
}


setProducts(productos:string[],countLimpiezas: number, countElementoLimpieza: number){
//  this.productosSeleccionados = productos;
  this.limpiezas[countLimpiezas]['Aproductos'][countElementoLimpieza]=productos

}
verLimpieza(limpieza){
  console.log(limpieza);
}


 nuevaFecha(periodicidad1: string,fecha_prevista: Date){
      let periodicidad = JSON.parse(periodicidad1);
      let hoy = new Date();
      let proximaFecha;
      
      switch (periodicidad.repeticion){
        case "diaria":
        proximaFecha = this.nextWeekDay(periodicidad);
        break;
        case "semanal":

        proximaFecha = moment(fecha_prevista).add(periodicidad.frecuencia,"w");
        break;
        case "mensual":
        if (periodicidad.tipo == "diames"){
            proximaFecha = moment(fecha_prevista).add(periodicidad.frecuencia,"M");
        } else{
          proximaFecha = this.nextMonthDay(fecha_prevista,periodicidad);
        }

        break;
        case "anual":
        if (periodicidad.tipo == "diames"){
          let año = moment(fecha_prevista).get('year') + periodicidad.frecuencia;
        proximaFecha = moment().set({"year":año,"month":parseInt(periodicidad.mes)-1,"date":periodicidad.numdia});
        } else{
          proximaFecha = this.nextYearDay(fecha_prevista,periodicidad);
        }
        break;
      }
      let newdate;
      newdate = moment(proximaFecha).toDate();
      return newdate = new Date(Date.UTC(newdate.getFullYear(), newdate.getMonth(), newdate.getDate()))
}




nextWeekDay(periodicidad:any, fecha?:Date) {
  let hoy = new Date();
  if (fecha) hoy = fecha;
  let proximoDia:number =-1;
  let nextFecha;
  for(let currentDay= hoy.getDay();currentDay<6;currentDay++){
    if (periodicidad.dias[currentDay].checked == true){
      proximoDia = 7 + currentDay - (hoy.getDay()-1);
      break;
    }
  }
  if (proximoDia ==-1){
      for(let currentDay= 0;currentDay<hoy.getDay();currentDay++){
    if (periodicidad.dias[currentDay].checked == true){
      proximoDia = currentDay + 7 - (hoy.getDay()-1);
      break;
    }
  }
}
if(proximoDia >7) proximoDia =proximoDia-7;
nextFecha = moment().add(proximoDia,"days");
return nextFecha;
}

nextMonthDay(fecha_prevista: Date, periodicidad: any){
  let  proximafecha;
  fecha_prevista = new Date(fecha_prevista);
  let mes = fecha_prevista.getMonth() +1 + periodicidad.frecuencia;
 
if (periodicidad.numsemana ==5){
 let ultimodia =  moment(fecha_prevista).add(periodicidad.frecuencia,"M").endOf('month').isoWeekday() - periodicidad.nomdia;
  proximafecha = moment(fecha_prevista).add(periodicidad.frecuencia,"M").endOf('month').subtract(ultimodia,"days");
}else{
let primerdia = 7 - ((moment(fecha_prevista).add(periodicidad.frecuencia,"M").startOf('month').isoWeekday()) - periodicidad.nomdia)
if (primerdia >6) primerdia= primerdia-7;
 proximafecha = moment(fecha_prevista).add(periodicidad.frecuencia,"M").startOf('month').add(primerdia,"days").add(periodicidad.numsemana-1,"w");
}
return  proximafecha;
}
nextYearDay(fecha_prevista: Date, periodicidad: any){
  let proximafecha;
  fecha_prevista = new Date(fecha_prevista);
  let mes = parseInt(periodicidad.mes) -1;
  fecha_prevista = moment(fecha_prevista).month(mes).add(periodicidad.frecuencia,'y').toDate();

if (periodicidad.numsemana ==5){
 let ultimodia =  moment(fecha_prevista).endOf('month').isoWeekday() - periodicidad.nomdia;
 proximafecha = moment(fecha_prevista).endOf('month').subtract(ultimodia,"days");
}else{
let primerdia = 7 - ((moment(fecha_prevista).startOf('month').isoWeekday()) - periodicidad.nomdia)
if (primerdia >6) primerdia= primerdia-7;
 proximafecha = moment(fecha_prevista).startOf('month').add(primerdia,"days").add(periodicidad.numsemana-1,"w");
}
return proximafecha;
}


creaLimpiezas(){
  for (let x=0; x< this.zonas.length;x++){
    if (this.migrarList[x]['migrar']){
      let zona: LimpiezaZona = this.zonas[x];
      zona.idempresa = this.empresasService.seleccionada;
      zona.nombre = this.zonas[x].nombre;
      zona.descripcion = this.zonas[x].descripcion;
      let param = "&entidad=limpieza_zona";
      this.servidor.postObject(URLS.STD_ITEM, zona,param).subscribe(
      response => {
        if (response.success) {
          zona.id = response.id;
          this.migrarList[x]['migrado'] = true;
          this.creaElementoLimpìeza(zona.id,x);
        }
    });

      let check: Checklist = this.checklists[x];
      check.migrado = 1;
      let param2 = "&entidad=checklist";
      let parametros = '?id=' + check.id+param2; 
      console.log(check);
      this.servidor.putObject(URLS.STD_ITEM,parametros, check).subscribe(
      response => {
        if (response.success) {console.log("updated");}
      },
      error=> console.log(error));


    }else{
      if (this.checklists[x].id){
      let param = "&entidad=limpieza_zona&field=idempresa&idItem="+this.empresasService.seleccionada+"&WHERE=descripcion=&valor=importado de checklist"+this.checklists[x].id;
      this.servidor.getObjects(URLS.STD_SUBITEM,param).subscribe(
      response => {
        if (response.success) {
          if (response.data.length == 1){
          let id = response.data[0].id;
          this.migrarList[x]['migrado'] = true;
          this.creaElementoLimpìeza(id,x);
          }else{
            console.log('Posible error en el id de checklist');
          }
        }
    });        
        //this.creaElementoLimpìeza(this.checklists[x].id,x);
      }
    }
}
setTimeout(()=>{this.finMigraLimpiezas('cerrar')},6000)
}


creaElementoLimpìeza(idZona: number, pos:number){
// public entidad:string="&entidad=limpieza_elemento";
// public field:string="&entidad=limpieza_elemento";
//this.limpiezas[pos].array.forEach(element => {
  for (let x=0; x< this.limpiezas[pos]['Alimpiezas'].length;x++){
    if (this.limpiezas[pos]['migracion'][x]['migrar']){

  let limpieza: LimpiezaElemento;
  limpieza = this.limpiezas[pos]['Alimpiezas'][x];
  limpieza.idlimpiezazona = idZona;
  limpieza.app = true;
  limpieza.orden = x+1;

    let param = "&entidad=limpieza_elemento"+"&field=idlimpiezazona&idItem="+idZona;
    limpieza.fecha = new Date(Date.UTC(limpieza.fecha.getFullYear(), limpieza.fecha.getMonth(), limpieza.fecha.getDate()))

    this.servidor.postObject(URLS.STD_ITEM, limpieza,param).subscribe(
      response => {
        if (response.success) {
          this.limpiezas[pos]['migracion'][x]['migrado']=true;
          this.setProductos(response.id,this.limpiezas[pos]['Aproductos'][x]);
        }
    },
    error =>console.log(error)
    );
//*************ACTUALIZA CHECK */
      let control: ControlChecklist = this.limpiezas[pos]['AcontrolChecklist'][x];
      control.migrado = 1;
      let param2 = "&entidad=controlchecklist";
      let parametros = '?id=' + control.id+param2; 
      console.log(control);
      this.servidor.putObject(URLS.STD_ITEM,parametros, control).subscribe(
      response => {
        if (response.success) {console.log("updated");}
      },
      error=> console.log(error));
//*************FIN ACTUALIZA CHECK */


//**************** */
    }
}

}
setProductos(idElementoLimpieza,AmisProductos){
     
      let producto: myprods = new myprods(null,this.empresasService.seleccionada,null,idElementoLimpieza)
      if (AmisProductos){
      for (let y =0 ; y < AmisProductos.length;y++){
    let param = "&entidad=limpieza_productos_elemento";//+"&field=idlimpiezazona&idItem="+idZona;
    producto.idproducto = AmisProductos[y];
    this.servidor.postObject(URLS.STD_ITEM, producto,param).subscribe(
      response => {
        if (response.success) {
        }
    },
    error =>console.log(error)
    );
      }
      }
}

finMigraLimpiezas(valor:string){
  this.finMigracion.emit(valor)
}

}
