export class LimpiezaElemento {
  constructor(
    public id: number,
    public idlimpiezazona: number,
    public nombre: string,
    public fecha: any,
    public tipo?: string,
    public periodicidad?: string,
    public productos?: any,
    public protocol?: string,
    public protocolo?: string,
    public usuario?: string,
    public responsable?: string,
    public app?: boolean,
    public supervisor?: number,
    public orden?: number
  ) {}
}
