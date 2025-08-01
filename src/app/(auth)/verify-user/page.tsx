"use client";
import { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useSearchParams } from "next/navigation";
import Button from "@/components/ui/button";
import OTPInputComponent from "@/components/ui/otp-input";
import styles from "./styles.module.css";
import AuthAPI from "@/networking/auth-api";

// Validation schema
const VerifyUserSchema = Yup.object().shape({
  otp: Yup.string()
    .length(6, "Please enter a code")
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
  const [email, setEmail] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const initialValues: VerifyUserFormValues = {
    otp: "",
  };

  const handleSubmit = async (
    values: VerifyUserFormValues,
    { setSubmitting, resetForm }: any
  ) => {
    setIsSubmitting(true);
    try {
      const response = await AuthAPI.verifyOtp(email, values.otp);
      console.log("OTP verification response:", response);
      resetForm();
    } catch (error: any) {
      console.log("OTP verification error:", error);
      setErrorMessage(error.message || "OTP verification failed");
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setErrorMessage("");
    try {
      await AuthAPI.forgotPassword(email);
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
    } catch (error: any) {
      setErrorMessage(error.message || "Resend OTP failed");
    } finally {
      setIsResending(false);
    }
  };

  const renderForm = () => {
    return (
      <Formik
        initialValues={initialValues}
        validationSchema={VerifyUserSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, setFieldValue }) => (
          <Form className={styles.verify_user_form_container}>
            {/* OTP Input */}
            <OTPInputComponent
              value={values.otp}
              onChange={(value) => setFieldValue("otp", value)}
              disabled={isSubmitting}
              className={styles.otp_input_wrapper}
            />

            {/* Error message */}
            {errors.otp && touched.otp && (
              <div className={styles.error_message}>{errors.otp}</div>
            )}

            {/* Verify Button */}
            <div className={styles.verify_button_container}>
              <Button
                title="Verify Code"
                type="submit"
                variant="primary"
                className={styles.verify_user_sign_in_button}
                loading={isSubmitting}
                disabled={isSubmitting || values.otp.length !== 6}
              />

              {/* Resend Code */}
              <div className={styles.resend_container}>
                <p className={styles.resend_text}>Don't receive any code? </p>
                {resendCountdown > 0 ? (
                  <p className={styles.resend_countdown}>
                    Resend OTP in {resendCountdown}s
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isResending}
                    className={styles.resend_button}
                  >
                    {isResending ? "Sending..." : "Resend OTP"}
                  </button>
                )}
              </div>
            </div>
          </Form>
        )}
      </Formik>
    );
  };

  const renderErrorMessage = (message: string) => {
    return (
      <div className={styles.verify_user_form_failed_container}>
        <p className={styles.verify_user_form_failed_title}>
          That combo doesn't look right — give it another shot!
        </p>
        <p className={styles.verify_user_form_failed_subtitle}>{message}</p>
      </div>
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
          {email && (
            <p className={styles.email_display}>Code sent to: {email}</p>
          )}
        </div>
        {/* Failed */}
        {errorMessage && renderErrorMessage(errorMessage)}
        {/* Form */}
        {renderForm()}
      </div>
    </div>
  );
};

export default VerifyUser;
