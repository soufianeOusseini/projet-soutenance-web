
// models/colis.model.ts

import {ColisItems} from "./colis-items";
import {ColisStatus} from "./enums/colis-status";

export class Colis {
  id?: number;
  numero?: string;
  expediteur?: string;
  destinateur?: string;
  heureEnvoi?: Date;
  prix?: number;
  lieuEnvoi?: string;
  lieuReception?: string;
  status?: ColisStatus;
  colisItems?: ColisItems[] = [];
}
