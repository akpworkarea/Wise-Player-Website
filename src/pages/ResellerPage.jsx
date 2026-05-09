// import React from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import { motion } from 'framer-motion'; // Animation ke liye
// import { useNavigate } from 'react-router-dom';
// const ResellerPage = () => {
//     // Red Theme Colors
//     const navigate = useNavigate();
//     const primaryRed = "#e63946";
//     const darkGray = "#343a40";

//     // Animation Variants
//     const fadeInUp = {
//         hidden: { opacity: 0, y: 30 },
//         visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
//     };

//     const staggerContainer = {
//         hidden: { opacity: 0 },
//         visible: {
//             opacity: 1,
//             transition: {
//                 staggerChildren: 0.2
//             }
//         }
//     };

//     const featureCardStyle = {
//         border: '1px solid #eee',
//         borderRadius: '10px',
//         padding: '20px',
//         height: '100%',
//         backgroundColor: '#fff',
//         boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
//         transition: 'all 0.3s ease-in-out',
//         cursor: 'pointer'
//     };

//     const badgeStyle = (isBlue) => ({
//         backgroundColor: isBlue ? '#007bff' : primaryRed,
//         color: 'white',
//         padding: '8px 20px',
//         borderRadius: '5px',
//         fontWeight: 'bold',
//         display: 'inline-block',
//         minWidth: '100px'
//     });

//     const creditValStyle = {
//         backgroundColor: '#ffc107',
//         color: 'black',
//         padding: '8px 20px',
//         borderRadius: '5px',
//         fontWeight: 'bold',
//         display: 'inline-block',
//         minWidth: '120px'
//     };

//     return (
//         <div className="bg-light min-vh-100 py-5">
//             <motion.div
//                 className="container bg-white shadow-sm rounded-4 p-4 p-md-5"
//                 style={{ maxWidth: '900px' }}
//                 initial="hidden"
//                 whileInView="visible"
//                 viewport={{ once: true }}
//                 variants={fadeInUp}
//             >

//                 {/* --- Hero Section --- */}
//                 <motion.div className="text-center mb-5" variants={fadeInUp}>
//                     <h2 className="fw-bold mb-4" style={{ color: darkGray }}>Do you want to become a Reseller?</h2>
//                     <p className="text-muted mx-auto" style={{ maxWidth: '700px' }}>
//                         If so, then you are at the right place. Currently, our team offers you the possibility of becoming a
//                         license reseller of our application with a panel that allows you to manage and activate your
//                         customers' subscriptions easily, upon receipt of your Reseller order.
//                     </p>
//                     <div className="mt-4 d-flex justify-content-center gap-3">
//                         <motion.button
//                             whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(230, 57, 70, 0.4)" }}
//                             whileTap={{ scale: 0.95 }}
//                             className="btn btn-lg px-4 fw-bold"
//                             style={{ backgroundColor: primaryRed, color: 'white' }}
//                             onClick={() => navigate('/register')} // Yeh line add karein
//                         >
//                             Register now
//                         </motion.button>
//                         <motion.button
//                             whileHover={{ scale: 1.05, backgroundColor: "#000" }}
//                             whileTap={{ scale: 0.95 }}
//                             className="btn btn-lg btn-dark px-4 fw-bold"
//                             onClick={() => navigate('/login')} // <--- Yeh line add karein
//                         >
//                             Login
//                         </motion.button>
//                     </div>
//                 </motion.div>

//                 <hr className="my-5 opacity-25" />

//                 {/* --- Features Section --- */}
//                 <div className="text-center mb-4">
//                     <h3 className="fw-bold" style={{ color: darkGray }}>Our features</h3>
//                 </div>

//                 <motion.div
//                     className="row g-4 mb-5"
//                     variants={staggerContainer}
//                     initial="hidden"
//                     whileInView="visible"
//                     viewport={{ once: true }}
//                 >
//                     <FeatureCard
//                         title="Simple interface"
//                         desc="An easy and intuitive interface for the reseller."
//                         iconStyle={{ color: '#ffc107' }}
//                         cardStyle={featureCardStyle}
//                         variants={fadeInUp}
//                     />
//                     <FeatureCard
//                         title="Rich panel"
//                         desc="Easy panel with all options to manage your clients."
//                         iconStyle={{ color: '#ffc107' }}
//                         cardStyle={featureCardStyle}
//                         variants={fadeInUp}
//                     />
//                     <FeatureCard
//                         title="Retraction"
//                         desc="You can retract an activation before 3 days."
//                         iconStyle={{ color: '#ffc107' }}
//                         cardStyle={featureCardStyle}
//                         variants={fadeInUp}
//                     />
//                     <FeatureCard
//                         title="Referral (SOON)"
//                         desc="Earn free activations by inviting other resellers."
//                         iconStyle={{ color: '#ffc107' }}
//                         cardStyle={featureCardStyle}
//                         variants={fadeInUp}
//                     />
//                 </motion.div>

//                 <hr className="my-5 opacity-25" />

//                 {/* --- Credit System Section --- */}
//                 <motion.div
//                     className="text-center mb-5"
//                     initial="hidden"
//                     whileInView="visible"
//                     viewport={{ once: true }}
//                     variants={fadeInUp}
//                 >
//                     <h3 className="fw-bold mb-3" style={{ color: darkGray }}>Our system of credits</h3>
//                     <p className="text-muted mb-4">
//                         We are pleased to introduce a new, flexible credit system. Resellers can now purchase any number of credits
//                         they desire, and use these credits towards either one-year or lifetime activations.
//                     </p>

//                     <div className="d-flex flex-column align-items-center gap-3 mb-5">
//                         <motion.div whileHover={{ scale: 1.1 }} className="d-flex align-items-center gap-3">
//                             <span style={badgeStyle(true)}>1 YEAR</span>
//                             <span className="fw-bold">=</span>
//                             <span style={creditValStyle}>1 CREDIT</span>
//                         </motion.div>
//                         <motion.div whileHover={{ scale: 1.1 }} className="d-flex align-items-center gap-3">
//                             <span style={badgeStyle(true)}>FOREVER</span>
//                             <span className="fw-bold">=</span>
//                             <span style={creditValStyle}>2.5 CREDITS</span>
//                         </motion.div>
//                     </div>

//                     {/* Pricing Table */}
//                     <div className="table-responsive">
//                         <table className="table table-bordered align-middle">
//                             <thead className="table-light text-muted">
//                                 <tr>
//                                     <th className="py-3">Credits</th>
//                                     <th colSpan="2" className="py-3 text-center">Unit Price</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 <PriceRow range="1 → 9" mad="65.00 MAD" eur="5.99€" />
//                                 <PriceRow range="10 → 49" mad="60.00 MAD" eur="5.49€" />
//                                 <PriceRow range="50 → 99" mad="55.00 MAD" eur="4.99€" />
//                                 <PriceRow range="100 → 199" mad="44.00 MAD" eur="3.99€" />
//                                 <PriceRow range="200 → 499" mad="38.00 MAD" eur="3.49€" />
//                                 <PriceRow range="500 → 999" mad="27.00 MAD" eur="2.49€" />
//                                 <PriceRow range="1000 → ∞" mad="17.00 MAD" eur="1.49€" />
//                             </tbody>
//                         </table>
//                     </div>
//                 </motion.div>
//             </motion.div>

//             {/* --- Footer --- */}
//             <footer className="container mt-4 text-muted small d-flex justify-content-between flex-wrap px-4" style={{ maxWidth: '900px' }}>
//                 <p>© 2021 / 2026 WisePlayer - All rights reserved.</p>
//                 <div className="d-flex gap-3">
//                     <a href="#" className="text-decoration-none text-muted">Terms of online sale</a>
//                     <a href="#" className="text-decoration-none text-muted">Privacy policy</a>
//                 </div>
//             </footer>

//             {/* Simple CSS for Table Hover Effect */}
//             <style>{`
//         tr { transition: background-color 0.2s ease; }
//         tbody tr:hover { background-color: #fff5f5; }
//       `}</style>
//         </div>
//     );
// };

// // Helper component for Feature Cards with Animation
// const FeatureCard = ({ title, desc, iconStyle, cardStyle, variants }) => (
//     <motion.div
//         className="col-md-6"
//         variants={variants}
//         whileHover={{ y: -10, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
//     >
//         <div style={cardStyle}>
//             <div className="d-flex align-items-start">
//                 <motion.span
//                     className="me-2"
//                     style={iconStyle}
//                     animate={{ scale: [1, 1.2, 1] }}
//                     transition={{ repeat: Infinity, duration: 2 }}
//                 >
//                     ★
//                 </motion.span>
//                 <div>
//                     <h6 className="fw-bold mb-1">{title}</h6>
//                     <p className="text-muted mb-0 small">{desc}</p>
//                 </div>
//             </div>
//         </div>
//     </motion.div>
// );

// // Helper component for Pricing Table Rows
// const PriceRow = ({ range, mad, eur }) => (
//     <tr>
//         <td className="fw-bold py-2">{range}</td>
//         <td className="py-2">{mad}</td>
//         <td className="py-2">{eur}</td>
//     </tr>
// );

// export default ResellerPage;