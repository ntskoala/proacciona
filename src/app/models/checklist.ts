export class Checklist {
  constructor(
    public id: number,
    public idempresa: number,
    public nombrechecklist: string,
    public periodicidad: number,
    public tipoperiodo: string,
    public migrado?: number
  ) {}
}
