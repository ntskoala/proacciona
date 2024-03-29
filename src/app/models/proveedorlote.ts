export class ProveedorLoteProducto {
  constructor(
    public numlote_proveedor: string,
    public fecha_entrada: Date,
    public fecha_caducidad: Date,
    public cantidad_inicial: number,
    public tipo_medida:string,
    public cantidad_remanente:number,
    public doc: string,
    public idproducto: number,
    public idproveedor: number,
    public idempresa: number,
    public id?: number,
    public albaran?:string,
    public idResultadoChecklist?:number,
    public idResultadoChecklistLocal?: number
  ) {}
}