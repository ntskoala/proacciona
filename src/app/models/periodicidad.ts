export class Periodicidad {
  constructor(
    public repeticion: string, //[diaria|semanal|mensual|anual]
    public dias: any[], //array dias
    public frecuencia: number, //cada xx [semanas | meses | años]
    public tipo: string, //dia del mes | dia del año
    public numdia: number, //dia del mes case tipo == dia del mes
    public nomdia: string, //dia de la semana case tipo == dia de la semana
    public numsemana: number, //numero de la semana case tipo == dia de la semana (de que semana del mes)
    public mes: string // mes case repeticion anual
  ) {}
}
