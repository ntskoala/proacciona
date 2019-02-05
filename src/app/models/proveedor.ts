export class Proveedor {
  constructor(
    public nombre: string,
    public idEmpresa: number,
    public contacto?: string,
    public telf?: string,
    public email?: string,
    public alert_contacto?: string,
    public alert_telf?: string,
    public alert_email?: string,
    public id?: number,
    public direccion?,
    public poblacion?,
    public nrs?
  ) {}
}
