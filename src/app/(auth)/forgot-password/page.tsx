"use client";
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import styles from "./styles.module.css";
import { placeholder, checkWhite } from "@/resources/images";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Image from "next/image";

// Validation schema
const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required")
    .trim(),
});

interface ForgotPasswordFormValues {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues: ForgotPasswordFormValues = {
    email: "",
  };

  const handleSubmit = async (
    values: ForgotPasswordFormValues,
    { setSubmitting, resetForm }: any
  ) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement actual forgot password logic here
      console.log("Forgot password attempt with:", values);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Handle successful login
      console.log("Forgot password successful");
      // Reset form after successful submission
      resetForm();
    } catch (error) {
      console.error("Forgot password failed:", error);
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  const renderForm = () => {
    return (
      <Formik
        initialValues={initialValues}
        validationSchema={ForgotPasswordSchema}
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
          <Form className={styles.forgotPasswordFormContainer}>
            <Input
              label="Enter you email or phone number *"
              placeholder="Enter your email or phone number"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email && errors.email ? errors.email : undefined}
            />
            <Button
              title="Send verification code"
              type="submit"
              variant="secondary"
              className={styles.forgotPasswordSignInButton}
              loading={isSubmitting}
              disabled={isSubmitting}
            />
          </Form>
        )}
      </Formik>
    );
  };
  return (
    <div className={styles.forgotPasswordContainer}>
      <div className={styles.forgotPasswordSubContainer}>
        {/* Title */}
        <div className={styles.forgotPasswordTitleContainer}>
          <p className={styles.forgotPasswordTitle}>Forgot password</p>
          <p className={styles.forgotPasswordSubtitle}>
            One step away from your dashboard Just a quick login and you’re in!
          </p>
        </div>
        {/* Form */}
        {renderForm()}
      </div>
    </div>
  );
};

export default ForgotPassword;
