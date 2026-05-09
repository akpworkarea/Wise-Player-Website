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
  const { t } = useTranslation()

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

  // ✅ REAL FIX (no fake 1)
  const itemsPerPage = 10;

  const computedTotalPages =
    totalPages > 0
      ? totalPages
      : Math.ceil((data?.length || 0) / itemsPerPage);

  const showPagination = computedTotalPages > 1;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{t("transaction.transaction_history")}</h2>

      <div style={styles.card}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>{t("transaction.id")}</th>
                <th style={styles.th}>{t("transaction.amount")}</th>
                <th style={styles.th}>{t("transaction.type")}</th>
                <th style={styles.th}>{t("transaction.notes")}</th>
                <th style={styles.th}>{t("transaction.date")}</th>
              </tr>
            </thead>

            <tbody>
              {data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.id} style={styles.row}>
                    <td style={styles.tdId}>{item.id}</td>

                    <td style={styles.tdAmount}>
                      €{item.amount}
                    </td>

                    <td style={styles.tdCenter}>
                      <span
                        style={{
                          ...styles.badge,
                          background:
                            item.type === "PURCHASE"
                              ? "#dc2626"
                              : "#2563eb",
                        }}
                      >
                        {item.type}
                      </span>
                    </td>

                    <td style={styles.td}>{item.notes}</td>

                    <td style={styles.tdDate}>
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={styles.empty}>
                    {t("transaction.no_data_found")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showPagination && (
        <div className="d-flex justify-content-center align-items-center gap-3 p-3 flex-wrap">

          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="btn btn-sm btn-outline-dark"
          >
            {t("transaction.prev")}
          </button>

          <span style={{ fontWeight: "500" }}>
            {t("transaction.page")} {page + 1} {t("transaction.of")} {computedTotalPages}
          </span>

          <button
            disabled={page + 1 === computedTotalPages}
            onClick={() => setPage((p) => p + 1)}
            className="btn btn-sm btn-outline-dark"
          >
            {t("transaction.next")}
          </button>

        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "24px",
    minHeight: "100vh",
    background: "#f9fafb",
  },
  title: {
    marginBottom: "20px",
    fontSize: "22px",
    fontWeight: "700",
    color: "#1f2937",
  },
  card: {
    borderRadius: "16px",
    padding: "12px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
    background: "#ffffff",
  },
  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "700px",
  },
  th: {
    textAlign: "center",
    padding: "14px",
    fontSize: "13px",
    fontWeight: "700",
    color: "#ffffff",
    background: "#374151",
  },
  row: {
    borderBottom: "1px solid #f1f5f9",
  },
  td: {
    padding: "14px",
    fontWeight: "600",
    textAlign: "center",
  },
  tdId: {
    padding: "14px",
    fontWeight: "700",
    textAlign: "center",
  },
  tdAmount: {
    padding: "14px",
    fontWeight: "700",
    color: "#dc2626",
    textAlign: "center",
  },
  tdCenter: {
    padding: "14px",
    textAlign: "center",
  },
  tdDate: {
    padding: "14px",
    fontSize: "13px",
    textAlign: "center",
  },
  badge: {
    padding: "6px 14px",
    borderRadius: "999px",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "700",
  },
  empty: {
    textAlign: "center",
    padding: "30px",
    color: "#9ca3af",
    fontWeight: "600",
  },
};

export default TransitionHistory;