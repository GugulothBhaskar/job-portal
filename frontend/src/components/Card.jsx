import React from "react";
import "./Card.css";

const Card = ({ title, number, icon }) => {
  return (
    <div className="card">
      <div className="card-icon">{icon}</div>
      <h4>{title}</h4>
      <h2>{number}</h2>
    </div>
  );
};

export default Card;