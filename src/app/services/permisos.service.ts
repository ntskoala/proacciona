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
    traspasos:boolean;
    planificaciones:boolean;
    constructor(private servidor: Servidor){}


    // exportarFuente = new Subject<boolean>();
    // ficha_maquinariaFuente = new Subject<boolean>();



    setOpciones(valor: boolean, opcion) {
        console.log(opcion);
        switch (opcion) {//OPCION = ID opcion
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
            case "4"://"clientes":
                this.clientes = valor;
                break;
            case "5"://"proveedores":
                this.proveedores = valor;
                break;
            case "6"://"produccion":
                this.produccion = valor;
                break;
             case "7"://"Traspasos Vaquería":
                this.traspasos = valor;
                break;  
                case "8"://"Planificaciones":
                this.planificaciones = valor;
                break;                 
            // case ://"personal":
            //     this.personal = valor;
            //     break;
        }
    }




}
