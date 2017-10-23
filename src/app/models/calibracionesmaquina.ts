export class CalibracionesMaquina {
  constructor(
    public id: number,
    public idmaquina: number,
    public nombre: string,
    public fecha: any,
    public tipo?: string,
    public periodicidad?: string,
    public tipo_periodo?: string,
    public doc?: string,
    public usuario?:number,
    public responsable?: string,
    public orden?: number
  ) {}
}
