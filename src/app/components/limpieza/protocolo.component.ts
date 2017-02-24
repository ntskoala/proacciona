import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';

import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { LimpiezaElemento } from '../../models/limpiezaelemento';
import { LimpiezaZona } from '../../models/limpiezazona';
import { Modal } from '../../models/modal';

@Component({
  selector: 'protocolo',
  templateUrl: './protocolo.component.html',
  styleUrls:['protocolo.css']
})

export class ProtocoloComponent implements OnInit, OnChanges{
@Input() parentProtocol:string;
@Output() protocolEmitter:EventEmitter<string>=new EventEmitter<string>();
private protocolo:Object[]=[];
nuevoProcedimiento:string='';
  constructor(private servidor: Servidor,private empresasService: EmpresasService) {}

  ngOnInit() {
      if(this.parentProtocol && Array.isArray(this.parentProtocol)) {
          try{
          this.protocolo = JSON.parse(this.parentProtocol);
          }
          catch (e){
              console.log (e);
          }
          console.log(this.protocolo);
      }

}
  ngOnChanges(){     
  }
addProcedimiento(){
this.protocolo.push({"descripcion":this.nuevoProcedimiento});
this.nuevoProcedimiento='';
}
removeProcedimiento(i){
    this.protocolo.splice(i,1);
}
setProtocolo(){
    this.protocolEmitter.emit(JSON.stringify(this.protocolo));
}

}
