import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { name, role, id, token }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore user from sessionStorage
    const empID = sessionStorage.getItem("empID");
    const empName = sessionStorage.getItem("empName");
    const empDesignation = sessionStorage.getItem("empDesignation");
    const empDepartment = sessionStorage.getItem("empDepartment");
    const token = sessionStorage.getItem("empToken");
    console.log(empDesignation, empDepartment)
    if (empName && empDesignation) {
      setUser({ name: empName, role: empDesignation, id: empID, empDepartment: empDepartment, token });
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  // login should accept the values and set both sessionStorage (if needed) and context
  const login = ({ id, name, role, token, department }) => {
  
    // sessionStorage should already be set by LoginPage, but set defensively:
    if (id) sessionStorage.setItem("empID", id);
    if (name) sessionStorage.setItem("empName", name);
    if (role) sessionStorage.setItem("empDesignation", role);
    if (department) sessionStorage.setItem("empDepartment", department);
    if (token) sessionStorage.setItem("emptoken", token);

    setUser({ id, name, role, department, token });
  };

  const logout = () => {
    sessionStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
