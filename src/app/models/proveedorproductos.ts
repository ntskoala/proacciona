export class ProveedorProducto {
  constructor(
    public nombre: string,
    public descripcion: string,
    public alergenos: string,
    public doc: string,
    public idproveedor: number,
    public id?: number
  ) {}
}