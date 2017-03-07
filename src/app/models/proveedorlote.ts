export class ProveedorLoteProducto {
  constructor(
    public numlote: string,
    public fecha_entrada: Date,
    public cantidad_inicial: number,
    public tipo_medida:string,
    public cantidad_remanente:number,
    public doc: string,
    public idproducto: number,
    public idproveedor: number,
    public idempresa: number,
    public id?: number
  ) {}
}