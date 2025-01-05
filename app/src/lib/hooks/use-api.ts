import { usePocketBase } from "../pocketbase";
import { API } from "@/lib/api";

export const useAPI = () => {
  const pb = usePocketBase();

  return new API(pb);
}
