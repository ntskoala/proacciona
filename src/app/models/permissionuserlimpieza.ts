export class PermissionUserLimpieza {
  constructor(
    public id: number,
    public idusuario: number,
    public idelementolimpieza: number,
    public idempresa?: number
  ) {}
}