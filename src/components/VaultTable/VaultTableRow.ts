import {UserMetadata} from "../../models/hubble/UserMetadata";

interface VaultTableRow extends UserMetadata {
  key: number,
  apy: number,
  liquidationRatio: number,
  leverage: number,
}

export default VaultTableRow;
