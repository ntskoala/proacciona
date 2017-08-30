export class Alerta{
  constructor(
    public id: number,
    public idempresa: number,
    public modulo: string,
    public tiempo_alerta: number,//en días
    public usuarios: string //JSON
  ) {}
}