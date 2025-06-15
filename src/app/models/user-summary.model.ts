export class UserSummary {

  constructor(
    public id: number,
    public email: string,
    public firstName: string,
    public lastName: string,
    public phone: string
  ) {}

  get fullName(): string {
    return `${this.firstName ?? ''} ${this.lastName ?? ''}`.trim();
  }


}
