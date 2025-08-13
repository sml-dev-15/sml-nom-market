import {
  type TableOptions,
  type ColumnDef,
  type Row,
} from '@tanstack/react-table';
import { type FC } from 'react';
import { type Except } from 'type-fest';

export type DataTableProps<TData, TValue> = Except<
  TableOptions<TData>,
  'getCoreRowModel'
> & {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  SubComponents?: FC<{ row: Row<TData> }>;
  SubComponentHeader?: FC<{ row: Row<TData> }>;
};
