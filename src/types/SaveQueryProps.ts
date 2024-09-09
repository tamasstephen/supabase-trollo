import { TableNames } from "@/constants";
import { SavePayload } from "./Board";

export interface SaveQueryProps {
  payload: SavePayload;
  tableName: TableNames;
}
