"use client";
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { placeholder, checkWhite } from "@/resources/images";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Image from "next/image";
import AuthAPI from "@/networking/auth-api";
import styles from "./styles.module.css";

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
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const initialValues: ForgotPasswordFormValues = {
    email: "",
  };

  const handleSubmit = async (
    values: ForgotPasswordFormValues,
    { setSubmitting, resetForm }: any
  ) => {
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    router.push(`/verify-user`);

    // try {
    //   const response = await AuthAPI.forgotPassword(values.email);

    //   resetForm();
    //   router.push(`/verify-user?email=${encodeURIComponent(values.email)}`);
    // } catch (error: any) {
    //   setErrorMessage(
    //     error.message || "Failed to send verification code. Please try again."
    //   );
    // } finally {
    //   setIsSubmitting(false);
    //   setSubmitting(false);
    // }
  };

  const renderErrorMessage = (message: string) => {
    return (
      <div className={styles.forgot_password_form_failed_container}>
        <p className={styles.forgot_password_form_failed_title}>
          That combo doesn't look right — give it another shot!
        </p>
        <p className={styles.forgot_password_form_failed_subtitle}>{message}</p>
      </div>
    );
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
          <Form className={styles.forgot_password_form_container}>
            {errorMessage && renderErrorMessage(errorMessage)}
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
              variant="primary"
              className={styles.forgot_password_sign_in_button}
              loading={isSubmitting}
              disabled={isSubmitting}
            />
          </Form>
        )}
      </Formik>
    );
  };
  return (
    <div className={styles.forgot_password_container}>
      <div className={styles.forgot_password_sub_container}>
        {/* Title */}
        <div className={styles.forgot_password_title_container}>
          <p className={styles.forgot_password_title}>Forgot password</p>
          <p className={styles.forgot_password_subtitle}>
            One step away from your dashboard Just a quick login and you're in!
          </p>
        </div>
        {/* Form */}
        {renderForm()}
      </div>
    </div>
  );
};

export default ForgotPassword;
