import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import {MessageService} from 'primeng/components/common/messageservice';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

import { EmpresasService } from '../../services/empresas.service';
import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { Usuario } from '../../models/usuario';
import { Empresa } from '../../models/empresa';
import { Modal } from '../../models/modal';

@Component({
  selector: 'tab-usuarios',
  templateUrl: './usuarios.component.html'
})
export class UsuariosComponent implements OnInit {

  public subscription: Subscription;
  usuarios: Usuario[] = [];
  guardar = [];
  public alertaGuardar:object={'guardar':false,'ordenar':false};  
  nuevoUsuario: Object = {tipouser: 'Operario',superuser:0};
  idBorrar: number;
  modal: Modal = new Modal();
  procesando:boolean=false;
  public tipos:object[]=[{label:'Operario', value:'Operario'},{label:'Gerente', value:'Gerente'},{label:'Mantenimiento', value:'Mantenimiento'},{label:'Admin Holding', value:'Admin'}];
  public superusers:object[]=[{label:'Activado', value:1},{label:'Desactivado', value:0}];
  public cols:any[];
  public newRow:boolean=false;
  //***   EXPORT DATA */
public exportar_informes: boolean =false;
public exportando:boolean=false;
public informeData:any;
//***   EXPORT DATA */


  constructor(public servidor: Servidor, public empresasService: EmpresasService
    , public translate: TranslateService, private messageService: MessageService) {}

  ngOnInit() {
    console.log (this.empresasService.seleccionada);
    if (this.empresasService.seleccionada > 0) this.setEmpresa(this.empresasService.seleccionada.toString());
    this.subscription = this.empresasService.empresaSeleccionada.subscribe(
      emp => {
        this.setEmpresa(emp);
    });
    if (this.empresasService.administrador == false) {
      this.setEmpresa(this.empresasService.empresaActiva.toString());
    }
    this.traduceOpciones();
    this.cols = [
      { field: 'usuario', header: 'Usuario', type: 'std', width:160,orden:true,'required':true },
      { field: 'password', header: 'Contraseña', type: 'std', width:160,orden:true,'required':true },
      { field: 'tipouser', header: 'Tipo', type: 'dropdown', width:120,orden:true,'required':true },
      { field: 'superuser', header: 'Mantenimiento', type: 'dropdown', width:90,orden:false,'required':false },
      // { field: 'userHolding', header: 'userHolding', type: 'dropdown', width:90,orden:false,'required':false },
      { field: 'email', header: 'email', type: 'std', width:130,orden:true,'required':false }
    ];
  }
  traduceOpciones(){
    if (localStorage.idioma=='cat'){
    this.tipos=[{label:'Operari', value:'Operario'},{label:'Gerent', value:'Gerente'},{label:'Manteniment', value:'Mantenimiento'},{label:'Admin Holding', value:'Admin'}];
    this.superusers=[{label:'Activat', value:1},{label:'Desactivat', value:0}];
    } 
  }
  getOptions(option){
    //console.log('*****',option);
    switch (option[0]){
    case 'tipouser':
    return this.tipos;
    break;
    case 'superuser':
    return this.superusers;
    break;
    }
    }



  setEmpresa(emp: Empresa | string) {
    let params = typeof(emp) == "string" ? emp : emp.id
    let parametros = '&idempresa=' + params;
    // llamada al servidor para conseguir los usuarios
    this.servidor.getObjects(URLS.USUARIOS, parametros).subscribe(
      response => {
        this.usuarios = [];
        if (response.success && response.data) {
          let orden=0;
          for (let element of response.data) {
            if (element.orden == 0){
              this.guardar[element.id] = true;
              orden++;
              }else{orden=parseInt(element.orden);}
            this.usuarios.push(new Usuario(element.id, element.usuario, element.password,
              element.tipouser, element.email, element.idempresa,0+orden,element.superuser));
            this.guardar[element.id] = false;
          }
        }
    });
    
  }

  crearUsuario(usuario) {
    let usuarioCrear = new Usuario(0, usuario.usuario, usuario.password,
      usuario.tipouser, usuario.email, this.empresasService.seleccionada,this.newOrden(),usuario.superuser);
    this.servidor.postObject(URLS.USUARIOS, usuarioCrear).subscribe(
      response => {
        if (response.success == "true") {
          usuarioCrear.id = response.id;
          this.usuarios.push(usuarioCrear);
          this.usuarios = this.usuarios.slice();
          this.setAlerta('alertas.saveOk','success','alertas.tituloAlertaInfo');
        }else{
          this.setAlerta('alertas.saveNotOk','error','alertas.tituloAlertaInfo',response.error);
        }
    },
    (error)=>{
      this.setAlerta('alertas.saveNotOk','error','alertas.tituloAlertaInfo');
    });
    // limpiar form
    this.nuevoUsuario = {usuario: '', password: '', tipouser: 'Operario'}  
  }
  
  newOrden():number{
    let orden;
    if ( this.usuarios.length && this.usuarios[this.usuarios.length-1].orden >0){
      orden = this.usuarios[this.usuarios.length-1].orden+1;
     }else{
      orden = 0;
     }
     return orden;
  }
  checkBorrar(idBorrar: number) {
    // Guardar el id del usuario a borrar
    this.idBorrar = idBorrar;
    // Crea el modal
    this.modal.titulo = 'borrarUsuarioT';
    this.modal.subtitulo = 'borrarUsuarioST';
    this.modal.eliminar = true;
    this.modal.visible = true;
  }

  cerrarModal(event: boolean) {
    this.modal.visible = false;
    if (event) {
      let parametros = '?id=' + this.idBorrar;
      this.servidor.deleteObject(URLS.USUARIOS, parametros).subscribe(
        response => {
          if (response.success) {
            let usuarioBorrar = this.usuarios.find(usuario => usuario.id == this.idBorrar);
            let indice = this.usuarios.indexOf(usuarioBorrar);
            this.usuarios.splice(indice, 1);
            this.usuarios = this.usuarios.slice();
            this.setAlerta('alertas.saveOk','success','alertas.tituloAlertaInfo');
          }else{
            this.setAlerta('alertas.saveNotOk','error','alertas.tituloAlertaInfo');
          }
      },
      (error)=>{
        this.setAlerta('alertas.saveNotOk','error','alertas.tituloAlertaInfo');
      });
    }
  }


  onEdit(evento){
    this.itemEdited(evento.data.id);
    }
    itemEdited(idUsuario: number) {
    this.guardar[idUsuario] = true;
    if (!this.alertaGuardar['guardar']){
      this.alertaGuardar['guardar'] = true;
      this.setAlerta('alertas.guardar','warn','alertas.tituloAlertaInfo');
      }
  }

  setAlerta(concept:string,tipo:string,titulo:string, extraInfo?:string){
    let concepto;
    let sumary;
    this.translate.get(concept).subscribe((valor)=>concepto=valor)  
    this.translate.get(titulo).subscribe((valor)=>sumary=valor)  
    
    this.messageService.clear();this.messageService.add(
      {severity:tipo,//success | info | warn | error  
      summary:sumary, 
      detail: concepto + ' ' + extraInfo
      }
    );
  }

  saveAll(){
    for (let x=0;x<this.guardar.length;x++){
      if (this.guardar[x]==true) {
        let indice = this.usuarios.findIndex((myitem)=>myitem.id==x);
        console.log ("id",x,this.usuarios[indice]);
        this.saveItem(this.usuarios[indice].id)
      }
    }
  }

  saveItem(idUsuario: number) {
    let modUsuario = this.usuarios.find(usuario => usuario.id == idUsuario);
    let parametros = '?id=' + idUsuario;        
    this.servidor.putObject(URLS.USUARIOS, parametros, modUsuario).subscribe(
      response => {
        if (response.success =="true") {
          console.log('User updated');
          this.guardar[idUsuario] = false;
          this.alertaGuardar['guardar'] = false;
          this.usuarios = this.usuarios.slice();
          this.setAlerta('alertas.saveOk','success','alertas.tituloAlertaInfo');
        }else{
          this.setAlerta('alertas.saveNotOk','error','alertas.tituloAlertaInfo');
        }
    },
    (error)=>{
      this.setAlerta('alertas.saveNotOk','error','alertas.tituloAlertaInfo');
    });
  }

  ordenar() {
    console.log('ORDENANDO')
    this.procesando = true;
    this.alertaGuardar['ordenar'] = false;
    this.usuarios.forEach((item) => {
      this.saveItem(item.id);
    });
    this.usuarios = this.usuarios.slice();
    this.procesando = false;
  }
  
  editOrden(){
    if (!this.alertaGuardar['ordenar']){
      this.alertaGuardar['ordenar'] = true;
      this.setAlerta('alertas.nuevoOrden','info','alertas.tituloAlertaInfo');
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
    this.informeData = await this.ConvertToCSV(this.cols, this.usuarios);
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
                this.translate.get('Usuarios').subscribe((desc)=>{informe=desc});
                return {'cabecera':[informeCabecera],'rows':informeRows,'comentarios':[],'informes':informe};
    }

    getDropDownValor(tabla,valor){
      let Value ='';
      let index;
      switch (tabla){
        case "superuser":
        index = this.superusers.findIndex((item)=>item["value"]==valor);
        if (index >-1)
        Value = this.superusers[index]["label"];
        break;
        case "tipouser":
        index = this.tipos.findIndex((item)=>item["value"]==valor);
        if (index >-1)
        Value = this.tipos[index]["label"];
        break;
      }
      console.log(tabla,valor,Value);
      return Value;
    }


}
