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
    constructor(private servidor: Servidor){}


    // exportarFuente = new Subject<boolean>();
    // ficha_maquinariaFuente = new Subject<boolean>();



    setOpciones(valor: boolean, opcion) {
        console.log(opcion);
        switch (opcion) {
            case "exportar":
                // this.exportarFuente.next(valor);
                this.exportar = valor;
                console.log ("exportar", this.fichas_maquinaria);
                break;
            case "fichas_maquinaria":
                // this.ficha_maquinariaFuente.next(valor);
                this.fichas_maquinaria = valor;
                console.log ("maquinas", this.fichas_maquinaria);
                break;
        }
    }




}
