import React from "react";

const styles = {
  page: {
    position: "fixed", // covers the MainLayout (navbar/footer) so it looks full screen
    inset: 0,
    zIndex: 9999,
    backgroundColor: "#d92f24",
    color: "#ffffff",
    fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
    padding: "70px 26px 26px",
    overflow: "auto",
    boxSizing: "border-box",
  },
  title: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: "0 0 22px",
    fontSize: "24px",
    fontWeight: 400,
    lineHeight: 1.2,
  },
  icon: {
    fontSize: "22px",
    lineHeight: 1,
  },
  text: {
    maxWidth: "740px",
    margin: "0 0 14px",
    fontSize: "14.5px",
    lineHeight: "22px",
  },
};

const Blacklisted = ({ domain = "google-analysis.info" }) => {
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>
        <span style={styles.icon} aria-hidden="true">⚠</span>
        The domain has been blacklisted
      </h1>

      <p style={styles.text}>
        The domain <strong>{domain}</strong> has been identified as
        potentially unsafe by security monitoring systems.
      </p>

      <p style={styles.text}>
        Access to this website may expose visitors to security risks,
        including malicious software, phishing attempts, or unauthorized
        collection of personal information.
      </p>
    </div>
  );
};

export default Blacklisted;