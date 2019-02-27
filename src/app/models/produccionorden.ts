export class ProduccionOrden {
  constructor(
    public id: number,  
    public 	idempresa: number,
    public numlote: string,
    public fecha_inicio: Date,
    public fecha_fin: Date,
    public fecha_caducidad?: Date,
    public responsable?: string,
    public cantidad?: number,
    public remanente?: number,
    public tipo_medida?: string,
    public idproductopropio?: number,
    public nombre?: string,
    public familia?: string,
    public estado?: string,
    public idalmacen?: number,
    public idcliente?: number,
    public doc?: string
){}
}