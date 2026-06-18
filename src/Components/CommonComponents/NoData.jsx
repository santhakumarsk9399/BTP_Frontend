import React from "react";
import "../../Styles/Nodata.css"
import { AlertCircle } from "lucide-react"; 

const NoData = ({name}) => {
  return (
    <div className={name}>
      <AlertCircle className="no-data-icon" />
      <p className="no-data-text">No Data Available</p>
    </div>
  );
};

export default NoData;