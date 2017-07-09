export class Planificacion {
  constructor(
    public id: number,
    public idempresa: number,
    public nombre: string,
    public fecha: any,
    public periodicidad?: string,
    public photo?: string,
    public supervisor?: number
  ) {}
}
