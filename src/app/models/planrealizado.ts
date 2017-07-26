export class PlanRealizado {
  constructor(
    public id: number,
    public idplan: number,
    public idfamilia: number,
    public idempresa:number,
    public nombre:string,
    public descripcion: string,
    public fecha_prevista: any,
    public fecha: any,
    public idusuario?:number,
    public idsupervisor?:number,
    public fecha_supervision?:Date,
    public supervision?:number,
    public detalles_supervision?:string,
    public supervisor?:string,
    public imagen?:string,
    public doc?:string
  ) {}
}
