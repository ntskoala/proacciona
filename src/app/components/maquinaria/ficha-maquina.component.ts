import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'
import { Servidor } from '../../services/servidor.service';
import { URLS } from '../../models/urls';
import { EmpresasService } from '../../services/empresas.service';
import { Empresa } from '../../models/empresa';
 import { Maquina } from '../../models/maquina';
 
@Component({
  selector: 'ficha-maquina',
  templateUrl: './ficha-maquina.component.html',
  styleUrls: ['ficha-maquina.css']
})
export class FichaMaquinaComponent implements OnInit {
@Input() maquina:Maquina;
public camposArray: string[] =[];
public url; 
public verdoc:boolean=false;
  constructor(private servidor: Servidor,private empresasService: EmpresasService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.campos2Array();
    this.url = URLS.DOCS + this.empresasService.seleccionada + '/maquinaria/' + this.maquina.id +'_'+this.maquina.doc;
  }
  photoURL() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
  }
campos2Array(){
  for (let key in this.maquina){
    this.camposArray.push(key);
  }
  console.log(this.camposArray);
}
udateMaquina(){
  console.log('myMachine',this.maquina);
    let parametros = '?id=' + this.maquina.id;        
    this.servidor.putObject(URLS.MAQUINAS, parametros, this.maquina).subscribe(
      response => {
        if (response.success) {
          console.log('Maquina updated');
        }
    });
}
  openDoc(doc){
    window.open(URLS.DOCS + this.empresasService.seleccionada + '/maquinaria/' + this.maquina.id +'_'+doc,'_BLANK');
  }
  uploadFunciones(event) {
    var target = event.target || event.srcElement; //if target isn't there then take srcElement
    let files = target.files;
    //let files = event.srcElement.files;
    let idEmpresa = this.empresasService.seleccionada.toString();
    this.servidor.postDoc(URLS.UPLOAD_DOCS, files,'maquinaria', this.maquina.id.toString(), this.empresasService.seleccionada.toString()).subscribe(
      response => {
        console.log('doc subido correctamente');
        // let activa = this.empresas.find(emp => emp.id == this.empresasService.seleccionada);
        // activa.logo = '1';
      }
    )
  }

}