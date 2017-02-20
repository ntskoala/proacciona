export class CalendarioLimpieza {
  constructor(
    public zona: string,
    public nombre: string,
    public tipo?: string,
    public periodicidad?: string,
  ) {}
}