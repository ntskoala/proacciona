export class Incidencia {
    constructor(
      public id: number,
      public idempresa: number,
      public incidencia: string,
      public responsable: any,
      public fecha: Date,
      public responsable_cierre: number,
      public fecha_cierre: Date,
      public solucion: string,
      public nc: number,
      public origen:string,
      public idOrigen:number,
      public origenasociado: string, 
      public idOrigenasociado: number, 
      public foto:string,
      public descripcion: string,
      public estado: any
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