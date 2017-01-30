export class Maquina {
  constructor(
    public id: number,
    public nombre: string,
    public idempresa: number,
    public ubicacion?: string, 	
    public numserie?: string, 	
    public fecha_adquisicion?: string, 	
    public fabricante?: string, 	
    public modelo?: string, 	
    public codigo_interno?: string, 	
    public potencia?: string, 	
    public medidas?: string, 	
    public funciones?: string, 	
    public imgfunciones?: string, 	
    public regimen_trabajo?: string, 	
    public ciclo_productivo?: string, 	
    public material?: string, 	
    public liquido_refrigerante?: string, 	
    public modo_trabajo?: string, 	
    public lubricacion?: string
  ) {}
}

