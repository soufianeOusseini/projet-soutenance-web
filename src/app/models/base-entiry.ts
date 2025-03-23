export class BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;

  constructor() {
    this.id = 0;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.deletedAt = new Date();
  }

}
