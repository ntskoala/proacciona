import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { Servidor } from './servidor.service';
import { URLS } from '../models/urls';

@Injectable()
export class PermisosService {
    // variables

    exportar: boolean;
    fichas_maquinaria: boolean;
    personal: boolean;
    limpieza:boolean;
    constructor(private servidor: Servidor){}


    // exportarFuente = new Subject<boolean>();
    // ficha_maquinariaFuente = new Subject<boolean>();



    setOpciones(valor: boolean, opcion) {
   //     console.log(opcion);
        switch (opcion) {
            case "exportar informes":
                // this.exportarFuente.next(valor);
                this.exportar = valor;
  //              console.log ("exportar", this.fichas_maquinaria);
                break;
            case "fichas maquinaria":
                this.fichas_maquinaria = valor;
                break;
            case "limpieza":
                this.limpieza = valor;
                break;
            case "personal":
                this.personal = valor;
                break;
        }
    }




}
