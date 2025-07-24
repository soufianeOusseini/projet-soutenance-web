import {BusStatus} from "./enums/bus-status";

export class Bus {
  id?: number;
  plaque?: string;
  model?: string;
  capacity?: number;
  number?: string;
  image?: string;
  type?: string;
  status?: BusStatus;
  spaceAvailable?: number;
}
