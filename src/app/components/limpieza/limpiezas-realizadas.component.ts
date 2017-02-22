import { Component, OnInit, Input } from '@angular/core';

import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { LimpiezaRealizada } from '../../models/limpiezarealizada';
import { LimpiezaZona } from '../../models/limpiezazona';
import { Modal } from '../../models/modal';

@Component({
  selector: 'limpiezas-realizadas',
  templateUrl: './limpiezas-realizadas.component.html',
  styleUrls:['limpieza.component.css']
})

export class LimpiezasRealizadasComponent implements OnInit {
@Input() limpieza: LimpiezaZona;

public items: LimpiezaRealizada[];
modal: Modal = new Modal();
entidad:string="&entidad=limpieza_realizada";
field:string="&field=idlimpiezazona&idItem=";
es
  constructor(private servidor: Servidor,private empresasService: EmpresasService) {}


 ngOnInit() {
      this.setItems();
                 this.es = {
            monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
                'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            dayNames: ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'],
            dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
            dayNamesMin: ["Do","Lu","Ma","Mi","Ju","Vi","Sa"],
            firstDayOfWeek: 1
        }; 
  }
  ngOnChanges(){
      this.setItems();
  }


  setItems(){
  //  let params = this.maquina.id;
  //  let parametros = '&idmaquina=' + params;
      let parametros = '&idempresa=' + this.empresasService.seleccionada+this.entidad+this.field+this.limpieza.id; 
        this.servidor.getObjects(URLS.STD_SUBITEM, parametros).subscribe(
          response => {
            this.items = [];
            if (response.success && response.data) {
              for (let element of response.data) {  
                  this.items.push(new LimpiezaRealizada(element.idelemento,element.idlimpiezazona,element.nombre,element.descripcion,new Date(element.fecha_prevista),new Date(element.fecha_prevista),element.tipo,element.usuario,element.responsable,element.id,element.idempresa));
                  // this.url.push({"imgficha":this.baseurl + element.id +'_'+element.imgficha,"imgcertificado":this.baseurl + element.id +'_'+element.imgcertificado});
             }
            }

        });
       
  }
}