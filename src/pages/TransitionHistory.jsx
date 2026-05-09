import React, { useEffect, useState } from "react";
import { TransitionHistoryData } from "../auth/transitionHistory";



function TransitionHistory() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchData = async (pageNo = 0) => {
    try {
      const res = await TransitionHistoryData(pageNo);
      setData(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title} className="text-gray-700">Transaction History</h2>

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadRow}>
              <th>ID</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Notes</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {data.length > 0 ? (
              data.map((item) => (
                <tr key={item.id} style={styles.row} className="py-2 text-sm">
                  <td style={styles.cellId} className="py-3">{item.id}</td>

                  <td style={styles.amount}>
                    €{item.amount}
                  </td>

                  <td>
                    <span
                      style={{
                        ...styles.badge,
                        background:
                          item.type === "PURCHASE"
                            ? "#dc2626"
                            : "#6b7280",
                      }}
                    >
                      {item.type}
                    </span>
                  </td>

                  <td style={styles.notes}>{item.notes}</td>

                  <td style={styles.date}>
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={styles.empty}>
                  No Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div style={styles.pagination}>
        <button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          style={styles.btn}
          className="bg-gray-500"
        >
          ⬅ Prev
        </button>

        <span style={styles.pageText} className="text-red-500 font-semibold">
          Page {page + 1} of {totalPages}
        </span>

        <button
          disabled={page + 1 === totalPages}
          onClick={() => setPage(page + 1)}
          style={styles.btn}
           className="bg-gray-500"
        >
          Next ➡
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "24px",
   
    minHeight: "100vh",
   
  },

  title: {
    marginBottom: "20px",
    fontSize: "22px",
    fontWeight: "600",
  },

  card: {
   
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  theadRow: {
    textAlign: "left",
    borderBottom: "1px solid #374151",
    color: "#9ca3af",
    padding:"12px 10px"
  },

  row: {
    borderBottom: "1px solid #374151",
     padding:"10px 10px"
  },

  cellId: {
    fontSize: "18px",
    color: "#9ca3af",
  },

  amount: {
    fontWeight: "600",
    color: "#ef4444", // red
  },

  badge: {
    padding: "4px 10px",
    borderRadius: "999px",
    color: "#fff",
    fontSize: "12px",
  },

  notes: {
    color: "#d1d5db",
  },

  date: {
    fontSize: "12px",
    color: "#9ca3af",
  },

  empty: {
    textAlign: "center",
    padding: "20px",
    color: "#9ca3af",
  },

  pagination: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  btn: {
    padding: "8px 16px",
    // background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

 
};

export default TransitionHistory;