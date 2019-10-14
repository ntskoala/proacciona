  import { Component, OnInit, Input, Output, OnChanges, ViewChild, EventEmitter } from '@angular/core';
  import { Router,ActivatedRoute, ParamMap  } from '@angular/router';
  
  import { DomSanitizer } from '@angular/platform-browser';
  
  import {DataTable,Column} from 'primeng/primeng';
  import {MessageService} from 'primeng/components/common/messageservice';
  import { TranslateService } from '@ngx-translate/core';
  
  import { Servidor } from '../../services/servidor.service';
  import { URLS,cal } from '../../models/urls';
  import { EmpresasService } from '../../services/empresas.service';
  import { Trabajador } from '../../models/trabajadores';
  // import { LimpiezaZona } from '../../models/limpiezazona';
    import { Usuario } from '../../models/usuario';
  
  import { Modal } from '../../models/modal';
  import * as moment from 'moment';
  import { isDate } from '@angular/common/src/i18n/format_date';
  import { SwitchView } from '@angular/common/src/directives/ng_switch';
  @Component({
    selector: 'app-trabajador',
    templateUrl: './trabajador.component.html',
    styleUrls:['trabajador.component.css']
  })
  
  export class TrabajadorComponent implements OnInit, OnChanges {
  // @Input() limpieza: LimpiezaZona;
  @Input() nueva: number;
  @Output() trabajadores: EventEmitter<Trabajador[]> = new EventEmitter<Trabajador[]>();
  @ViewChild('DT') tablaLimpiezas: DataTable;
  public tablaPosition=0;
  public incidencia:any[];
  
  public items: Trabajador[];
  public nuevoItem: Trabajador = new Trabajador(0,0,0,null,null,'','','','',0,'','');
  public addnewItem: Trabajador = new Trabajador(0,0,0,null,null,'','','','',0,'','');
  public cols:any[];
  public selectedItem: Trabajador;
  public newRow:boolean=false;

  public images: string[];
  public docs: string[];
  public usuarios:object[];
   public guardar = [];
   public alertaGuardar:boolean=false;
  public idBorrar;
  public motivo:boolean[]=[];
  public tipos:object[]=[{label:'Interno', value:'interno'},{label:'Externo', value:'externo'}];
  public supervisar:object[]=[{"value":0,"label":"Por supervisar"},{"value":1,"label":"Correcto"},{"value":2,"label":"Incorrecto"}];
  public countSinSupervisar:number=0;
  public supervisarBatch:number=0;
    modal: Modal = new Modal();
  entidad:string="&entidad=trabajadores";
  field:string="&field=idempresa&idItem=";
  //filterDates:string="&filterdates=true&fecha_inicio="+this.empresasService.currentStartDate+"&fecha_fin="+moment().format("YYYY-MM-DD")+"&fecha_field=fecha";
  es
  //******IMAGENES */
  //public url; 
  public baseurl;
  public verdoc:boolean=false;
  public pdfSrc: string=null;
  public paginaPdf:number=1;
  public maxPdf:number=1;
  public zoomPdf:number=1;
  public image;
  public foto;
  public top = '50px';
  //************** */
  //************** */
  public expanded:boolean=false;
  public currentExpandedId: number;
  //***   EXPORT DATA */
  public exportar_informes: boolean =false;
  public exportando:boolean=false;
  public informeData:any;
  //***   EXPORT DATA */
  
  
    constructor(public servidor: Servidor,public empresasService: EmpresasService,private route: ActivatedRoute
      , public translate: TranslateService, private messageService: MessageService) {}
  
  
   ngOnInit() {
    this.baseurl = URLS.DOCS + this.empresasService.seleccionada + '/trabajadores/';
      
    this.loadSupervisores();
        
        this.es=cal;
          this.cols = [
            { field: 'nombre', header: 'Nombre', type: 'std', width:160,orden:'nombre','required':true },
            { field: 'apellidos', header: 'Apellidos', type: 'std', width:120,orden:'apellidos','required':true },
            { field: 'fecha_alta', header: 'fecha_alta', type: 'fecha', width:120,orden:'fecha_alta','required':true },
            { field: 'cargo', header: 'cargo', type: 'std', width:115,orden:false,'required':true },
            { field: 'area', header: 'area', type: 'std', width:130,orden:false,'required':false },
            { field: 'idusuario', header: 'usuarioTFC', type: 'dropdown', width:130,orden:false,'required':false },
            { field: 'idsupervisor', header: 'limpieza.supervisor', type: 'dropdown', width:110,orden:false,'required':false }
          ];
          if (localStorage.getItem("idioma")=="cat") {
            this.tipos=[{label:'Intern', value:'interno'},{label:'Extern', value:'externo'}];
            this.supervisar=[{"value":0,"label":"Per Supervisar"},{"value":1,"label":"Correcte"},{"value":2,"label":"Incorrecte"}];
          }
          window.scrollTo(0, 0);
    }
  


  incidenciaSelection(){
    let x=0;
    this.route.paramMap.forEach((param)=>{
      x++;
        console.log(param["params"]["id"],param["params"]["modulo"]);
        if (param["params"]["modulo"] == "limpieza_realizada"){
          console.log(param["params"]["id"],param["params"]["modulo"]);
          if (param["params"]["id"]){
            console.log(param["params"]["id"],param["params"]["modulo"]);
            let idOrigen = param["params"]["id"];
            let index = this.items.findIndex((item)=>item.id==idOrigen);
            if (index > -1){
              this.selectedItem = this.items[index]
              this.tablaPosition = index;
              console.log('***_',index,this.selectedItem)
              }else{
                this.setAlerta('incidencia.noencontrada')
              }
          }
        }
      });
  }

  seleccion(evento){
    console.log("SELECCION",evento);
  }


    ngOnChanges(){
      this.baseurl = URLS.DOCS + this.empresasService.seleccionada + '/trabajadores/';
      
        this.loadSupervisores();
        console.log('paso3',this.nueva);
    }
    getOptions(option){
      //console.log('*****',option);
      switch (option[0]){
      case 'tipo':
      return this.tipos;
      break;
      case 'supervision':
      return this.supervisar;
      break;
      case 'idsupervisor':
      return this.usuarios;
      break;
      case 'idusuario':
        return this.usuarios;
        break;
      }
      }
  
    setItems(){

        let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad;
          this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
            response => {
              this.items = [];
              this.images=[];
              this.docs=[];
              this.incidencia=[];
              if (response.success && response.data) {
                for (let element of response.data) {  
                  let fecha;
                  (moment(new Date(element.fecha_supervision)).isValid())? fecha = new Date(element.fecha_supervision): fecha = null;
                  let supervisor = ''; 
                  (element.idsupervisor>0)? supervisor = this.findSupervisor(element.idsupervisor):supervisor =  '';
                    this.items.push(new Trabajador(element.id,element.idusuario,element.idempresa,
                    new Date(element.fecha_alta),new Date(element.fecha_baja),element.nombre,element.apellidos,element.cargo,element.area,
                    element.idsupervisor,element.imagen,element.cv));
                    if (element.supervision == 0) this.countSinSupervisar++;
                    this.motivo.push(false);
                    this.incidencia[element.id]={'origen':'trabajadores','origenasociado':'','idOrigenasociado':0,'idOrigen':element.id}
                    this.images[element.id] = this.baseurl + element.id + "_"+element.imagen;
                    this.docs[element.id] = this.baseurl + element.id + "_"+element.doc;
                  }
                  console.log('EMITIENDO TRABAJADORES...');
                  this.trabajadores.emit(this.items);
                   this.incidenciaSelection();
              }
  
          });
         
    }
  
  
  loadSupervisores(){
      let params = this.empresasService.seleccionada;
      let parametros2 = "&entidad=usuarios"+'&idempresa=' + params;
          this.servidor.getObjects(URLS.STD_ITEM, parametros2).subscribe(
            response => {
              this.usuarios = [];
              this.usuarios.push({'label':'No usa TFC','value':0})
              if (response.success && response.data) {
  
                for (let element of response.data) {  

                    this.usuarios.push({'label':element.usuario,'value':element.id})
               }
  
               this.setItems();
              }
          });
  }
  
  findSupervisor(id:number){
  //console.log(id);
  let index = this.usuarios.findIndex((user)=>user["value"]==id)
  //console.log(this.usuarios[index]);
  let user 
  if (index > -1){
  user = this.usuarios[index]["label"];
  }else{
    user = '';
  }
  return user;
  }
  
  onEdit(event){
    console.log(event);
    this.itemEdited(event.data.id);
  }
      itemEdited(idMantenimiento: number) {
      this.guardar[idMantenimiento] = true;
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
  
    checkBorrar(idBorrar: number) {
      // Guardar el id del control a borrar
      this.idBorrar = idBorrar;
      // Crea el modal
      this.modal.titulo = 'limpieza.borrarLimpiezaR';
      this.modal.subtitulo = 'limpieza.borrarLimpiezaR';
      this.modal.eliminar = true;
      this.modal.visible = true;
    }
  
    cerrarModal(event: boolean) {
      this.modal.visible = false;
      if (event) {
        let parametros = '?id=' + this.idBorrar+this.entidad;
        this.servidor.deleteObject(URLS.STD_SUBITEM, parametros).subscribe(
          response => {
            if (response.success) {
              let controlBorrar = this.items.find(mantenimiento => mantenimiento.id == this.idBorrar);
              let indice = this.items.indexOf(controlBorrar);
              this.selectedItem=null;
              this.items.splice(indice, 1);
              this.items = this.items.slice();
              this.setAlerta('alertas.borrar');
            }
        });
      }
    }
  
    saveAll(){
      for (let x=0;x<this.guardar.length;x++){
        if (this.guardar[x]==true) {
          let indice = this.items.findIndex((myitem)=>myitem.id==x);
          console.log ("id",x,this.items[indice]);
          this.saveItem(this.items[indice])
        }
      }
       
      }
  
   saveItem(trabajador: Trabajador) {
     return new Promise((resolve)=>{
     //console.log ("evento",event);
      this.guardar[trabajador.id] = false;
      this.alertaGuardar = false;


      trabajador.fecha_alta = new Date(Date.UTC(trabajador.fecha_alta.getFullYear(), trabajador.fecha_alta.getMonth(), trabajador.fecha_alta.getDate()))
      trabajador.fecha_baja = new Date(Date.UTC(trabajador.fecha_baja.getFullYear(), trabajador.fecha_baja.getMonth(), trabajador.fecha_baja.getDate()))
      //let parametros = '?id=' + mantenimiento.id;
      let parametros = '?id=' + trabajador.id+this.entidad;  
      this.servidor.putObject(URLS.STD_SUBITEM, parametros, trabajador).subscribe(
        response => {
          if (response.success) {
            resolve(true);
            console.log('Trabajadfor updated');
          }
      });
    })
    }
  

  newItem() {
    console.log (this.nuevoItem);
    let param = this.entidad+"&idempresa="+this.empresasService.seleccionada;

    this.nuevoItem.fecha_alta = new Date(Date.UTC(this.nuevoItem.fecha_alta.getFullYear(), this.nuevoItem.fecha_alta.getMonth(), this.nuevoItem.fecha_alta.getDate()))

    //this.nuevoItem.fecha_al = new Date(Date.UTC(this.nuevoItem.fecha.getFullYear(), this.nuevoItem.fecha.getMonth(), this.nuevoItem.fecha.getDate()))
    //this.nuevoItem.periodicidad = this.mantenimientos[i].periodicidad;
    this.nuevoItem.idempresa = this.empresasService.seleccionada;
    this.addnewItem = this.nuevoItem;
  //  for (let x=0;x<this.cantidad;x++){
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
  //}
  setTimeout(()=>{
      this.setItems()
  },500);
   this.nuevoItem = new Trabajador(0,0,0,null,null,'','','','',0,'','');
  }

  detalleSupervision(idMantenimiento: number,index:number){
  this.motivo[index] = !this.motivo[index];
  }
  setSupervision($event){
  
  }
  
  
  
  
  //*******IMAGENES */
 
  verFoto(foto:string,idItem){
    let calc = window.scrollY;
      this.top = calc + 'px';
      let index = this.items.findIndex((item)=>item.id==idItem);
  
  if (foto=="cv"){
    if (this.items[index].cv){
  if(this.docs[idItem].substr(this.docs[idItem].length-3,3)=='pdf'){  
    this.verdoc =  true;
    this.foto = this.docs[idItem];
  }else{
    this.verdoc =  true;
    this.foto = this.docs[idItem];
  }
    }
  }else{
    console.log(this.items[index].imagen)
    if (this.items[index].imagen){
    this.verdoc =  true;
    this.foto = this.images[idItem];
  }
  }
  console.log(this.foto,this.images)
  }
  cerrarPdf(){
    this.pdfSrc = null;
  }
  
  uploadFunciones(event:any,idItem: number,field?:string) {
    console.log( event)
    var target = event.target || event.srcElement; //if target isn't there then take srcElement
    let files = target.files;
    //let files = event.srcElement.files;
    let idEmpresa = this.empresasService.seleccionada.toString();
     let index = this.items.findIndex((item)=>item.id==idItem);
    this.servidor.postDoc(URLS.UPLOAD_DOCS, files,'limpieza_realizada',idItem.toString(), this.empresasService.seleccionada.toString(),field).subscribe(
      response => {
        console.log('doc subido correctamente');
        if (field == 'imagen'){
          console.log('##',this.baseurl + idItem + "_"+files[0].name)
          this.images[idItem] = this.baseurl + idItem + "_"+files[0].name;
          this.items[index].imagen=files[0].name;
        }else{
           this.docs[idItem] = this.baseurl + idItem + "_"+files[0].name;
           this.items[index].cv=files[0].name;
        }
        // let activa = this.empresas.find(emp => emp.id == this.empresasService.seleccionada);
        // activa.logo = '1';
      }
    )
  }
  
  
  
    expandir(dt: any,row:number,event:any){
      console.log(dt,row,event)
  
      dt.toggleRow(row);
    }
  

  
  // getIncidencias(){
  //   let params = this.empresasService.seleccionada;
  //   let parametros2 = "&entidad=incidencias"+'&idempresa=' + params+"&field=idOrigenasociado&idItem="+this.limpieza.id+"&WHERE=origen=&valor=limpiezas";
  //       this.servidor.getObjects(URLS.STD_SUBITEM, parametros2).subscribe(
  //         response => {
            
  //           if (response.success && response.data) {
  
  //             for (let element of response.data) {  
  //               this.incidencia[element.idOrigen]["idIncidencia"]=element.id; 
  //               this.incidencia[element.idOrigen]["estado"]=element.estado;                              
  //            }
             
  //            //console.log(this.incidencia);
  //           // this.localSupervisor = this.findSupervisor(this.empresasService.userId);
  //           }
  //       });
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
                            if (moment(array[i][cabecera[x]['field']]).isValid())
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
                      this.translate.get('limpieza.limpiezas_realizadas').subscribe((desc)=>{informe=desc});
                      return {'cabecera':[informeCabecera],'rows':informeRows,'comentarios':[],'informes':informe};
          }
      
          getDropDownValor(tabla,valor){
            console.log(tabla,valor);
            let Value ='';
            let index;
            switch (tabla){
              case 'tipo':
              index=this.tipos.findIndex((tipo)=>tipo["value"]==valor);
              if (index>-1)
              Value = this.tipos[index]["label"];
              break;
              case 'supervision':
              index=this.supervisar.findIndex((sup)=>sup["value"]==valor);
              if (index>-1)
              Value = this.supervisar[index]["label"];
              break;
              case 'idsupervisor':
              index=this.usuarios.findIndex((user)=>user["value"]==valor);
              if (index>-1)
              Value = this.usuarios[index]["label"];
              break;
              }
            console.log(tabla,valor,Value);
            return Value;
          }
  
  
        
      menuSupervision(){
        console.log('opened menu');
      }
  
    supervisarTodas(lr){
      // let x=1;
      // let z=1;
      // let sinSupervisar = this.items.filter((item)=>{
      //   //console.log(item.supervision)
      //   if (item.supervision==0) return item;
      // })
      // //console.log(sinSupervisar)
      // sinSupervisar.forEach(async (item) => {
      //   item.supervision = 1;
      //   //this.saveItem(item)
      //   this.saveItem(item).then(
      //     (valorx)=>{
      //       z+=1;
      //       this.supervisarBatch = (100 / this.countSinSupervisar)*z;
      //       if(this.supervisarBatch > 99 || z >= this.countSinSupervisar){
      //         setTimeout(()=>{this.supervisarBatch=0},1000);
      //         this.setAlerta('alertas.saveOk')
      //       }
      //     }
      //   )
  
        
      //   x += 1;
      // })

    }
  

  
  }