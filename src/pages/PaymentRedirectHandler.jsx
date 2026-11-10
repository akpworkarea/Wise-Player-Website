import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { downloadInvoicePdf } from "../auth/apiservice";
const PaymentRedirectHandler = () => {
  const location = useLocation();
  const [show, setShow] = useState(false);
  const [params, setParams] = useState(new URLSearchParams(location.search));

  useEffect(() => {
    const currentParams = new URLSearchParams(location.search);
    const status = currentParams.get("paymentStatus");

    // /payment-status renders its own full success screen — stacking this
    // black overlay on top of it left the buyer unable to read anything.
    if (status === "success" && !location.pathname.startsWith("/payment-status")) {
      setParams(currentParams);
      setShow(true);
    }
  }, [location]);

  if (!show) return null;

  const invoiceNo = params.get("invoiceNo");
  const deviceId = params.get("deviceId");
  const isCreditPurchase = location.pathname.includes("purchase-credit");

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.icon}>✅</div>
        <h3 style={styles.title}>Success!</h3>
        <p style={styles.text}>
          {isCreditPurchase 
            ? "Credits have been added to your account successfully." 
            : "Payment Successful!"}
        </p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          
          {invoiceNo && (
            <button
              style={styles.button}
              onClick={async () => {
                const res = await downloadInvoicePdf(deviceId, invoiceNo);
                if (res.success) {
                  const url = window.URL.createObjectURL(new Blob([res.data]));
                  const link = document.createElement("a");
                  link.href = url;
                  link.setAttribute("download", `invoice_${invoiceNo}.pdf`);
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                } else {
                  alert("Download failed. Please try from dashboard.");
                }
              }}
            >
              Download Invoice
            </button>
          )}

          {/* <button
            style={{ ...styles.button, background: "#374151" }}
            onClick={() => {
              setShow(false);
              navigate("/dashboard");
            }}
          >
            Go to Dashboard
          </button> */}

          <button
            style={{ ...styles.button, background: "#999", padding: "8px" }}
            onClick={() => setShow(false)}
          >
            Close
          </button>

        </div>
      </div>
    </div>
  );
};


const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10000,
    backdropFilter: "blur(4px)",
  },
  card: {
    background: "#fff",
    padding: "40px",
    borderRadius: "20px",
    textAlign: "center",
    width: "350px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  icon: {
    fontSize: "50px",
    marginBottom: "15px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#111827",
  },
  text: {
    fontSize: "16px",
    color: "#4b5563",
    marginBottom: "25px",
    lineHeight: "1.5",
  },
  button: {
    padding: "12px 20px",
    background: "#059669",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "background 0.2s",
  },
};

export default PaymentRedirectHandler;