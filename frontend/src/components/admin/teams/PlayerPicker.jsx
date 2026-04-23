import { useMemo, useState } from "react";
import { cn } from "../../../utils/cn";

function playerLabel(p) {
  const name = p.fullName || "Unnamed Player";
  const sid = p.studentId ? ` · ${p.studentId}` : "";
  return `${name}${sid}`;
}

/**
 * Multi-select existing players (by id).
 */
export function PlayerPicker({
  players,
  selectedIds,
  onChange,
  disabled,
  showSearch = false,
  searchPlaceholder = "Search players...",
  isOptionDisabled,
  getOptionHint,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const selectedSet = new Set(selectedIds.map(String));

  const filteredPlayers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return players;
    return players.filter((p) => {
      const haystack = [p.fullName, p.studentId, p.email].join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [players, searchQuery]);

  const toggle = (id) => {
    const next = new Set(selectedSet);
    const sid = String(id);
    if (next.has(sid)) next.delete(sid);
    else next.add(sid);
    onChange([...next]);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {showSearch ? (
        <div className="border-b border-gray-100 p-2.5">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      ) : null}
      <div className="max-h-56 overflow-y-auto p-2">
        {filteredPlayers.length === 0 ? (
          <p className="px-2 py-3 text-sm text-gray-500">
            {players.length === 0 ? "No players in the system yet. Create players first." : "No players match your search."}
          </p>
        ) : (
          <ul className="space-y-1">
            {filteredPlayers.map((p) => {
              const id = String(p._id);
              const checked = selectedSet.has(id);
              const disabledReason = typeof isOptionDisabled === "function" ? isOptionDisabled(p) : "";
              const optionHint = typeof getOptionHint === "function" ? getOptionHint(p) : "";
              const lockSelection = Boolean(disabledReason) && !checked;
              const inputDisabled = Boolean(disabled) || lockSelection;
              return (
                <li key={id}>
                  <label
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-gray-50",
                      inputDisabled && "cursor-not-allowed opacity-60"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={checked}
                      disabled={inputDisabled}
                      onChange={() => toggle(id)}
                    />
                    <span className="min-w-0 flex-1 text-sm">
                      <span className="font-semibold text-gray-900">{playerLabel(p)}</span>
                      {p.email ? <span className="block text-xs text-gray-500">{p.email}</span> : null}
                      {disabledReason ? <span className="block text-xs font-semibold text-amber-700">{disabledReason}</span> : null}
                      {!disabledReason && optionHint ? <span className="block text-xs font-semibold text-amber-700">{optionHint}</span> : null}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
