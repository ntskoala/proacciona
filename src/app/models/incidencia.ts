export class Incidencia {
    constructor(
      public id: number,
      public idempresa: number,
      public incidencia: string,
      public fecha: Date,
      public solucion: string,
      public responsable: string,
      public nc: number
    ) {}
  }