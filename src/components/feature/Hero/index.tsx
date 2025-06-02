"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/ui/container";
import { DataTable } from "@/components/ui/data-table";
import { dataColumns, DataProps } from "./components/Column";
import Link from "next/link";
import Image from "next/image";
import { useMarketStore } from "@/hooks/buy-toggle";

const useFetchMarketData = (marketType: string) => {
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

export const Hero = () => {
  const { marketType } = useMarketStore();
  const { data, loading, error } = useFetchMarketData(marketType);

  return (
    <div className="relative w-full min-h-[calc(100vh-144px)]">
      <Image
        src="/assets/nomstead.png"
        alt="Nomstead Background"
        fill
        className="object-cover object-center z-0"
        priority
      />
      <div className="absolute inset-0 z-10 bg-white/85 dark:bg-black/70 backdrop-blur-sm transition-colors" />
      <Container className="relative z-20 py-10 text-gray-900 dark:text-gray-100">
        <div className="flex flex-col gap-2 mb-3">
          <p className="text-xs">
            Looking to use a stove, spinning wheel, or dyeing vat? Try the{" "}
            <span className="text-sm font-semibold md:text-base underline underline-offset-4">
              <Link
                target="_blank"
                href="https://nomstead.com/monami/683474aba6c7a78ddfb799dc"
              >
                SML Nom Market
              </Link>
            </span>
            .
          </p>
          <p className="text-xs">
            Don&apos;t have an account yet? Create one{" "}
            <span className="text-sm font-semibold md:text-base underline underline-offset-4">
              <Link target="_blank" href="https://nomstead.com/?ref=55y8wynm">
                here
              </Link>
            </span>
            .
          </p>
          <p className="text-xs">
            Want to learn more about the game? Visit{" "}
            <span className="text-sm font-semibold md:text-base underline underline-offset-4">
              <Link target="_blank" href="https://nomstead.com/">
                Nomstead
              </Link>
            </span>
            .
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground mt-4">Loading data...</p>
        ) : error ? (
          <p className="text-sm text-red-500 mt-4">{error}</p>
        ) : (
          <DataTable
            filterColumn="name"
            columns={dataColumns(marketType)}
            data={data}
          />
        )}
      </Container>
    </div>
  );
};
