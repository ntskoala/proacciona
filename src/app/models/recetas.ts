export class Receta {
    constructor(
      public id: number,  
      public idempresa: number,
      public idProducto: number,
      public idProveedor: number,  
      public idMateriaPrima: number,
      public numIngrediente: number,
      public cantidad: number,  
      public tipo_medida: string,
      public preferencia: number,
      public nombreMP:string
  ){}
  }