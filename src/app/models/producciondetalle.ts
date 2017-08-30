export class ProduccionDetalle {
  constructor(
    public id: number,  
    public idorden: number,
    public proveedor:string,
    public producto:string,
    public numlote_proveedor:string,
    public idmateriaprima: number,
    public idloteinterno: number,
    public cantidad: number,
    public tipo_medida: string,
    public cantidad_remanente_origen?: number
){}
}