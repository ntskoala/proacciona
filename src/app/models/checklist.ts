export class Checklist {
  constructor(
    public id: number,
    public idempresa: number,
    public nombrechecklist: string,
    public periodicidad: number,
    public tipoperiodo: string,
    public migrado?: number,
    public periodicidad2?:string,
    public fecha_?:Date,
    public orden?: number
  ) {}
}
