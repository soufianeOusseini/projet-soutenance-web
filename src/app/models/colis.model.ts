
// models/colis.model.ts

import {ColisItems} from "./colis-items";

export class Colis {
  id?: number;
  numero?: string;
  expediteur?: string;
  destinateur?: string;
  heureEnvoi?: Date;
  prix?: number;
  lieuEnvoi?: string;
  lieuReception?: string;
  status?: string;
  colisItems?: ColisItems[] = [];
}
