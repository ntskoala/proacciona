import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

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

export class AlergenosComponent implements OnInit{
@Input() parentAlergenos:string;
@Output() selectedAlergenosChange:EventEmitter<string>=new EventEmitter<string>();
public viewAlergenos: boolean;
public alergenos:string[]=['Ing Cereales con gluten','Trz Cereales con gluten','Ing Huevos','Trz Huevos','Ing Leche','Trz Leche','Ing Cacahuetes','Trz Cacahuetes','Ing Soja','Trz Soja','Ing Fruits secs de closca','Trz Fruits secs de closca','Ing Apio','Trz Apio','Ing Mostaza','Trz Mostaza','Ing Sésamo','Trz Sésamo','Ing Pescado','Trz Pescado','Ing Crustaceos','Trz Crustaceos','Ing Moluscos','Trz Moluscos','Ing Altramuces','Trz Altramuces','Ing Dioxido de azufre y sulfitos','Trz Dioxido de azufre y sulfitos'];
//public alergenos:string[]=['frutos secos','lacteos','gluten','huevos','otros'];
public selectedAlergenos:string[]=[];

  constructor(public servidor: Servidor,public empresasService: EmpresasService) {}

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



cambiaEstadoAlergeno(alergeno: string){
    let index = this.selectedAlergenos.indexOf(alergeno);
    if (index < 0){
       this.addAlergeno(alergeno);
    }else{
        this.quitaAlergeno(index);
    }
}

addAlergeno(alergeno: string){
this.selectedAlergenos.push(alergeno);
}
quitaAlergeno(i){
    this.selectedAlergenos.splice(i,1);
}
setAlergenos(tipo:string){
 
    this.viewAlergenos = !this.viewAlergenos;
    if (!this.viewAlergenos) {
        console.log('...');
    this.selectedAlergenosChange.emit(JSON.stringify(this.selectedAlergenos));
    }
}

}
