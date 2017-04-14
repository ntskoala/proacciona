export class CalendarioMantenimiento {
  constructor(
    public maquina: string,
    public ubicacion: string,
    public nombre: string,
    public tipo?: string,
    public periodicidad?: string,
    public tipo_periodo?: string,
  ) {}
}