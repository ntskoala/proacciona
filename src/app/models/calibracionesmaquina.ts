export class CalibracionesMaquina {
  constructor(
    public id: number,
    public idmaquina: number,
    public nombre: string,
    public tipo?: string,
    public periodicidad?: number,
    public tipo_periodo?: string,
    public doc?: string
  ) {}
}
