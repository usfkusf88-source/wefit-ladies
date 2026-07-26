"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Search, Download, SlidersHorizontal, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import type { Lead, Campaign, Profile } from "@/lib/database.types";
import { StatusBadge } from "@/components/ui/Badge";
import { LEAD_STATUSES, MEMBERSHIPS, LEAD_SOURCES, labelOf } from "@/lib/constants";
import { formatDate, formatPhone, cn } from "@/lib/utils";
import { exportLeadsCsv } from "@/lib/export";

export function LeadsTable({
  leads,
  campaigns,
  profiles,
}: {
  leads: Lead[];
  campaigns: Campaign[];
  profiles: Profile[];
  role: string;
}) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [f, setF] = useState({
    status: "",
    membership: "",
    source: "",
    campaign: "",
    district: "",
    assigned: "",
  });

  const profileName = useMemo(() => {
    const m = new Map(profiles.map((p) => [p.id, p.full_name ?? p.email]));
    return (id: string | null) => (id ? m.get(id) ?? "—" : "—");
  }, [profiles]);
  const campaignName = useMemo(() => {
    const m = new Map(campaigns.map((c) => [c.id, c.name]));
    return (id: string | null) => (id ? m.get(id) ?? "—" : "—");
  }, [campaigns]);

  const districts = useMemo(
    () => [...new Set(leads.map((l) => l.district).filter(Boolean))] as string[],
    [leads]
  );

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (f.status && l.status !== f.status) return false;
      if (f.membership && l.membership !== f.membership) return false;
      if (f.source && l.source !== f.source) return false;
      if (f.campaign && l.campaign_id !== f.campaign) return false;
      if (f.district && l.district !== f.district) return false;
      if (f.assigned && l.assigned_to !== f.assigned) return false;
      return true;
    });
  }, [leads, f]);

  const columns = useMemo<ColumnDef<Lead>[]>(
    () => [
      {
        header: "الاسم",
        accessorKey: "full_name",
        cell: ({ row }) => (
          <Link
            href={`/admin/leads/${row.original.id}`}
            className="font-semibold text-ink hover:text-pink-brand"
          >
            {row.original.full_name}
          </Link>
        ),
      },
      {
        header: "الجوال",
        accessorKey: "phone",
        cell: ({ getValue }) => (
          <span dir="ltr" className="text-zinc-600">
            {formatPhone(String(getValue()))}
          </span>
        ),
      },
      { header: "الحي", accessorKey: "district", cell: ({ getValue }) => (getValue() as string) || "—" },
      {
        header: "العضوية",
        accessorKey: "membership",
        cell: ({ getValue }) => labelOf(MEMBERSHIPS, getValue() as string) || "—",
      },
      {
        header: "المصدر",
        accessorKey: "source",
        cell: ({ getValue }) => labelOf(LEAD_SOURCES, getValue() as string) || "—",
      },
      { header: "الحملة", accessorFn: (r) => campaignName(r.campaign_id), id: "campaign" },
      {
        header: "الحالة",
        accessorKey: "status",
        cell: ({ getValue }) => <StatusBadge status={String(getValue())} />,
      },
      { header: "المسؤولة", accessorFn: (r) => profileName(r.assigned_to), id: "assigned" },
      {
        header: "التاريخ",
        accessorKey: "created_at",
        cell: ({ getValue }) => (
          <span className="text-zinc-400">{formatDate(getValue() as string)}</span>
        ),
      },
      {
        header: "",
        id: "actions",
        cell: ({ row }) => (
          <Link href={`/admin/leads/${row.original.id}`} aria-label="فتح" className="text-zinc-400 hover:text-pink-brand">
            <ExternalLink className="h-4 w-4" />
          </Link>
        ),
      },
    ],
    [campaignName, profileName]
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    globalFilterFn: (row, _col, value) => {
      const v = String(value).toLowerCase().trim();
      if (!v) return true;
      const l = row.original;
      return [l.full_name, l.phone, l.email ?? ""].some((s) => s.toLowerCase().includes(v));
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

  const selects = [
    { key: "status", label: "الحالة", opts: LEAD_STATUSES.map((s) => ({ v: s.value, l: s.ar })) },
    { key: "membership", label: "العضوية", opts: MEMBERSHIPS.map((s) => ({ v: s.value, l: s.ar })) },
    { key: "source", label: "المصدر", opts: LEAD_SOURCES.map((s) => ({ v: s.value, l: s.ar })) },
    { key: "campaign", label: "الحملة", opts: campaigns.map((c) => ({ v: c.id, l: c.name })) },
    { key: "district", label: "الحي", opts: districts.map((d) => ({ v: d, l: d })) },
    {
      key: "assigned",
      label: "المسؤولة",
      opts: profiles.map((p) => ({ v: p.id, l: p.full_name ?? p.email })),
    },
  ] as const;

  return (
    <div className="card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-gray-line p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="بحث بالاسم أو الجوال أو البريد"
            className="w-full rounded-xl border border-gray-line py-2.5 pr-10 pl-3 text-sm focus:border-pink-brand focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters((s) => !s)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium",
              showFilters ? "border-pink-brand text-pink-brand" : "border-gray-line text-zinc-600"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" /> فلاتر
          </button>
          <button
            onClick={() => exportLeadsCsv(filtered, { campaignName, profileName })}
            className="btn-dark px-3 py-2.5"
          >
            <Download className="h-4 w-4" /> تصدير CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="grid grid-cols-2 gap-3 border-b border-gray-line bg-gray-soft/60 p-4 sm:grid-cols-3 lg:grid-cols-6">
          {selects.map((s) => (
            <div key={s.key}>
              <label className="mb-1 block text-xs font-medium text-zinc-500">{s.label}</label>
              <select
                value={f[s.key as keyof typeof f]}
                onChange={(e) => setF((prev) => ({ ...prev, [s.key]: e.target.value }))}
                className="w-full rounded-lg border border-gray-line bg-white px-2 py-2 text-sm focus:border-pink-brand focus:outline-none"
              >
                <option value="">الكل</option>
                {s.opts.map((o) => (
                  <option key={o.v} value={o.v}>
                    {o.l}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead className="bg-gray-soft text-right text-xs text-zinc-500">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={cn(
                      "whitespace-nowrap px-4 py-3 font-semibold",
                      header.column.getCanSort() && "cursor-pointer select-none hover:text-ink"
                    )}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{ asc: " ↑", desc: " ↓" }[header.column.getIsSorted() as string] ?? ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-line">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-soft/50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="whitespace-nowrap px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-zinc-400">
                  لا توجد نتائج مطابقة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-line p-4 text-sm">
        <span className="text-zinc-500">
          صفحة {table.getState().pagination.pageIndex + 1} من {table.getPageCount() || 1}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-line px-3 py-1.5 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" /> السابق
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-line px-3 py-1.5 disabled:opacity-40"
          >
            التالي <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
