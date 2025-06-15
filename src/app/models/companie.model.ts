import {UserSummary} from "./user-summary.model";
import {CompanyStatus} from "./enums/company-status";

export class CompanieModel {
  id: number | undefined;
  email: string | undefined;
  name: string | undefined;
  telephone: string | undefined;
  address: string | undefined;
  postalCode: string | undefined;
  city: string | undefined;
  region: string | undefined;
   adminFirstName: string | undefined;
   adminLastName : string | undefined;
   adminPhone: string | undefined;
   adminEmail: string | undefined;
   admin: UserSummary | undefined;
   status: CompanyStatus | undefined;

}
