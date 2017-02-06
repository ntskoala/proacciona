export class CalendarioMantenimiento {
  constructor(
    public maquina: string,
    public ubicacion: string,
    public nombre: string,
    public tipo?: string,
    public periodicidad?: number,
    public tipo_periodo?: string,
  ) {}
}