import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { EmpresasService } from '../services/empresas.service';
import { Servidor } from '../services/servidor.service';
import { Empresa } from '../models/empresa';
import { URLS } from '../models/urls';
import { Checklist } from '../models/checklist';
import { ControlChecklist } from '../models/controlchecklist';
import { Modal } from '../models/modal';

@Component({
  selector: 'tab-checklists',
  templateUrl: '../assets/html/checklists.component.html'
})
export class ChecklistsComponent implements OnInit{

  private subscription: Subscription;
  checklistActiva: number = 0;
  checklist: Checklist = new Checklist(0, 0, 'Seleccionar', 0, '');
  checklists: Checklist[] = [];
  controlchecklists: ControlChecklist[] = [];
  cl: Object = {tipoperiodo: 'Día'};
  ccl: Object = {};
  modificar: boolean = false;
  modCL: Checklist;
  guardar = [];
  idBorrar: number;
  modalCL: Modal = new Modal();
  modalCCL: Modal = new Modal();
  modalImportCL: Modal = new Modal();
  empresa: any;
  constructor(private servidor: Servidor, private empresasService: EmpresasService) {}

  ngOnInit() {
    if (this.empresasService.seleccionada > 0) this.setEmpresa(this.empresasService.seleccionada.toString());
    this.subscription = this.empresasService.empresaSeleccionada.subscribe(
      emp => {
        this.setEmpresa(emp);
    });
    if (this.empresasService.administrador == false) {
      this.setEmpresa(this.empresasService.empresaActiva.toString());
    }
  }

     setEmpresa(emp: Empresa | string) {
        this.empresa = emp;
    let params = typeof(emp) == "string" ? emp : emp.id
    let parametros = '&idempresa=' + params;
        //let parametros = '&idempresa=' + seleccionada.id;
        // Llamada al servidor para conseguir las checklists
        this.servidor.getObjects(URLS.CHECKLISTS, parametros).subscribe(
          response => {
            // Ocultar mostrar control checklists
            this.checklistActiva = 0;
            // Vaciar la lista actual
            this.checklists = [];
            this.checklists.push(this.checklist);
            if (response.success == 'true' && response.data) {
              for (let element of response.data) {
                this.checklists.push(new Checklist(element.id, element.idempresa, element.nombrechecklist,
                  element.periodicidad, element.tipoperiodo));
              }
            }
        });
   }

  nuevaChecklist(cl: Checklist) {
    // Limpiar el form
    this.cl = {tipoperiodo: 'Día'};
    let nuevaChecklist = new Checklist(0, this.empresasService.seleccionada,
      cl.nombrechecklist, cl.periodicidad, cl.tipoperiodo);
    this.servidor.postObject(URLS.CHECKLISTS, nuevaChecklist).subscribe(
      response => {
        // si tiene éxito
        if (response.success) {
          nuevaChecklist.id = response.id;
          this.checklists.push(nuevaChecklist);
          console.log('Checklist creada');
        }
        // checklist errónea
        else {
          alert('Checklist no creada');
        }
    });
  }
  
  modificarCL() {
    if (this.checklistActiva !== 0) {
      this.modificar = true;
    }
    this.modCL = this.checklists.find(checklist => checklist.id == this.checklistActiva);
  }

  actualizarCL() {
    let parametros = '?id=' + this.modCL.id;            
    this.servidor.putObject(URLS.CHECKLISTS, parametros, this.modCL).subscribe(
      response => {
        if (response.success) {
          console.log('Checklist updated');
        }
      }
    )
    this.modificar = false;
  }

  checkBorrarCL() {
    if (this.checklistActiva !== 0) {
      this.modalCL.titulo = 'borrarChecklistT';
      this.modalCL.subtitulo = 'borrarChecklistST';
      this.modalCL.eliminar = true;
      this.modalCL.visible = true;
    }
  }

  cerrarModalCL(event: boolean) {
    this.modalCL.visible = false;
    if (event) {
      let parametros = '?id=' +  this.checklistActiva;
      this.servidor.deleteObject(URLS.CHECKLISTS, parametros).subscribe(
        response => {
          if (response.success) {
            let clBorrar = this.checklists.find(cl => cl.id == this.checklistActiva);
            let indice = this.checklists.indexOf(clBorrar);
            this.checklists.splice(indice, 1);
            this.checklistActiva = 0;                    
          }
      });
    }
  }

  mostrarCCL(idChecklist: number) {
    console.log(idChecklist);
    let parametros = '&idchecklist=' + idChecklist;
    // llamada al servidor para conseguir los controlchecklist
    this.servidor.getObjects(URLS.CONTROLCHECKLISTS, parametros).subscribe(
      response => {
        this.controlchecklists = [];
        if (response.success && response.data) {
          for (let element of response.data) {
            this.controlchecklists.push(new ControlChecklist(element.id, element.idchecklist,
              element.nombre));
            this.guardar[element.id] = false;
          }
        }
      // mostramos la lista de control checklists
      this.checklistActiva = parseInt(idChecklist.toString());        
    });
  }

  crearCCL(ccl: ControlChecklist) {
    // Limpiar el form
    this.ccl = {};
    let nuevoCCL = new ControlChecklist(0, this.checklistActiva, ccl.nombre);
    this.servidor.postObject(URLS.CONTROLCHECKLISTS, nuevoCCL).subscribe(
      response => {
        if (response.success) {
          nuevoCCL.id = response.id;
          this.controlchecklists.push(nuevoCCL);
        }
    });
  }

  checkBorrarCCL(idCCL: number) {
    this.idBorrar = idCCL;
    this.modalCCL.titulo = 'borrarControlchecklistT';
    this.modalCCL.subtitulo = 'borrarControlchecklistST';
    this.modalCCL.eliminar = true;
    this.modalCCL.visible = true;
  }

  cerrarModalCCL(event: boolean) {
    this.modalCCL.visible = false;
    if (event) {
      let parametros = '?id=' + this.idBorrar;
      this.servidor.deleteObject(URLS.CONTROLCHECKLISTS, parametros).subscribe(
        response => {
          if (response.success) {
            let cclBorrar = this.controlchecklists.find(ccl => ccl.id == this.idBorrar);
            let indice = this.controlchecklists.indexOf(cclBorrar);
            this.controlchecklists.splice(indice, 1);
          }
      });
    }
  }

  modificarCCL(idControlchecklist: number) {
    this.guardar[idControlchecklist] = true;
  }
  
  actualizarCCL(idControlchecklist: number) {
    this.guardar[idControlchecklist] = false;
    let modControlchecklist = this.controlchecklists.find(controlchecklist => controlchecklist.id == idControlchecklist);
    let parametros = '?id=' +  idControlchecklist;
    this.servidor.putObject(URLS.CONTROLCHECKLISTS, parametros, modControlchecklist).subscribe(
      response => {
        if (response.success) {
          console.log('Controlchecklist updated');
        }
    });
  }
  import() {
    if (this.checklistActiva !== 0) {
      this.modalImportCL.titulo = 'Importar Checklist';
      this.modalImportCL.subtitulo = '';
      this.modalImportCL.eliminar = false;
      this.modalImportCL.visible = true;
      this.modalImportCL.importchecklist = true;
    }
  }
  cerrarModalImportCL(event: string | boolean) {
   this.modalImportCL.visible = false;
    if (event) {
      

  
    let parametros = '&idchecklist=' + event;
    // llamada al servidor para conseguir los controlchecklist
    this.servidor.getObjects(URLS.CONTROLCHECKLISTS, parametros).subscribe(
      response => {
        if (response.success && response.data) {
          for (let element of response.data) {
            this.crearCCL(new ControlChecklist(0, this.checklistActiva,
              element.nombre));
          }
        }
    });
  
    }
  }


}
