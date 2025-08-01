"use client";
import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import styles from "./styles.module.css";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useAuth } from "@/providers";
import { plusRoseIcon } from "@/resources/images";

// Validation schema
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required")
    .trim(),
  password: Yup.string().required("Password is required"),
});

interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

const Login: React.FC = () => {
  const router = useRouter();
  const { login, error, clearError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const initialValues: LoginFormValues = {
    email: "",
    password: "",
    rememberMe: false,
  };

  const handleSubmit = async (
    values: LoginFormValues,
    { setSubmitting, resetForm }: any
  ) => {
    setIsSubmitting(true);
    setErrorMessage("");
    clearError();

    try {
      await login({
        email: values.email,
        password: values.password,
      });
      // Redirect to dashboard on successful login
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login failed:", error);
      setErrorMessage(
        error.message || "Login failed. Double-check your email and password."
      );
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  const renderErrorMessage = (message: string) => {
    return (
      <div className={styles.login_form_failed_container}>
        <p className={styles.login_form_failed_title}>
          That combo doesn't look right — give it another shot!
        </p>
        <p className={styles.login_form_failed_subtitle}>{message}</p>
      </div>
    );
  };

  const renderForm = () => {
    return (
      <Formik
        initialValues={initialValues}
        validationSchema={LoginSchema}
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
          <Form className={styles.login_form_container}>
            <Input
              label="Email*"
              placeholder="Enter your email"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email && errors.email ? errors.email : undefined}
            />

            <Input
              label="Password*"
              placeholder="Enter your password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                touched.password && errors.password
                  ? errors.password
                  : undefined
              }
              rightIcon={plusRoseIcon}
              onClickRightIcon={() => {
                setShowPassword(!showPassword);
              }}
            />

            <div className={styles.forgot_password_container}>
              <p
                onClick={() => router.push("/forgot-password")}
                className={styles.forgot_password}
              >
                Forgot password?
              </p>
            </div>

            <Button
              title="Sign in"
              type="submit"
              variant="primary"
              className={styles.sign_in_button}
              loading={isSubmitting}
              disabled={isSubmitting}
            />
          </Form>
        )}
      </Formik>
    );
  };

  return (
    <div className={styles.login_container}>
      <div className={styles.logo_container}>
        <p className={styles.logo_text}>Planor</p>
      </div>
      <div className={styles.sub_container}>
        {/* Title */}
        <div className={styles.title_container}>
          <p className={styles.title}>Login</p>
          <p className={styles.login_subtitle}>
            One step away from your dashboard Just a quick login and you're in!
          </p>
        </div>
        {/* Failed */}
        {(errorMessage || error) && renderErrorMessage(errorMessage)}
        {/* Form */}
        {renderForm()}
      </div>
    </div>
  );
};

export default Login;
