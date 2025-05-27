import { useState, useEffect } from "react";
import { apiService } from "@/services/api";

interface ExampleData {
  message: string;
}

export const useExample = () => {
  const [data, setData] = useState<ExampleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.getExample();
        setData(response);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};
