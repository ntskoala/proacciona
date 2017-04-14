export class LimpiezaRealizada {
  constructor(
    public idelemento: number,
    public idlimpiezazona: number,
    public nombre:string,
    public descripcion: string,
    public fecha_prevista: any,
    public fecha: any,
    public tipo?:string,
    public idusuario?:number,
    public responsable?: string,
    public id?:number,
    public idempresa?:number
  ) {}
}
