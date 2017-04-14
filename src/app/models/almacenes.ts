export class Almacen {
  constructor(
    public id: number,
    public idempresa:number,
    public nombre:string,
    public capacidad: number,
    public estado: number,
    public idproduccionordenactual: number,
    public level?: number
  ) {}
}
