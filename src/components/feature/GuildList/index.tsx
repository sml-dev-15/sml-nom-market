import { useFetchMarketData } from "@/hooks/data-fetch";
import { GuildMarketListings } from "../GuildList/GuildMemberListings";

export const GuildList = () => {
  const { data: buyData } = useFetchMarketData("toBuy");
  const { data: sellData } = useFetchMarketData("toSell");

  const transformedData = [
    ...(buyData?.map((item) => ({
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
        name: item.name,
      },
      pricing: {
        unitPrice: item.unitPrice,
        availableQuantity: item.availableQuantity,
        totalPrice: item.unitPrice * item.availableQuantity,
      },
      type: "buy" as const,
    })) ?? []),
    ...(sellData?.map((item) => ({
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
        name: item.name,
      },
      pricing: {
        unitPrice: item.unitPrice,
        availableQuantity: item.availableQuantity,
        totalPrice: item.unitPrice * item.availableQuantity,
      },
      type: "sell" as const,
    })) ?? []),
  ];

  return (
    <div>
      <GuildMarketListings marketData={transformedData} />
    </div>
  );
};
