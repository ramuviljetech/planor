"use client";
import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import styles from "./styles.module.css";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

// Validation schema
const VerifyUserSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required")
    .trim(),
});

interface VerifyUserFormValues {
  email: string;
}

const VerifyUser: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues: VerifyUserFormValues = {
    email: "",
  };

  const handleSubmit = async (
    values: VerifyUserFormValues,
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
        validationSchema={VerifyUserSchema}
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
          <Form className={styles.verifyUserFormContainer}>
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
              title="Verify Code"
              type="submit"
              variant="secondary"
              className={styles.verifyUserSignInButton}
              loading={isSubmitting}
              disabled={isSubmitting}
            />
          </Form>
        )}
      </Formik>
    );
  };
  return (
    <div className={styles.verifyUserContainer}>
      <div className={styles.verifyUserSubContainer}>
        {/* Title */}
        <div className={styles.verifyUserTitleContainer}>
          <p className={styles.verifyUserTitle}>Verify It’s You</p>
          <p className={styles.verifyUserSubtitle}>
            We’ve sent a 6-digit code to your registered email/phone. Enter it
            below to continue.
          </p>
        </div>
        {/* Form */}
        {renderForm()}
      </div>
    </div>
  );
};

export default VerifyUser;
