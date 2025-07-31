import type { UUID } from "crypto";

export type Model= {
  id: UUID;
  provider: string;
  model_name: string
};
