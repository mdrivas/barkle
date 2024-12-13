import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export function useTempId() {
  const { data: session } = useSession();
  const [tempId, setTempId] = useState<string | undefined>();

  useEffect(() => {
    const existingTempId = localStorage.getItem("barkle_temp_id");
    if (!existingTempId && !session?.user) {
      const newTempId = crypto.randomUUID();
      localStorage.setItem("barkle_temp_id", newTempId);
      setTempId(newTempId);
    } else {
      setTempId(existingTempId ?? undefined);
    }
  }, [session?.user]);

  return tempId;
}
