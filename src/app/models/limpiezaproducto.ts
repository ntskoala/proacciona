export class LimpiezaProducto {
  constructor(
    public id: number,
    public idempresa: number,
    public nombre: string,
    public marca?: string,
    public tipo?:string,
    public doc?:string
  ) {}
}
