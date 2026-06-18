// src/Pages/CommonComponents/Header.jsx
import React from "react";
import "../Header/Header.css";
import jklogo from "../../assets/Header/JK-3.png";
import DeloptLogo from "../../assets/Header/Delopt-Logo.png";
import ImageIcon from "../CommonComponents/ImageIcon";



const routeTitles = {
  "/dashboard": "Business Travel Approval Form",
  "/travel-request": "Travel Request",
};

const Header = ({ location }) => {
  const title =
    routeTitles[location.pathname] || "Business Travel Approval Form";

  return (
    <header className="header">
      <div className="container">
        <div className="row">
          <div className="header-lay">
            <div className="logosec1">
              <ImageIcon img={jklogo} Img_width="44px"  />
            </div>
            <div className="titlesec">
              <h2>{title}</h2>
            </div>
            <div className="logosec2">
              <ImageIcon img={DeloptLogo} Img_width="144px"  />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
