"use client";

import { Container } from "@/components/ui/container";
import { DataTable } from "@/components/ui/data-table";
import { dataColumns } from "./components/Column";
import { useMarketStore } from "@/hooks/buy-toggle";
import { useFetchMarketData } from "@/hooks/data-fetch";

export const Hero = () => {
  const { marketType } = useMarketStore();
  const { data, loading, error } = useFetchMarketData(marketType);

  return (
    <div className="w-full min-h-screen">
      <Container className="relative z-20 text-gray-900 dark:text-gray-100">
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
