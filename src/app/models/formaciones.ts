export class Formacion {
    constructor(
      public id: number,
      public idempresa: number,
      public nombre: string,
      public descripcion: string,
      public familia: number,
      public fecha: any,
      public periodicidad: string,
      public responsable: string,
      public doc:string,//pdf material del curso.
      public supervisor?: number,
      public orden?:number
    ) {}
  }
  