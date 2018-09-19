export class Ticket{
    constructor (
      public assigneeId : number,
      public contactId : number,
      public departmentId : number,
      public subject : string,
      public description : string,
      public dueDate : Date,
      public channel : string,
      public priority : string,
      public phone : string,
      public email : string,
      public status : string,
      public foto?: string
    ) {}
  }
