export class Cliente {
  constructor(
    public nombre: string,
    public idEmpresa: number,
    public contacto?: string,
    public telf?: string,
    public email?: string,
    public id?: number
  ) {}
}