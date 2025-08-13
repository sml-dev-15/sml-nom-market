"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ExternalLink } from "lucide-react";
import Link from "next/link";
import DeleteLandDialog from "./DeleteLandDialog";
import type { Land } from "@/types/land";
import { TimerCell } from "./TimerCell";

export const createColumns = (
  onDelete: (id: string) => Promise<void>,
  onDeleteTimer: (timerId: string) => Promise<void>
): ColumnDef<Land>[] => [
  {
    accessorKey: "owner",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const { owner, link } = row.original;
      return (
        <div className="flex items-center gap-2">
          {link ? (
            <Link
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:underline"
            >
              {owner}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          ) : (
            <span>{owner}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "industry",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Industry
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const industries = row.original.industry;
      return (
        <div>
          {industries?.map((industry, index) => (
            <div key={`${industry.name}-${index}`} className="capitalize">
              <p className="text-xs">
                {industry.name} ({industry.quantity})
              </p>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "timers",
    header: "Timers",
    cell: ({ row }) => {
      const timers = row.original.timers || [];
      return <TimerCell timers={timers} onDeleteTimer={onDeleteTimer} />;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const land = row.original;
      return <DeleteLandDialog land={land} onDelete={onDelete} />;
    },
  },
];
