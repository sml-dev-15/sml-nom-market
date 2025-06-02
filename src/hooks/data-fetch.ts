import { DataProps } from "@/components/feature/Hero/components/Column";
import { useEffect, useState } from "react";

export const useFetchMarketData = (marketType: string) => {
  const [data, setData] = useState<DataProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          "https://api.nomstead.com/open/marketplace"
        );
        const apiData = await response.json();
        const marketData = apiData[marketType] ?? [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedData: DataProps[] = marketData.map((item: any) => ({
          name: item.object.metadata.title,
          category: item.object.category,
          subCategory: item.object.subCategory,
          unitPrice: item.pricing.unitPrice,
          availableQuantity:
            marketType === "toBuy"
              ? item.pricing.availableQuantity
              : item.pricing.desiredQuantity,
          owner: item.tile.owner,
          image: item.object.imageUrl,
          visit: item.tile.url,
        }));

        setData(mappedData);
      } catch (err) {
        console.error("API error:", err);
        setError("Failed to load market data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, [marketType]);

  return { data, loading, error };
};
