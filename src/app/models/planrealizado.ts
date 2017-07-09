export class PlanRealizado {
  constructor(
    public id: number,
    public idempresa:number,
    public idPlan: number,
    public nombre:string,
    public descripcion: string,
    public fecha_prevista: any,
    public fecha: any,
    public idusuario?:number,
    public idsupervisor?:number,
    public fecha_supervision?:Date,
    public supervision?:number,
    public detalles_supervision?:string,
    public supervisor?:string
  ) {}
}
