import { useState, useEffect } from "react";
import { boardingApi } from "../api/boarding.api";

export function useStaffRoomTypes() {
  const [data, setData] = useState<{ id: string; name: string }[] | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    boardingApi.getRoomTypes()
      .then((res) => {
        setData(res);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load room types", err);
        setIsLoading(false);
      });
  }, []);

  return { data, isLoading };
}
