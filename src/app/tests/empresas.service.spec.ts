import {TestBed,async, inject} from '@angular/core/testing';

import {EmpresasService} from '../services/empresas.service';
import {Empresa} from '../models/empresa';

describe('Empresas Service Tests', () => {
    let empresa:EmpresasService = new EmpresasService();
    beforeEach(() => {
    });
 
    it('empresacreada should error if not object empresa', () => {
        
        let testempresa:Empresa = new Empresa("nombre","true",1);
        empresa.seleccionarEmpresa(testempresa);
        expect(empresa.seleccionada).toBe(1);
       // expect(list.items).toEqual(['golden retriever', 'french bulldog', 'german shepherd', 'alaskan husky', 'jack russel terrier']);
    });
});