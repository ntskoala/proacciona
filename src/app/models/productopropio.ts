export class ProductoPropio {
  constructor(
    public nombre: string,
    public descripcion?: string,
    public alergenos?: string,
    public doc?: string,
    public id?: number,
    public idempresa?: number,
    public cantidadReceta?:number,
    public tipo_medida?:string
  ) {}
}