import { cn } from "@/lib/utils";
import * as React from "react";

interface RowData {
  prop: React.ReactNode;
  type: React.ReactNode;
  description?: React.ReactNode;
  defaultValue: React.ReactNode;
}
interface Data {
  title: string[];
  description?: string;
  tableData: RowData[];
}
interface PropTableProps extends React.ComponentProps<"div"> {
  data: Data[];
}

const COLUMN_HEADERS = ["Props", "Type", "Description", "Default value"];

export function PropsTable({
  tableData,
  className,
  ...rest
}: { tableData: RowData[] } & React.ComponentProps<"table">) {
  return (
    <table
      className={cn(
        "border-border mb-10 border border-dashed text-left",
        className,
      )}
      {...rest}
    >
      <thead>
        <tr className="divide-border bg-muted divide-x divide-dashed">
          {COLUMN_HEADERS.map((eachColumnHeader, j) => (
            <th
              key={"column-" + (j + 1)}
              className="p-2 text-left font-medium capitalize"
            >
              {eachColumnHeader}
            </th>
          ))}
        </tr>
      </thead>
      <tbody
        className="border-border bg-layout divide-border divide-y divide-dashed border border-dashed font-normal"
        // brightness-105 dark:brightness-110 bg-background
      >
        {tableData.map((eachRowData, i) => (
          <tr
            key={"row-" + (i + 1)}
            className="divide-border divide-x divide-dashed"
          >
            {Object.values(eachRowData).map((eachItem, j) => (
              <td
                key={`table[${i}][${j}] `}
                className={cn(
                  "p-2 [&_pre]:!bg-[inherit]",
                  j == 2 && "w-full min-w-lg",
                )}
              >
                <>{eachItem}</>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
export type { RowData, PropTableProps };
