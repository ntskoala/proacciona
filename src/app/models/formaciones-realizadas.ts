export class FormacionRealizada {
    constructor(
      public id: number,
      public idplan: number,
      public estado: number,
      public idempresa:number,
      public nombre:string,
      public descripcion: string,
      public fecha_prevista: any,
      public fecha: any,
      public responsable: string,
      public idtrabajador:number,
      public idsupervisor:number,
      public fecha_supervision?:any,
      public supervision?:number,
      public detalles_supervision?:string,
      public supervisor?:string,
      public tipo_formacion?: string,
      public tipo_formador?: string,
      public formador?:string,
      public percentExito?:number,
      public valoracion?:number,
      public imagen?:string,
      public doc?:string
    ) {}
  }
  