"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FilterIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FormSchema = z.object({
  type: z.enum(["toBuy", "toSell"]),
  category: z.string(),
  subCategory: z.string(),
});

type FilterValues = z.infer<typeof FormSchema>;

const categories = [
  { label: "All", value: "any" },
  { label: "Items", value: "items" },
  { label: "Recipes", value: "recipes" },
  { label: "Object", value: "object" },
];

const subcategoryOptions: Record<string, { label: string; value: string }[]> = {
  items: [
    { label: "All", value: "any" },
    { label: "Resources", value: "resources" },
    { label: "Seeds", value: "seeds" },
    { label: "Ingredients", value: "ingredients" },
    { label: "Food", value: "food" },
    { label: "Tools", value: "tools" },
    { label: "Gems", value: "gems" },
  ],
  recipes: [
    { label: "All", value: "any" },
    { label: "Decoration", value: "decoration" },
    { label: "Resources", value: "resources" },
    { label: "Tools", value: "tools" },
    { label: "Paths", value: "paths" },
    { label: "Farm Tools", value: "farm_tools" },
    { label: "Gems", value: "gems" },
  ],
  object: [
    { label: "All", value: "any" },
    { label: "Paths", value: "paths" },
    { label: "Farm Tools", value: "farm_tools" },
    { label: "Tools", value: "tools" },
    { label: "Decoration", value: "decoration" },
  ],
};

export const FilterSheet = ({
  onFilterChange,
}: {
  onFilterChange: (values: FilterValues) => void;
}) => {
  const form = useForm<FilterValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      type: "toBuy",
      category: "any",
      subCategory: "any",
    },
  });

  const selectedCategory = form.watch("category") || "any";
  const allSubcategories = Array.from(
    new Map(
      Object.values(subcategoryOptions)
        .flat()
        .map((item) => [item.value, item])
    ).values()
  );

  const availableSubcategories =
    selectedCategory === "any"
      ? allSubcategories
      : subcategoryOptions[selectedCategory] || [];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <FilterIcon />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter</SheetTitle>
          <SheetDescription>Filter your results</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => {
              onFilterChange(data);
              toast.success(
                `Filtered: ${data.type} → ${data.category} → ${data.subCategory}`
              );
            })}
          >
            <div className="flex flex-col gap-5 p-5">
              {/* Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col"
                      >
                        <FormItem className="flex items-center gap-3">
                          <FormControl>
                            <RadioGroupItem value="toBuy" />
                          </FormControl>
                          <FormLabel className="font-normal">Buy</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center gap-3">
                          <FormControl>
                            <RadioGroupItem value="toSell" />
                          </FormControl>
                          <FormLabel className="font-normal">Sell</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sub Category */}
              <FormField
                control={form.control}
                name="subCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subcategory" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableSubcategories.map((sub) => (
                          <SelectItem key={sub.value} value={sub.value}>
                            {sub.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Footer */}
            <SheetFooter>
              <div className="grid grid-cols-2 gap-2 w-full px-5 pb-5">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    form.reset();
                    onFilterChange({
                      type: "toBuy",
                      category: "any",
                      subCategory: "any",
                    });
                    toast.info("Filters reset.");
                  }}
                >
                  Reset
                </Button>
                <Button type="submit">Apply</Button>
              </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
