"use client";
import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useRouter, useSearchParams } from "next/navigation";
import {
  placeholder,
  checkWhite,
  openEyeIcon,
  closeEyeIcon,
} from "@/resources/images";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Image from "next/image";
import AuthAPI from "@/networking/auth-api";
import { tokenManager } from "@/utils/token-manager";
import styles from "./styles.module.css";

// Validation schema
const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string().required("Password is required").trim(),
  confirmPassword: Yup.string()
    .required("Confirm password is required")
    .trim()
    .oneOf([Yup.ref("password")], "Passwords must match"),
});

interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [token, setToken] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(decodeURIComponent(tokenParam));
    } else {
      router.push("/login");
    }
  }, [searchParams, router]);

  // Cleanup effect to clear tokens when component unmounts
  useEffect(() => {
    return () => {
      // Clear tokens when component unmounts to ensure security
      if (successMessage) {
        tokenManager.clearTokens();
      }
    };
  }, [successMessage]);

  const initialValues: ResetPasswordFormValues = {
    password: "",
    confirmPassword: "",
  };

  const handleSubmit = async (
    values: ResetPasswordFormValues,
    { setSubmitting, resetForm }: any
  ) => {
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (!token) {
        setErrorMessage(
          "Reset token is missing. Please try the verification process again."
        );
        return;
      }
      const response = await AuthAPI.resetPassword(token, values.password);
      console.log("Password reset response:", response);
      setSuccessMessage("Password reset successfully!");
      resetForm();
      // Clear the reset token from URL and localStorage if it exists
      if (typeof window !== "undefined") {
        // Clear any stored tokens using token manager
        tokenManager.clearTokens();
        // Update URL to remove token parameter
        window.history.replaceState({}, document.title, "/reset-password");
      }
      // Navigate to login after successful reset
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      setErrorMessage(
        error.message || "Failed to reset password. Please try again."
      );
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  const renderErrorMessage = (message: string) => {
    return (
      <div className={styles.reset_password_form_failed_container}>
        <p className={styles.reset_password_form_failed_title}>
          That combo doesn't look right — give it another shot!
        </p>
        <p className={styles.reset_password_form_failed_subtitle}>{message}</p>
      </div>
    );
  };

  const renderForm = () => {
    return (
      <Formik
        initialValues={initialValues}
        validationSchema={ResetPasswordSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          setFieldValue,
        }) => (
          <Form className={styles.reset_password_form_container}>
            {errorMessage && renderErrorMessage(errorMessage)}
            <Input
              label="Enter new password *"
              placeholder="Enter new password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              rightIcon={showPassword ? openEyeIcon : closeEyeIcon}
              error={
                touched.password && errors.password
                  ? errors.password
                  : undefined
              }
              onClickRightIcon={() => setShowPassword(!showPassword)}
            />
            <Input
              label="Confirm password *"
              placeholder="Confirm password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              rightIcon={showConfirmPassword ? openEyeIcon : closeEyeIcon}
              error={
                touched.confirmPassword && errors.confirmPassword
                  ? errors.confirmPassword
                  : undefined
              }
              onClickRightIcon={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            />
            <Button
              title="Reset password"
              type="submit"
              variant="primary"
              className={styles.reset_password_sign_in_button}
              loading={isSubmitting}
              disabled={isSubmitting}
            />
          </Form>
        )}
      </Formik>
    );
  };
  return (
    <div className={styles.reset_password_container}>
      <div className={styles.reset_password_sub_container}>
        {/* Title */}
        <div className={styles.reset_password_title_container}>
          <p className={styles.reset_password_title}>Reset password</p>
          <p className={styles.reset_password_subtitle}>
            One step away from your dashboard Just a quick login and you're in!
          </p>
        </div>
        {/* Form */}
        {renderForm()}
      </div>
    </div>
  );
};

export default ResetPassword;
