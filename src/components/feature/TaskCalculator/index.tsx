import React from "react";
import { TaskComparison } from "./NewTaskCalculator";
import { useFetchMarketData } from "@/hooks/data-fetch";

export const TaskCalculator = () => {
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
      <TaskComparison marketData={transformedData} />
    </div>
  );
};
