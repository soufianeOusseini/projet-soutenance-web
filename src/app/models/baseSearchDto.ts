export class BaseSearchDto {
  size: number = 20;
  page: number = 0;
  paginate: boolean = false;
  searchTerm: string;

  constructor() {
    this.page = 0;
    this.paginate = false;
    this.searchTerm = '';
  }
}
