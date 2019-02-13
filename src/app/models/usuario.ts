export class Usuario {
  constructor(
    public id: number,
    public usuario: string,
    public password: string,
    public tipouser: string,
    public email: string,
    public idempresa: number,
    public orden?: number,
    public superuser?: number,
    public userHolding?:boolean
  ) {}
}
