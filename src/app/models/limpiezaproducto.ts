export class LimpiezaProducto {
  constructor(
    public id: number,
    public idempresa: number,
    public nombre: string,
    public marca?: string,
    public desinfectante?:string,
    public dosificacion?: string,
    public doc?:string,
    public ficha?:string
  ) {}
}
