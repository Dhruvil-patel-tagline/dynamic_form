/* eslint-disable react-refresh/only-export-components */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ButtonCom from "../../shared/ButtonCom";
import Loader from "../../shared/Loader";
import { postRequest } from "../../utils/api";
import { forgotFields } from "../../utils/staticObj";
import AuthRoute from "./AuthRoute";
import "./css/auth.css";
import DynamicForm from "../../shared/DynamicForm";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData, resetFormData) => {
    try {
      setLoading(true);
      let response = await postRequest("users/ForgotPassword", {
        data: formData,
        errorMessage: "User not fond",
      });
      if (response.statusCode === 200) {
        navigate("/login");
        resetFormData();
      } else {
        toast.error(response?.message || "User not fond");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authContainer">
      {loading && <Loader />}
      <div className="authInnerDiv">
        <h1 className="authHeading">Forget Password</h1> <br />
        <DynamicForm
          fields={forgotFields}
          initialValues={{ email: "" }}
          onSubmit={handleSubmit}
          buttonText="Submit"
        />
        <div className="forgotInner" style={{ marginTop: "10px" }}>
          <ButtonCom type="button" onClick={() => navigate(-1)}>
            Back
          </ButtonCom>
        </div>
      </div>
    </div>
  );
};

export default AuthRoute({ redirectIfAuth: true })(ForgetPassword);
