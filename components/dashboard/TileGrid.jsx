"use client";

import Image from "next/image";
import clsx from "clsx";

const TILE_BORDER_COLOR = "#0C2F66";
const TILE_COLORS = [
  { bg: "#FDE2E4", border: TILE_BORDER_COLOR },
  { bg: "#D3F8E2", border: TILE_BORDER_COLOR },
  { bg: "#FFF4BD", border: TILE_BORDER_COLOR },
  { bg: "#D0E6FF", border: TILE_BORDER_COLOR },
  { bg: "#F6D6FF", border: TILE_BORDER_COLOR },
  { bg: "#C2F5FF", border: TILE_BORDER_COLOR },
  { bg: "#FFE6CC", border: TILE_BORDER_COLOR },
  { bg: "#E2F2FF", border: TILE_BORDER_COLOR },
  { bg: "#F8D7E9", border: TILE_BORDER_COLOR },
  { bg: "#E1F5FE", border: TILE_BORDER_COLOR },
  { bg: "#F9E2C7", border: TILE_BORDER_COLOR },
  { bg: "#D7F9F1", border: TILE_BORDER_COLOR },
];

const TILE_COLOR_MAP = {
  "cash-flow": { bg: "#FADCC4" },
  "profit-loss": { bg: "#F49AC2" },
  "salary-summary": { bg: "#FFF4B8" },
  expenses: { bg: "#D8F3C6" },
  "trial-balance": { bg: "#B8F2F6" },
  "sales-cost-centerwise": { bg: "#F3C6DF" },
  "sales-vs-target": { bg: "#C4F38F" },
  "sales-vs-collection": { bg: "#EBD5B7" },
  "sales-brandwise": { bg: "#CCC9FF" },
  "delivered-not-invoiced": { bg: "#F7ABC6" },
  "invoice-receivables": { bg: "#FFE2C2" },
  collection: { bg: "#F6AECE" },
  "delayed-collection": { bg: "#7FE1E9" },
  "customer-balance": { bg: "#D1FAB3" },
  "customer-aging": { bg: "#FFF1C0" },
  "orders-at-loss": { bg: "#FBDDC7" },
  "credit-per-sales-unit": { bg: "#FCE697" },
  "pdc-analysis": { bg: "#E3B6EC" },
  "customer-overdue": { bg: "#D6F2FF" },
  "bank-balance": { bg: "#F6CBE0" },
  "stock-purchase": { bg: "#8FD8FF" },
  "non-stock-purchase": { bg: "#F6C7A6" },
  production: { bg: "#D9C5FF" },
  "return-orders": { bg: "#FEE1C8" },
  "payables-summary": { bg: "#D9F6DB" },
  "vendor-item-analysis": { bg: "#E9BBEC" },
  "item-vendor-analysis": { bg: "#F9E790" },
  "vendor-aging": { bg: "#57E2DD" },
  "vendor-overdue": { bg: "#F59FC7" },
  "vendor-analysis": { bg: "#7EE7D7" },
  maintenance: { bg: "#C5D4FF" },
  "fixed-assets": { bg: "#62E3F7" },
  opportunities: { bg: "#FBD7DE" },
  quotations: { bg: "#F6C4A4" },
  "follow-ups": { bg: "#A9C5FF" },
};

const FIRST_ROW_COUNT = 5;
const GRID_CLASSES =
  "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-6";
const FIRST_ROW_GRID_CLASSES =
  "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-5 sm:gap-6";

export default function TileGrid({ tiles, activeTileId, onSelectTile }) {
  const firstRowTiles = tiles.slice(0, FIRST_ROW_COUNT);
  const remainingTiles = tiles.slice(FIRST_ROW_COUNT);

  const getPalette = (tileId, index) => {
    const mapped = TILE_COLOR_MAP[tileId];
    if (mapped) {
      return {
        bg: mapped.bg,
        border: mapped.border ?? TILE_BORDER_COLOR,
      };
    }

    return TILE_COLORS[index % TILE_COLORS.length];
  };

  const renderTile = (tile, index) => {
    const palette = getPalette(tile.id, index);
    const isActive = activeTileId === tile.id;
    const neonShadow = `0 0 18px ${palette.border}, 0 0 35px ${palette.border}, 0 0 55px ${palette.bg}`;
    const neonGradient = `radial-gradient(circle at 30% 20%, ${palette.border}55, transparent 60%)`;

    return (
      <button
        type="button"
        key={tile.id}
        onClick={() => onSelectTile(tile.id)}
        className={clsx(
          "group relative isolation-auto flex h-full flex-col items-center rounded-2xl border-2 px-4 py-5 text-center shadow-sm",
          "transition-transform duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1C3D72]/40",
          isActive ? "scale-[1.02] shadow-lg" : "hover:-translate-y-0.5 hover:shadow-md"
        )}
        style={{
          backgroundColor: palette.bg,
          borderColor: palette.border,
        }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-2 -z-10 rounded-[2rem] opacity-0 blur-2xl transition duration-300 group-hover:opacity-90"
          style={{
            background: neonGradient,
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-1 rounded-[1.1rem] opacity-0 transition duration-300 group-hover:opacity-100"
          style={{
            boxShadow: neonShadow,
          }}
        />
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-4">
          <Image
            src={tile.icon}
            alt={tile.label}
            width={80}
            height={80}
            className="object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
          />
          <p className="text-sm font-semibold text-[#1C3D72] leading-tight">
            {tile.label}
          </p>
        </div>
      </button>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="space-y-10">
        {firstRowTiles.length > 0 && (
          <div className="rounded-[38px] border-[6px] border-[#1C3D72] bg-[#DFF7FF] p-4 shadow-xl shadow-[#1C3D72]/15">
            <div className={clsx(FIRST_ROW_GRID_CLASSES, "gap-4")}>
              {firstRowTiles.map(renderTile)}
            </div>
          </div>
        )}
        {remainingTiles.length > 0 && (
          <div className="rounded-[38px] border-[6px] border-[#1C3D72] bg-white/80 p-4 shadow-2xl shadow-[#1C3D72]/20">
            <div className={clsx(GRID_CLASSES, "gap-4")}>
              {remainingTiles.map((tile, idx) =>
                renderTile(tile, idx + firstRowTiles.length)
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
