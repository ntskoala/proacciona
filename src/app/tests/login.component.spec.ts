import {TestBed,async, inject} from '@angular/core/testing';
import {LoginComponent} from "../components/login.component";
import {Servidor} from "../services/servidor.service";
import {EmpresasService} from '../services/empresas.service';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { TranslateService } from 'ng2-translate';
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from 'ng2-translate';
// export function createTranslateLoader(http: Http) {
//     return new TranslateStaticLoader(http, './app/assets/i18n', '.json');
// } 
describe('Login Tests', () => {
    let llamada:Http;
    let login:LoginComponent;
    let service:Servidor = new Servidor(llamada);
    let empresa:EmpresasService = new EmpresasService();
    let router:Router;
    let translate:TranslateService;
    beforeEach(() => {
    //     TestBed.configureTestingModule({
    //   imports: [
    //  TranslateModule.forRoot({
    //         provide: TranslateLoader,
    //         useFactory: (createTranslateLoader),
    //         deps: [Http]
    //     })
    // ]
    //     }),
        login = new LoginComponent(service,router,empresa,translate);
    });
 
    it('login test = 5', () => {
        
 
        expect(login.test()).toBe(5);
       // expect(list.items).toEqual(['golden retriever', 'french bulldog', 'german shepherd', 'alaskan husky', 'jack russel terrier']);
    });
});