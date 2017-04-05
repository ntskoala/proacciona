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
    proveedores:boolean;
    clientes:boolean;
    produccion:boolean;
    constructor(private servidor: Servidor){}


    // exportarFuente = new Subject<boolean>();
    // ficha_maquinariaFuente = new Subject<boolean>();



    setOpciones(valor: boolean, opcion) {
        console.log(opcion);
        switch (opcion) {
            case "1"://"exportar informes":
                // this.exportarFuente.next(valor);
                this.exportar = valor;
  //              console.log ("exportar", this.fichas_maquinaria);
                break;
            case "2"://"fichas maquinaria":
                this.fichas_maquinaria = valor;
                break;
            case "3"://"limpieza":
                this.limpieza = valor;
                break;
            case "4"://"limpieza":
                this.proveedores = valor;
                break;
            case "5"://"limpieza":
                this.clientes = valor;
                break;
            case "6"://"limpieza":
                this.produccion = valor;
                break;
            // case ://"personal":
            //     this.personal = valor;
            //     break;
        }
    }




}
