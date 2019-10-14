export class Trabajador {
    constructor(
      public id: number,
      public idusuario: number,
      public idempresa: number,
      public fecha_alta: any,
      public fecha_baja: any,
      public nombre: string,
      public apellidos: string,
      public cargo: string,
      public area: string,
      public idsupervisor: number,
      public imagen: string,
      public cv:string
    ) {}
  }
  

