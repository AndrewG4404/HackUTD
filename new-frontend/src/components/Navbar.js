// src/components/Navbar.js
import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Navbar = () => {
  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{
        backgroundColor: "#2a2b2d",
        color: "#d4af37",
        padding: "10px 20px",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div className="container-fluid">
        <Link
          className="navbar-brand"
          to="/account"
          style={{
            color: "#d4af37",
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
        >
          HERMES
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ borderColor: "#d4af37" }}
        >
          <span className="navbar-toggler-icon" style={{ color: "#d4af37" }}></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/account"
                style={{
                  color: "#f5c518",
                  padding: "10px",
                  transition: "color 0.3s ease",
                }}
              >
                My Account
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/crypto"
                style={{
                  color: "#f5c518",
                  padding: "10px",
                  transition: "color 0.3s ease",
                }}
              >
                Crypto
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link text-danger"
                to="/"
                style={{
                  color: "#f5c518",
                  padding: "10px",
                  transition: "color 0.3s ease",
                }}
              >
                Logout
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
