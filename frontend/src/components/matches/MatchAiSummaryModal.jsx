import { useEffect, useState } from "react";
import { getMatchAiSummary } from "../../api/matches";
import { getApiErrorMessage } from "../../utils/apiError";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { Button } from "../ui/Button";

/**
 * @param {{
 *   matchId: string;
 *   matchTitle: string;
 *   open: boolean;
 *   onClose: () => void;
 * }} props
 */
export function MatchAiSummaryModal({ matchId, matchTitle, open, onClose }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !matchId) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, matchId, onClose]);

  useEffect(() => {
    if (!open || !matchId) return;
    let cancelled = false;
    setError("");
    setSummary("");
    setLoading(true);
    (async () => {
      try {
        const data = await getMatchAiSummary(matchId);
        if (!cancelled) setSummary(typeof data?.summary === "string" ? data.summary : "");
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, "Could not load AI match summary."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, matchId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-gray-900/40"
        aria-label="Close AI match summary"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-ai-summary-title"
        className="relative z-10 flex max-h-[min(90vh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2
              id="match-ai-summary-title"
              className="text-lg font-black tracking-tight text-gray-900 sm:text-xl"
            >
              AI match summary
            </h2>
            <p className="mt-1 truncate text-sm text-gray-600">{matchTitle}</p>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            aria-label="Close"
            onClick={onClose}
          >
            <span aria-hidden>×</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {loading ? (
            <div className="flex items-center gap-2 py-12 text-sm text-gray-600" role="status">
              <LoadingSpinner size="sm" />
              <span>Generating summary…</span>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              {error}
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{summary}</div>
          )}
        </div>

        <div className="shrink-0 border-t border-gray-100 px-5 py-3 sm:px-6">
          <p className="mb-3 text-xs text-gray-400">
            Generated from this fixture’s details and any recorded result and notes. May be incomplete if scores or
            notes are missing.
          </p>
          <Button type="button" variant="outline" size="sm" fullWidth onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
