import React, { useEffect, useState } from "react";
import { TransitionHistoryData } from "../auth/transitionHistory";
import { useAuth } from "../context/AuthContext";
import { subResellerTransactionHistory } from "../auth/subReseller/transitionHistory";
import { useRefresh } from "../context/RefreshContext";
import { useTranslation } from "react-i18next";

function TransitionHistory() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [copiedId, setCopiedId] = useState(null);
  const { t } = useTranslation();
  const { userRole } = useAuth();
  const { refreshTransactions } = useRefresh();

  const fetchData = async (pageNo = 0) => {
    try {
      let res;
      if (userRole === "SUB_RESELLER") {
        res = await subResellerTransactionHistory(pageNo);
      } else {
        res = await TransitionHistoryData(pageNo);
      }
      if (!res?.success) return;

      const incoming = res.data.content || [];
      setTotalPages(res.data.totalPages || 0);

      setData((prev) => {
        if (prev.length === 0) return incoming;
        const freshMap = {};
        incoming.forEach((r) => { freshMap[r.id] = r; });
        const merged = prev.map((r) =>
          freshMap[r.id] ? { ...r, ...freshMap[r.id] } : r
        );
        const existingIds = new Set(prev.map((r) => r.id));
        incoming.forEach((r) => {
          if (!existingIds.has(r.id)) merged.push(r);
        });
        return merged;
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setData([]);
    fetchData(page);
  }, [page, refreshTransactions]);

  const copyToClipboard = (id) => {
    navigator.clipboard.writeText(String(id));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const itemsPerPage = 10;
  const computedTotalPages =
    totalPages > 0
      ? totalPages
      : Math.ceil((data?.length || 0) / itemsPerPage);
  const showPagination = computedTotalPages > 1;

  const typeBadgeClass = (type) => {
    if (type === "PURCHASE")  return "bg-red-600";
    if (type === "DEDUCTION") return "bg-orange-500";
    return "bg-blue-600";
  };

  const CopyButton = ({ id }) => (
    <div className="relative inline-flex items-center shrink-0">
      <button
        onClick={() => copyToClipboard(id)}
        className="text-[10px] border border-gray-300 px-2 py-0.5 rounded hover:bg-red-50 hover:border-[#800000] hover:text-[#800000] transition text-gray-500 whitespace-nowrap"
      >
        {copiedId === id ? t("admin_dashboard.copied") : t("admin_dashboard.copy")}
      </button>
      {copiedId === id && (
        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap z-10">
          {t("admin_dashboard.copied")}
        </span>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f4f7] w-full p-4 sm:p-6 space-y-5">

      <h2 className="text-lg sm:text-xl font-bold text-[#800000]">
        {t("transaction.transaction_history")}
      </h2>

      {/* ════════════════════════════════════════════
          MOBILE CARDS  (< 768px)
          - Card has overflow-hidden — nothing escapes
          - Row 1: ID + copy on own line (flex-nowrap + min-w-0)
          - Row 2: type badge + amount
          - All text has truncate + w-full
      ════════════════════════════════════════════ */}
      <div className="md:hidden space-y-3">
        {data.length > 0 ? (
          data.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow border border-gray-200 p-4 overflow-hidden"
            >
              {/* Row 1: ID + copy — own full row, nothing competing */}
              <div className="flex items-center gap-2 flex-nowrap min-w-0 mb-2">
                <span
                  className="text-sm font-bold text-[#800000] truncate min-w-0 max-w-[160px]"
                  title={String(item.id)}
                >
                  #{item.id}
                </span>
                <CopyButton id={item.id} />
              </div>

              {/* Row 2: type badge + amount */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className={`inline-block min-w-[96px] text-center px-2 py-1 rounded-full text-xs font-bold text-white shrink-0 ${typeBadgeClass(item.type)}`}
                >
                  {item.type}
                </span>
                <p className="text-xl font-bold text-[#800000] shrink-0">
                  €{item.amount}
                </p>
              </div>

              {/* Row 3: notes + date */}
              <div className="pt-3 border-t border-gray-100 space-y-1">
                <p className="text-sm text-gray-600 font-semibold truncate w-full">
                  {item.notes}
                </p>
                <p className="text-xs text-gray-400 truncate w-full">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 font-semibold py-10">
            {t("transaction.no_data_found")}
          </p>
        )}
      </div>

      {/* ════════════════════════════════════════════
          TABLET + DESKTOP TABLE  (md+ / 768px+)

          Type col = 24%, Notes = 22%
          Badge uses min-w-[96px] for uniform size
          px-2 md:px-3 reduces padding at tablet sizes
          ID cell: flex-nowrap + min-w-0 on both
                   container and span — copy never wraps
      ════════════════════════════════════════════ */}
      <div className="hidden md:block bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col style={{ width: "20%" }} /> {/* ID + copy */}
            <col style={{ width: "12%" }} /> {/* Amount    */}
            <col style={{ width: "24%" }} /> {/* Type      */}
            <col style={{ width: "22%" }} /> {/* Notes     */}
            <col style={{ width: "22%" }} /> {/* Date      */}
          </colgroup>

          <thead className="bg-gray-100">
            <tr>
              {[
                t("transaction.id"),
                t("transaction.amount"),
                t("transaction.type"),
                t("transaction.notes"),
                t("transaction.date"),
              ].map((col) => (
                <th
                  key={col}
                  className="px-2 md:px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-600"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {data.length > 0 ? (
              data.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`text-center transition-colors duration-150 hover:bg-red-50/30 ${
                    idx % 2 === 1 ? "bg-gray-50/60" : "bg-white"
                  }`}
                >
                  {/* ID + copy — min-w-0 on both so ID truncates before
                      pushing the copy button out of the column */}
                  <td className="px-2 md:px-3 py-3.5">
                    <div className="flex items-center justify-center gap-1.5 flex-nowrap min-w-0">
                      <span
                        className="font-bold text-[#800000] truncate min-w-0"
                        title={String(item.id)}
                      >
                        {item.id}
                      </span>
                      <CopyButton id={item.id} />
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="px-2 md:px-3 py-3.5 font-black text-[#800000]">
                    €{item.amount}
                  </td>

                  {/* Type — min-w-[96px] gives all badges same minimum width */}
                  <td className="px-2 md:px-3 py-3.5">
                    <span
                      className={`inline-block min-w-[96px] text-center px-2 py-1 rounded-full text-xs font-bold text-white ${typeBadgeClass(item.type)}`}
                    >
                      {item.type}
                    </span>
                  </td>

                  {/* Notes — block + truncate, clips within column */}
                  <td className="px-2 md:px-3 py-3.5 text-left">
                    <span className="block font-semibold text-gray-700 truncate w-full">
                      {item.notes}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-2 md:px-3 py-3.5 text-xs text-gray-500">
                    <span className="block truncate w-full">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="py-10 text-center text-gray-400 font-semibold"
                >
                  {t("transaction.no_data_found")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── PAGINATION ── */}
      {showPagination && (
        <div className="flex justify-center items-center gap-3 pt-2 flex-wrap">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="text-xs border border-gray-300 px-3 py-1.5 rounded-md bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {t("transaction.prev")}
          </button>

          <span className="text-sm font-semibold text-gray-700">
            {t("transaction.page")} {page + 1} {t("transaction.of")}{" "}
            {computedTotalPages}
          </span>

          <button
            disabled={page + 1 === computedTotalPages}
            onClick={() => setPage((p) => p + 1)}
            className="text-xs border border-gray-300 px-3 py-1.5 rounded-md bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {t("transaction.next")}
          </button>
        </div>
      )}
    </div>
  );
}

export default TransitionHistory;