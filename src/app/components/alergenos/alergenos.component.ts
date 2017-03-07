import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';

import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { LimpiezaElemento } from '../../models/limpiezaelemento';
import { LimpiezaZona } from '../../models/limpiezazona';
import { Modal } from '../../models/modal';

@Component({
  selector: 'select-alergenos',
  templateUrl: './alergenos.component.html',
  styleUrls:['alergenos.css']
})

export class AlergenosComponent implements OnInit, OnChanges{
@Input() parentAlergenos:string;
@Output() selectedAlergenosChange:EventEmitter<string>=new EventEmitter<string>();
public viewAlergenos: boolean;
private alergenos:string[]=['frutos secos','lacteos','gluten','huevos','otros'];
public selectedAlergenos:string[]=[];

  constructor(private servidor: Servidor,private empresasService: EmpresasService) {}

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

}
  ngOnChanges(){     
  }

cambiaEstadoAlergeno(alergeno){
    let index = this.selectedAlergenos.indexOf(alergeno);
    if (index < 0){
       this.addAlergeno(alergeno);
    }else{
        this.quitaAlergeno(index);
    }
}

addAlergeno(alergeno){
this.selectedAlergenos.push(alergeno);
}
quitaAlergeno(i){
    this.selectedAlergenos.splice(i,1);
}
setAlergenos(){
 
    this.viewAlergenos = !this.viewAlergenos;
    if (!this.viewAlergenos) {
        console.log('...');
    this.selectedAlergenosChange.emit(JSON.stringify(this.selectedAlergenos));
    }
}

}
