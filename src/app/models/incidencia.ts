export class Incidencia {
    constructor(
      public id: number,
      public idempresa: number,
      public incidencia: string,
      public fecha: Date,
      public solucion: string,
      public responsable: number,
      public responsable_seguimiento: number,
      public responsable_cierre: number,
      public nc: number,
      public origen:string,
      public idOrigen:number,
      public foto:string,
      public valoracion: string,
      public fecha_valoracion: Date,
      public estado: number
    ) {}
  }

  export class IncidenciaNC {
    constructor(
      public id: number,
      public idIncidencia: number,
      public fecha: Date,
      public valoracion: string,
      public fecha_valoracion: Date,
      public estado: number
    ) {}
  }

  export class IncidenciaAccionesNC {
    constructor(
      public id: number,
      public idIncidencia: number,
      public fecha: Date,
      public accion: string,
      public fecha_termini: Date,
      public responsable: string,
      public estado: number
    ) {}
  }