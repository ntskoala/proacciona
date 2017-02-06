export class MantenimientoRealizado {
  constructor(
    public idmantenimiento: number,
    public idmaquina: number,
    public maquina:string,
    public mantenimiento: string,
    public descripcion: string,
    public fecha_prevista: any,
    public fecha: any,
    public tipo?: string,
    public elemento?: string,
    public causas?: string,
    public tipo2?:string,
    public doc?: string,
    public usuario?:number,
    public responsable?: string,
    public id?:number
  ) {}
}
