import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import publicRoute from "./route";
import { v4 as uuidv4 } from "uuid";

import { ToastContainer } from "react-toastify";
import { io } from "socket.io-client";
import React from "react";
let token = localStorage.getItem("token");
if (!token) {
  const randomId = uuidv4();
  localStorage.setItem("token", randomId);
  token = randomId;
}
const socket = io(process.env.REACT_APP_URL_SERVER, {
  auth: {
    token: token,
  },
  autoConnect: true,
});
function App() {
  return (
    <BrowserRouter>
      <div className="text-main-color relative">
        <Routes>
          {publicRoute.map((item, index) => {
            const Page = item.component;
            const Layout = item.layout;
            return (
              <Route
                key={index}
                path={item.path}
                element={
                  <Layout>
                    <Page socket={socket} />
                  </Layout>
                }
              />
            );
          })}

          <Route path="*" element={<Navigate to={""} />} />
        </Routes>
        <ToastContainer />
      </div>
    </BrowserRouter>
  );
}
// export const socket = connect();
export default App;
