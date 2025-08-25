"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "./input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { useMarketStore } from "@/hooks/buy-toggle";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterColumn?: string;
}

const categoryOptions = [
  { label: "All", value: "any" },
  { label: "Items", value: "items" },
  { label: "Recipes", value: "recipes" },
  { label: "Object", value: "object" },
];

const subCategoryMap: Record<string, { label: string; value: string }[]> = {
  items: [
    { label: "Resources", value: "resources" },
    { label: "Seeds", value: "seeds" },
    { label: "Ingredients", value: "ingredients" },
    { label: "Food", value: "food" },
    { label: "Tools", value: "tools" },
    { label: "Gems", value: "gems" },
  ],
  recipes: [
    { label: "Decoration", value: "decoration" },
    { label: "Resources", value: "resources" },
    { label: "Tools", value: "tools" },
    { label: "Paths", value: "paths" },
    { label: "Farm Tools", value: "farm_tools" },
    { label: "Gems", value: "gems" },
  ],
  object: [
    { label: "Paths", value: "paths" },
    { label: "Farm Tools", value: "farm_tools" },
    { label: "Tools", value: "tools" },
    { label: "Decoration", value: "decoration" },
  ],
};

export function DataTable<TData, TValue>({
  columns,
  data,
  filterColumn,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const { marketType, setMarketType } = useMarketStore();
  const [selectedCategory, setSelectedCategory] = React.useState("any");

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const filterable = filterColumn && table.getColumn(filterColumn);
  const categoryColumn = table.getColumn("category");
  const subCategoryColumn = table.getColumn("subCategory");

  const subCategoryOptions =
    selectedCategory !== "any" ? subCategoryMap[selectedCategory] ?? [] : [];

  return (
    <div className="w-full">
      <div className="py-4 grid lg:flex gap-2">
        {filterable && (
          <Input
            placeholder={`Filter by ${filterColumn}...`}
            value={(filterable.getFilterValue() as string) ?? ""}
            onChange={(event) => filterable.setFilterValue(event.target.value)}
            className="w-full min-w-[100px] lg:w-fit "
          />
        )}
        <div className="grid grid-cols-2 lg:flex gap-2 w-full lg:w-fit">
          {categoryColumn && (
            <Select
              value={(categoryColumn.getFilterValue() as string) ?? "any"}
              onValueChange={(value) => {
                setSelectedCategory(value);
                categoryColumn.setFilterValue(
                  value === "any" ? undefined : value
                );
                subCategoryColumn?.setFilterValue(undefined);
              }}
            >
              <SelectTrigger className=" w-full min-w-[100px] lg:w-fit ">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {subCategoryColumn && selectedCategory !== "any" ? (
            <Select
              value={(subCategoryColumn.getFilterValue() as string) ?? "any"}
              onValueChange={(value) =>
                subCategoryColumn.setFilterValue(
                  value === "any" ? undefined : value
                )
              }
            >
              <SelectTrigger className="w-full min-w-[100px] lg:w-fit ">
                <SelectValue placeholder="Select a subcategory" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">All</SelectItem>
                {subCategoryOptions.map((sub) => (
                  <SelectItem key={sub.value} value={sub.value}>
                    {sub.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Select>
              <SelectTrigger
                disabled
                className="w-full min-w-[100px] lg:w-fit "
              >
                <SelectValue placeholder="Select a category first" />
              </SelectTrigger>
            </Select>
          )}
        </div>
        <div className="grid grid-cols-2 lg:flex gap-2 w-full lg:w-fit">
          <Select
            value={marketType}
            onValueChange={(val) => setMarketType(val as "toBuy" | "toSell")}
          >
            <SelectTrigger className="w-full min-w-[100px] lg:w-fit ">
              <SelectValue placeholder="Market Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="toBuy">To Buy</SelectItem>
              <SelectItem value="toSell">To Sell</SelectItem>
            </SelectContent>
          </Select>
          <div className="w-full min-w-[100px] lg:w-fit  md:min-w-unset">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full bg-transparent hover:bg-transparent"
                >
                  Columns <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((col) => col.getCanHide())
                  .map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      className="capitalize"
                      checked={col.getIsVisible()}
                      onCheckedChange={(val) => col.toggleVisibility(!!val)}
                    >
                      {col.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="max-h-[300px] md:max-h-[550px] overflow-y-auto w-full">
        <Table>
          <TableHeader className="">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="border-b border-gray-300"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b border-gray-180"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-5">
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 30, 50, 100].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
