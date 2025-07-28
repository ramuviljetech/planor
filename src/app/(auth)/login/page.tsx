"use client";
import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import styles from "./styles.module.css";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

// Validation schema
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required")
    .trim(),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must be less than 50 characters")
    .required("Password is required")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

const Login: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    try {
      // TODO: Implement actual login logic here
      console.log("Login attempt with:", values);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Handle successful login
      console.log("Login successful");
      // Reset form after successful submission
      resetForm();
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
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
              type="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                touched.password && errors.password
                  ? errors.password
                  : undefined
              }
            />

            <div className={styles.forgot_password_container}>
              <p className={styles.forgot_password}>Forgot password?</p>
            </div>

            <Button
              title="Sign in"
              type="submit"
              variant="secondary"
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
        {/* Form */}
        {renderForm()}
      </div>
    </div>
  );
};

export default Login;
