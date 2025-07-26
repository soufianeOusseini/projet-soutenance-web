import {User} from "./user";
import {DriverStatus} from "./enums/driver-status";

export class Driver{
  id: number | undefined;
  driverLicenseNumber: string | undefined;

  licenseExpiryDate : Date | undefined;

  status: DriverStatus | undefined;

  isAvailable: boolean | undefined;

  user: User | undefined;
}
