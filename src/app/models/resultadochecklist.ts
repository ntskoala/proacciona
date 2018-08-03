export class ResultadoChecklist {
  constructor (
    public idr: string,
    public idcontrolchecklist: number,
    public idchecklist: number,
    public usuario: string,
    public resultado: string,
    public descripcion: string,
    public fecha: Date,
    public foto: string,
    public fotocontrol: string,
    public idrc: number
  ) {}
}
