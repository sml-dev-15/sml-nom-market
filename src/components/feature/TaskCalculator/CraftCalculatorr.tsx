import React from "react";
import { useFetchMarketData } from "@/hooks/data-fetch";
import { CraftingCostComparator } from "./BuildingCalculator";

export const CraftCalculator = () => {
  const { data } = useFetchMarketData("toBuy");

  const transformedData =
    data?.map((item) => ({
      tile: {
        url: item.visit,
        owner: item.owner,
      },
      object: {
        slug: item.slug,
        category: item.category,
        subCategory: item.subCategory,
        metadata: { title: item.name },
        imageUrl: item.image,
        thumbnailImageUrl: item.image,
      },
      pricing: {
        unitPrice: item.unitPrice,
        availableQuantity: item.availableQuantity,
      },
    })) ?? [];

  return (
    <div>
      <CraftingCostComparator marketData={transformedData} />
    </div>
  );
};
