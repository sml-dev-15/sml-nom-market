import { useEffect, useState, useCallback } from "react";

export interface MarketData {
  tile: {
    url: string;
    owner: string;
  };
  object: {
    slug: string;
    category: string;
    subCategory: string;
    metadata: {
      title: string;
    };
    imageUrl: string;
    thumbnailImageUrl: string;
  };
  pricing: {
    unitPrice: number;
    availableQuantity?: number;
    desiredQuantity?: number;
  };
}

export interface DataProps {
  slug: string;
  name: string;
  category: string;
  subCategory: string;
  unitPrice: number;
  availableQuantity?: number;
  desiredQuantity?: number;
  owner: string;
  image: string;
  visit: string;
}

export const useFetchMarketDataCalculator = (
  marketType: "toBuy" | "toSell"
) => {
  const [data, setData] = useState<DataProps[]>([]);
  const [rawData, setRawData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://api.nomstead.com/open/marketplace");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiData = await response.json();
      const marketData: MarketData[] = apiData[marketType] ?? [];

      // Save raw
      setRawData(marketData);

      // Map to DataProps for UI
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedData: DataProps[] = marketData.map((item: any) => ({
        slug: item.object.slug, // 👈 add this
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
      setError(
        err instanceof Error
          ? `Failed to load market data: ${err.message}`
          : "Failed to load market data. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }, [marketType]);

  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  const refetch = useCallback(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  return { data, rawData, loading, error, refetch };
};
