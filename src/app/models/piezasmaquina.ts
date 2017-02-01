export class PiezasMaquina {
  constructor(
    public id: number,
    public idmaquina: number,
    public nombre: string,
    public cantidad?: number,
    public doc?: string
  ) {}
}