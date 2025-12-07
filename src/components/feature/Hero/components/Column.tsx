"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatGold, formatNumber } from "@/lib/format";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ExternalLink, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export type DataProps = {
  action: string;
  name: string;
  category: string;
  subCategory: string;
  unitPrice: number;
  availableQuantity: number;
  owner: string;
  image: string;
  visit: string;
  slug: string;
};

export const dataColumns = (marketType: string): ColumnDef<DataProps>[] => [
  {
    accessorKey: "url",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Visit
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const { visit } = row.original;
      return (
        <Link href={visit} target="_blank">
          <div className="flex items-center gap-2">
            <ExternalLink className="size-4" />
            <p> {marketType === "toBuy" ? "Buy" : "Sell"}</p>
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const { name, image } = row.original;
      return (
        <div className="lowercase flex items-center gap-2">
          <Avatar>
            <AvatarImage src={image} />
            <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          {name}
        </div>
      );
    },
  },

  {
    accessorKey: "unitPrice",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Unit Price
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Image src="/assets/gold.png" alt="Gold" width={16} height={16} />
        {formatGold(row.getValue("unitPrice"))}
      </div>
    ),
  },
  {
    accessorKey: "availableQuantity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Quantity
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div>{formatNumber(row.getValue("availableQuantity"))}</div>
    ),
  },
  {
    accessorKey: "category",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Category
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="lowercase">{row.getValue("category")}</div>;
    },
  },
  {
    accessorKey: "subCategory",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Sub Category
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("subCategory")}</div>
    ),
  },
  {
    accessorKey: "owner",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {marketType === "toBuy" ? "Seller" : "Buyer"}
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const owner = row.getValue("owner") as string;
      const profileUrl = `/profile/${encodeURIComponent(owner)}`;
      return (
        <Link
          href={profileUrl}
          className="flex items-center gap-2 hover:text-primary transition-colors"
          prefetch={true}
        >
          <User className="size-4" />
          <span>{owner}</span>
        </Link>
      );
    },
  },
];
