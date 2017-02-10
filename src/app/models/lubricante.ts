export class Lubricante {
  constructor(
    public id: number,
    public idempresa:number,
    public nombre?: string,
    public marca?: string,
    public tipo?:string, //[H1 | H2]
    public imgficha?:string,
    public imgcertificado?:string
  ) {}
}
