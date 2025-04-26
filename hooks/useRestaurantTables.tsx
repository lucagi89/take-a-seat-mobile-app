// hooks/useRestaurantTables.ts
import { useState, useEffect } from "react";
import { db } from "../scripts/firebase.config";
import {
  collection,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { Table } from "../data/types";

export function useRestaurantTables(restaurantId: string | undefined) {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!restaurantId) {
      setTables([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, "tables"),
      where("restaurantId", "==", restaurantId)
    );

    const unsubscribe: Unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Table, "id">),
        }));
        setTables(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error listening to tables:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [restaurantId]);

  return { tables, loading, error };
}
