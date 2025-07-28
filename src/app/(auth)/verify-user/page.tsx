"use client";
import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Button from "@/components/ui/button";
import OTPInputComponent from "@/components/ui/otp-input";
import styles from "./styles.module.css";

// Validation schema
const VerifyUserSchema = Yup.object().shape({
  otp: Yup.string()
    .length(6, "Please enter a 6-digit code")
    .matches(/^[0-9]+$/, "Code must contain only numbers")
    .required("Verification code is required")
    .trim(),
});

interface VerifyUserFormValues {
  otp: string;
}

const VerifyUser: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const initialValues: VerifyUserFormValues = {
    otp: "",
  };

  const handleSubmit = async (
    values: VerifyUserFormValues,
    { setSubmitting, resetForm }: any
  ) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement actual OTP verification logic here
      console.log("OTP verification attempt with:", values);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Handle successful verification
      console.log("OTP verification successful");
      // Reset form after successful submission
      resetForm();
    } catch (error) {
      console.error("OTP verification failed:", error);
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      // TODO: Implement actual resend logic here
      console.log("Resending verification code");
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Verification code resent successfully");

      // Start countdown for resend
      setResendCountdown(30);
      const countdownInterval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Resend failed:", error);
    } finally {
      setIsResending(false);
    }
  };

  const handleOTPChange = (value: string) => {
    // Filter out non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, "");
    return numericValue;
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
          <Form className={styles.verify_user_form_container}>
            {/* OTP Input */}
            <OTPInputComponent
              value={values.otp}
              onChange={(value) => setFieldValue("otp", handleOTPChange(value))}
              disabled={isSubmitting}
              className={styles.otp_input_wrapper}
            />

            {/* Error message */}
            {errors.otp && touched.otp && (
              <div className={styles.error_message}>{errors.otp}</div>
            )}

            {/* Verify Button */}
            <Button
              title="Send verification code"
              type="submit"
              variant="secondary"
              className={styles.verify_user_sign_in_button}
              loading={isSubmitting}
              disabled={isSubmitting || values.otp.length !== 6}
            />

            {/* Resend Code */}
            <div className={styles.resend_container}>
              <span className={styles.resend_text}>
                Don't receive any code?{" "}
              </span>
              {resendCountdown > 0 ? (
                <span className={styles.resend_countdown}>
                  Resend in {resendCountdown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending}
                  className={styles.resend_button}
                >
                  {isResending ? "Sending..." : "Resend Code"}
                </button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    );
  };

  return (
    <div className={styles.verify_user_container}>
      <div className={styles.verify_user_sub_container}>
        {/* Title */}
        <div className={styles.verify_user_title_container}>
          <p className={styles.verify_user_title}>Verify It's You</p>
          <p className={styles.verify_user_subtitle}>
            We've sent a 6-digit code to your registered email/phone. Enter it
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
