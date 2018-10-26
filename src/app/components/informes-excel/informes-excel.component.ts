import { Component, OnInit } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { Servidor } from '../../services/servidor.service';
// import * as gapi from 'googleapis';
/// <reference path="../../../../node_modules/@types/gapi/index.d.ts" />
declare var gapi: any;
export interface ScriptModel {
  name: string,
  src: string,
  loaded: boolean
}

@Component({
  selector: 'app-informes-excel',
  templateUrl: './informes-excel.component.html',
  styleUrls: ['./informes-excel.component.css']
})
export class InformesExcelComponent implements OnInit {
  private scripts: ScriptModel[] = [];
  public API_KEY = "AIzaSyD4i1_edfeATIacKBW6uCl_YBE4MEWbkeg";
  public CLIENT_ID = '892512263860-ivn0l6helfsb6ac1q17f1isj8e4h862e.apps.googleusercontent.com';

  // Array of API discovery doc URLs for APIs used by the quickstart
  public DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

  // Authorization scopes required by the API; multiple scopes can be
  // included, separated by spaces.
  public SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

  private authorizeButton = document.getElementById('authorize_button');
  private signoutButton = document.getElementById('signout_button');
  public loadAPI: Promise<any>;

  constructor(public servidor:Servidor) { }


  ngOnInit() {
    this.load_funciones().then(
      (valor)=>{
        console.log('FUNCIONES CARGADAS',valor)
        if (valor){
    this.loadAPI = new Promise((resolve) => {
      let newScript:ScriptModel={
      name : 'googleApi',
      src:'https://apis.google.com/js/api.js',
      loaded:false
      }
      console.log('resolving promise...');
      console.log('loaded script...',resolve);
      this.loadScript(newScript).subscribe(
        (elem)=>{
          console.log('script cargado',elem);
          this.handleClientLoad();
        },
        (error)=>{console.log('script error',error);}
      )
  });
}});
  }
    

        /**
       *  On load, called to load the auth2 library and API client library.
       */
      public handleClientLoad() {
        console.log('*****************CLIENTLOAD',gapi);
        gapi.load('client:auth2', this.initClient);
      }
      public initClient() {
        gapi.client.init({
          apiKey:  "AIzaSyD4i1_edfeATIacKBW6uCl_YBE4MEWbkeg",
          clientId: '892512263860-ivn0l6helfsb6ac1q17f1isj8e4h862e.apps.googleusercontent.com',
          discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
          scope: "https://www.googleapis.com/auth/spreadsheets.readonly"
        }).then(
          
          // function () {
            (valor)=>{
              console.log('####',valor,gapi);
          // Listen for sign-in state changes.
          gapi.auth2.getAuthInstance().then(
            (resultado)=>{
              console.log('@@@@@@@@@@@@',resultado,resultado.isSignedIn,resultado.isSignedIn.get());
              resultado.isSignedIn.listen(this.updateSigninStatus(resultado.isSignedIn.get()));
              this.updateSigninStatus(resultado.isSignedIn.get());
            }
          )
          // gapi.auth2.isSignedIn.listen(this.updateSigninStatus);

          // Handle the initial sign-in state.
          

        });
      }
      /**
       *  Called when the signed in status changes, to update the UI
       *  appropriately. After a sign-in, the API is called.
       */
      public updateSigninStatus(isSignedIn) {
        if (isSignedIn) {

          this.listMajors();
        } else {

        }
      }

        /**
       * Print the names and majors of students in a sample spreadsheet:
       * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
       */
      public listMajors() {
        gapi.client.sheets.spreadsheets.values.get({
          spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
          range: 'Class Data!A2:E',
        }).then(function(response) {
          var range = response.result;
          if (range.values.length > 0) {
            console.log('Name, Major:');
            for (let i = 0; i < range.values.length; i++) {
              var row = range.values[i];
              // Print columns A and E, which correspond to indices 0 and 4.
              console.log(row[0] + ', ' + row[4]);
            }
          } else {
            console.log('No data found.');
          }
        }, function(response) {
          console.log('Error: ' + response.result.error.message);
        });
      }
      
     /**
       *  Sign in the user upon button click.
       */
      public handleAuthClick(event) {
        gapi.auth2.getAuthInstance().signIn();
      }

      /**
       *  Sign out the user upon button click.
       */
      public handleSignoutClick(event) {
        gapi.auth2.getAuthInstance().signOut();
      }

      /**
       * Append a pre element to the body containing the given message
       * as its text node. Used to display the results of the API call.
       *
       * @param {string} message Text to be placed in pre element.
       */
      public appendPre(message) {
        var pre = document.getElementById('content');
        var textContent = document.createTextNode(message + '\n');
        pre.appendChild(textContent);
      }      
    // public buttonClicked() {
    //     this.loadAPI = new Promise((resolve) => {
    //         console.log('resolving promise...');
    //         console.log('loaded script...',resolve);
    //         this.loadScript();
    //     });
    // }
    public load_funciones(){
      return new Promise((resolve)=>{
      let funciones =`
      `
        // let node = document.createElement('script');
        // node.text = funciones;
        // node.type = 'text/javascript';
        // node.charset = 'utf-8';
        // // document.getElementsByTagName('head')[0].appendChild(node);
        // document.getElementsByTagName('body')[0].appendChild(node);
        resolve(true);
      })
    }
    public loadScript(script: ScriptModel): Observable<ScriptModel> {
      return new Observable<ScriptModel>((observer: Observer<ScriptModel>) => {
          var existingScript = this.scripts.find(s => s.name == script.name);

          // Complete if already loaded
          if (existingScript && existingScript.loaded) {
              observer.next(existingScript);
              observer.complete();
          }
          else {
              // Add the script

              this.scripts = [script];

              // Load the script
              let scriptElement = document.createElement("script");
              scriptElement.type = "text/javascript";
              scriptElement.async = true;
              scriptElement.defer = true;
              // scriptElement.setAttribute('onload',"handleClientLoad()");
              // scriptElement.setAttribute("onreadystatechange","console.log('*****************STATE CHANGE');if (this.readyState === 'complete') this.onload()");
            //   scriptElement.onreadystatechange = function () {
            //     if (this.readyState == 'complete') 
            //         initScript();//the whole script is wrapped in this function
            // }
              // scriptElement.onload = ()=>{initScript}
              scriptElement.src = script.src;
              document.getElementsByTagName('body')[0].appendChild(scriptElement);
              scriptElement.onload = () => {
                  script.loaded = true;
                  observer.next(script);
                  observer.complete();
              };

              scriptElement.onerror = (error: any) => {
                  observer.error("Couldn't load script " + script.src);
              };

              
          }
      });
  }

    // public loadScript() {
    //   let url= 'https://apis.google.com/js/api.js'
    //     console.log('preparing to load...')
    //     let node = document.createElement('script');
    //     node.src = url;
    //     node.type = 'text/javascript';
    //     node.async = true;
    //     node.defer = true;
    //     node.charset = 'utf-8';
    //     document.getElementsByTagName('head')[0].appendChild(node);
    // }
// https://script.google.com/a/proacciona.es/macros/s/AKfycbzIpotMyRcSxISIMvMLWN0-boPG8drRZ9wD8IQO5eQ/dev
//                 https://script.google.com/macros/s/AKfycbwFHH9ZRXqGXwW3wvkVeDS96MuAlT7GgwxgSUwLoTkkaGQxbn8/exec


getFile(){
  let url='https://www.googleapis.com/drive/v3/files/1d_HGiuU-lOg0xu5anCQ6dwgR9okPApW4TpR5PXzyqaw/export';
  let query = '?mimeType=application%2Fvnd.openxmlformats-officedocument.spreadsheetml.sheet&key='+this.API_KEY;
  this.servidor.getSimple(url).subscribe(
    (valor)=>{
      console.log(valor);
    }
  )
}

getFile2(){
 //let url='https://script.google.com/a/proacciona.es/macros/s/AKfycbzIpotMyRcSxISIMvMLWN0-boPG8drRZ9wD8IQO5eQ/dev?idEmpresa=3';
  let url='https://script.google.com/macros/s/AKfycbwFHH9ZRXqGXwW3wvkVeDS96MuAlT7GgwxgSUwLoTkkaGQxbn8/exec?idEmpresa=4234233'
  this.servidor.getSimple(url).subscribe(
    (valor)=>{
      console.log(valor);
    }
  )
}


}
