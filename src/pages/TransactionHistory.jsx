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
      setData(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
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

  // Shared copy button used in both table and cards
  const CopyButton = ({ id }) => (
    <div className="relative inline-flex items-center">
      <button
        onClick={() => copyToClipboard(id)}
        className="text-[10px] border border-gray-300 px-2 py-0.5 rounded hover:bg-red-50 hover:border-[#800000] hover:text-[#800000] transition text-gray-500"
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
    <div className="min-h-screen bg-[#f4f4f7] w-full p-4 sm:p-6">

      <h2 className="text-lg sm:text-xl font-bold text-[#800000] mb-5">
        {t("transaction.transaction_history")}
      </h2>

      {/* ── MOBILE CARDS (< 700px) ── */}
      <div className="block lg:hidden space-y-3">
        {data.length > 0 ? (
          data.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow border border-gray-200 p-4"
            >
              {/* Top row: ID + copy + badge */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-800">
                    #{item.id}
                  </span>
                  <CopyButton id={item.id} />
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                    item.type === "PURCHASE" ? "bg-red-600" : "bg-blue-600"
                  }`}
                >
                  {item.type}
                </span>
              </div>

              {/* Amount */}
              <p className="text-xl font-bold text-[#800000] mt-2">
                €{item.amount}
              </p>

              {/* Notes + date */}
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                <p className="text-sm text-gray-600 font-semibold">
                  {item.notes}
                </p>
                <p className="text-xs text-gray-400">
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

      {/* ── DESKTOP TABLE (lg+ / 1024px+) ── */}
      {/* 
        Tablet fix: instead of a min-width table that forces horizontal scroll,
        we use table-fixed with percentage-based column widths so it always
        fits the container between 700–1100px without scrolling.
      */}
      <div className="hidden lg:block bg-white rounded-xl shadow border border-gray-200">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col className="w-[22%]" />  {/* ID + copy */}
            <col className="w-[14%]" />  {/* Amount */}
            <col className="w-[16%]" />  {/* Type */}
            <col className="w-[28%]" />  {/* Notes */}
            <col className="w-[20%]" />  {/* Date */}
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
                  className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-600"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.length > 0 ? (
              data.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`border-t border-gray-100 text-center ${
                    idx % 2 === 1 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  {/* ID cell with copy button */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-bold text-gray-800 truncate">
                        {item.id}
                      </span>
                      <CopyButton id={item.id} />
                    </div>
                  </td>

                  <td className="px-4 py-3 font-bold text-[#800000]">
                    €{item.amount}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${
                        item.type === "PURCHASE" ? "bg-red-600" : "bg-blue-600"
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-semibold text-gray-700 truncate">
                    {item.notes}
                  </td>

                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(item.createdAt).toLocaleString()}
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
        <div className="flex justify-center items-center gap-3 pt-5 flex-wrap">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {t("transaction.prev")}
          </button>

          <span className="text-sm font-medium text-gray-700">
            {t("transaction.page")} {page + 1} {t("transaction.of")}{" "}
            {computedTotalPages}
          </span>

          <button
            disabled={page + 1 === computedTotalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-1.5 text-sm border border-gray-800 rounded-md bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {t("transaction.next")}
          </button>
        </div>
      )}
    </div>
  );
}

export default TransitionHistory;