import { createContext, useContext, useState, useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import { getRestaurantById } from "../../../services/databaseActions";

interface RestaurantContextType {
  restaurant: any;
  setRestaurant: React.Dispatch<React.SetStateAction<any>>;
  loading: boolean;
  restaurantId: string | string[];
}

const RestaurantContext = createContext<RestaurantContextType | null>(null);

export const useRestaurant = () => useContext(RestaurantContext);

import { ReactNode } from "react";

export const RestaurantProvider = ({ children }: { children: ReactNode }) => {
  const { id } = useLocalSearchParams(); // ✅ Get ID directly from URL
  const [restaurant, setRestaurant] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return; // Handle undefined ID

    const fetchRestaurant = async () => {
      try {
        const data = await getRestaurantById(Array.isArray(id) ? id[0] : id);
        setRestaurant(data);
      } catch (error) {
        console.error("Error fetching restaurant:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id]); // ✅ Fetch when ID changes

  return (
    <RestaurantContext.Provider
      value={{ restaurant, setRestaurant, loading, restaurantId: id }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};
