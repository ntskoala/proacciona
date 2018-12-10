export class PermissionMaquinaria {
    constructor(
      public id: number,
      public idusuario: number,
      public idmantenimiento: number,
      public idempresa?: number
    ) {}
  }

  export class PermissionCalibracion {
    constructor(
      public id: number,
      public idusuario: number,
      public idcalibracion: number,
      public idempresa?: number
    ) {}
  }