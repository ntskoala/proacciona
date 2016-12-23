export class ResultadoChecklist {
  constructor (
    public idr: string,
    public idcontrolchecklist: number,
    public idchecklist: number,
    public resultado: string,
    public descripcion: string,
    public fecha: Date,
    public foto: string,
    public fotocontrol: string
  ) {}
}
