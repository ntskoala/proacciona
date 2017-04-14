export class Distribucion {
  constructor(
    public id: number,
    public idempresa: number,   
    public idcliente: number,
    public idproductopropio: number,
    public idordenproduccion: number,
    public numlote: string,
    public fecha:Date,
    public fecha_caducidad:Date,
    public responsable: string,
    public cantidad: number,
    public tipo_medida: string,
    public alergenos: string
  ) {}
}