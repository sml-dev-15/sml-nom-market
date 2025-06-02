"use client";

import { Container } from "@/components/ui/container";
import { DataTable } from "@/components/ui/data-table";
import { dataColumns } from "./components/Column";
import Link from "next/link";
import { useMarketStore } from "@/hooks/buy-toggle";
import { useFetchMarketData } from "@/hooks/data-fetch";

export const Hero = () => {
  const { marketType } = useMarketStore();
  const { data, loading, error } = useFetchMarketData(marketType);

  return (
    <div className="w-full min-h-screen">
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
