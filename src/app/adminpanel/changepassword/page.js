"use client"
import Sidebar from "../../../admincomponent/Sidebar";
import { useState } from "react";

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement password change logic here
    console.log("Form Data:", formData);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-2 p-0 bg-light" style={{ minHeight: "100vh" }}>
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="col-md-8 p-4 ms-5 mt-5">
          <h2 className="mb-4">Change Password</h2>
          <form onSubmit={handleSubmit}>
            {/* Old Password Field */}
            <div className="mb-3">
              <label htmlFor="oldPassword" className="form-label">
                Old Password
              </label>
              <input
                type="password"
                className="form-control"
                id="oldPassword"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                required
              />
            </div>

            {/* New Password Field */}
            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">
                New Password
              </label>
              <input
                type="password"
                className="form-control"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
              />
            </div>

            {/* Confirm Password Field */}
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm New Password
              </label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}