import { useEffect, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import { closeRoseIcon, plusRoseIcon } from "@/resources/images";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import SelectDropDown from "@/components/ui/select-dropdown";
import TextArea from "@/components/ui/textarea";
import CustomTabs from "@/components/ui/tabs";
import styles from "./styles.module.css";
import React from "react";
import { clientsApiService } from "@/networking/client-api-service";
import { ClientDataTypes } from "@/types/client";

interface AddClientUserModalProps {
  show: boolean;
  onClose: () => void;
}

interface ClientFormData {
  clientName: string;
  organizationNumber: string;
  industryType: string;
  address: string;
  websiteUrl: string;
  status: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhoneNumber: string;
  description: string;
  user: UserFormData[];
}

interface UserFormData {
  username: string;
  contact: string;
  email: string;
}

// Validation schema for client form
const ClientValidationSchema = Yup.object().shape({
  clientName: Yup.string().required("Client name is required"),
  organizationNumber: Yup.string(),
  industryType: Yup.string().required("Industry type is required"),
  address: Yup.string().required("Address is required"),
  websiteUrl: Yup.string()
    .required("Website URL is required")
    .url("Invalid website URL format"),
  status: Yup.string().required("Status is required"),
  primaryContactName: Yup.string().required("Primary contact name is required"),
  primaryContactEmail: Yup.string()
    .email("Invalid email format")
    .when("$isEmailRequired", {
      is: true,
      then: (schema) => schema.required("Email is required"),
      otherwise: (schema) => schema.optional(),
    }),
  primaryContactPhoneNumber: Yup.string()
    .required("Phone number is required")
    .matches(/^[\+]?[1-9][\d]{0,15}$/, "Phone number must be a valid number"),
  description: Yup.string().required("Description is required"),
});

// Validation schema for user form
const UserValidationSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  contact: Yup.string()
    .matches(/^[0-9+\-\s()]+$/, "Contact must contain only numbers")
    .required("Contact is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
});

const initialValues: ClientFormData = {
  clientName: "",
  organizationNumber: "",
  industryType: "",
  address: "",
  websiteUrl: "",
  status: "",
  primaryContactName: "",
  primaryContactEmail: "",
  primaryContactPhoneNumber: "",
  description: "",
  user: [],
};

export default function AddClientUserModal({
  show,
  onClose,
}: AddClientUserModalProps) {
  const [activeTab, setActiveTab] = useState("client");
  const [currentUserFormValues, setCurrentUserFormValues] = useState({
    username: "",
    contact: "",
    email: "",
  });

  const handleTabClick = () => {
    if (activeTab === "user") {
      setActiveTab("client");
    }
  };

  const [users, setUsers] = useState<UserFormData[]>([]);

  const postClientData = async (modalData: ClientDataTypes) => {
    try {
      const response = await clientsApiService.createClient(modalData);
      console.log("✅ Client created successfully:", response);
      return response;
    } catch (error) {
      console.log("❌ Error creating client:", error);
      throw error;
    }
  };

  // Handle form submission
  const handleSubmit = async (
    values: ClientFormData,
    { setSubmitting, resetForm }: any
  ) => {
    if (activeTab === "client") {
      setActiveTab("user");
    } else {
      // When submitting from the user tab, combine client and users data into one object
      const allUsers = [...users];

      // If there are current form values that haven't been added, include them
      if (
        currentUserFormValues.username &&
        currentUserFormValues.contact &&
        currentUserFormValues.email
      ) {
        allUsers.push({
          username: currentUserFormValues.username,
          contact: currentUserFormValues.contact,
          email: currentUserFormValues.email,
        });
      }
      // Combine client and users data into a single object
      const modalData = {
        clientName: values.clientName,
        organizationNumber: values.organizationNumber,
        industryType: values.industryType,
        address: values.address,
        websiteUrl: values.websiteUrl,
        status: values.status,
        primaryContactName: values.primaryContactName,
        primaryContactEmail: values.primaryContactEmail,
        primaryContactPhoneNumber: values.primaryContactPhoneNumber,
        description: values.description,
        user: allUsers.map((user) => ({
          username: user.username,
          contact: user.contact,
          email: user.email,
        })),
      };

      console.log("Combined Client and Users Data:", modalData);
      try {
        await postClientData(modalData);

        // Reset form and close modal on success
        resetForm();
        setUsers([]);
        setCurrentUserFormValues({ username: "", contact: "", email: "" });
        setActiveTab("client");
        onClose();
      } catch (error) {
        console.log("❌ Failed to create client:", error);
        // Don't reset form or close modal on error
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Handle cancel
  const handleCancel = (resetForm: () => void) => {
    resetForm();
    setUsers([]);
    setCurrentUserFormValues({ username: "", contact: "", email: "" });
    setActiveTab("client");
    onClose();
  };

  // Handle close icon
  const handleClose = (resetForm: () => void) => {
    resetForm();
    setUsers([]);
    setCurrentUserFormValues({ username: "", contact: "", email: "" });
    setActiveTab("client");
    onClose();
  };

  const renderClinetInfo = (formikProps: any) => {
    const { values, errors, touched, handleChange, handleBlur, isSubmitting } =
      formikProps;

    return (
      <div className={styles.client_info_section}>
        <div className={styles.client_info_section_input_section}>
          <Input
            label="Client name*"
            value={values.clientName}
            onChange={handleChange}
            onBlur={handleBlur}
            name="clientName"
            placeholder="Enter client name"
            inputStyle={styles.client_info_section_input_section_input}
            error={
              touched.clientName && errors.clientName
                ? errors.clientName
                : undefined
            }
          />
          <Input
            label="Org Number"
            value={values.organizationNumber}
            onChange={handleChange}
            onBlur={handleBlur}
            name="organizationNumber"
            placeholder="Enter org number"
            inputStyle={styles.client_info_section_input_section_input}
            error={
              touched.organizationNumber && errors.organizationNumber
                ? errors.organizationNumber
                : undefined
            }
          />
          <SelectDropDown
            label="Industry Type*"
            options={[
              { label: "Industry Type", value: "Industry Type" },
              { label: "Industry Type 2", value: "Industry Type 2" },
              { label: "Industry Type 3", value: "Industry Type 3" },
            ]}
            selected={values.industryType}
            onSelect={(value) =>
              formikProps.setFieldValue("industryType", value as string)
            }
            showError={!!(touched.industryType && errors.industryType)}
            errorMessage={
              touched.industryType && errors.industryType
                ? errors.industryType
                : ""
            }
          />
          <Input
            label="Address*"
            value={values.address}
            onChange={handleChange}
            onBlur={handleBlur}
            name="address"
            placeholder="Enter address"
            inputStyle={styles.client_info_section_input_section_input}
            error={
              touched.address && errors.address ? errors.address : undefined
            }
          />
          <Input
            label="Website URL*"
            value={values.websiteUrl}
            onChange={handleChange}
            onBlur={handleBlur}
            name="websiteUrl"
            placeholder="Enter website url"
            inputStyle={styles.client_info_section_input_section_input}
            error={
              touched.websiteUrl && errors.websiteUrl
                ? errors.websiteUrl
                : undefined
            }
          />
          <SelectDropDown
            label="Status*"
            options={[
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ]}
            selected={values.status}
            onSelect={(value) => {
              formikProps.setFieldValue("status", value as string);
              console.log("value", value);
            }}
            showError={!!(touched.status && errors.status)}
            errorMessage={touched.status && errors.status ? errors.status : ""}
          />
          <Input
            label="Primary Contact Name*"
            value={values.primaryContactName}
            onChange={handleChange}
            onBlur={handleBlur}
            name="primaryContactName"
            placeholder="Enter primary contact name"
            inputStyle={styles.client_info_section_input_section_input}
            error={
              touched.primaryContactName && errors.primaryContactName
                ? errors.primaryContactName
                : undefined
            }
          />
          <Input
            label="Email"
            value={values.primaryContactEmail}
            onChange={handleChange}
            onBlur={handleBlur}
            name="primaryContactEmail"
            placeholder="Enter email"
            inputStyle={styles.client_info_section_input_section_input}
            error={
              touched.primaryContactEmail && errors.primaryContactEmail
                ? errors.primaryContactEmail
                : undefined
            }
          />
          <Input
            label="Phone*"
            value={values.primaryContactPhoneNumber}
            onChange={handleChange}
            onBlur={handleBlur}
            name="primaryContactPhoneNumber"
            placeholder="Enter phone"
            inputStyle={styles.client_info_section_input_section_input}
            error={
              touched.primaryContactPhoneNumber &&
              errors.primaryContactPhoneNumber
                ? errors.primaryContactPhoneNumber
                : undefined
            }
          />
        </div>
        <div className={styles.client_info_input_bottom_section}>
          <TextArea
            label="Description*"
            value={values.description}
            onChange={handleChange}
            onBlur={handleBlur}
            name="description"
            placeholder="Enter description"
            error={
              touched.description && errors.description
                ? errors.description
                : undefined
            }
          />
        </div>
      </div>
    );
  };

  const renderUserInfo = () => {
    return (
      <div className={styles.user_info_section}>
        <Formik
          initialValues={{
            username: "",
            contact: "",
            email: "",
          }}
          validationSchema={UserValidationSchema}
          onSubmit={(values, { resetForm }) => {
            setUsers([
              ...users,
              {
                username: values.username,
                contact: values.contact,
                email: values.email,
              },
            ]);
            resetForm();
          }}
        >
          {(formikProps) => {
            const {
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              isValid,
            } = formikProps;

            // Update current form values whenever they change
            React.useEffect(() => {
              setCurrentUserFormValues(values);
            }, [values]);

            return (
              <>
                {/* Table with Header and Data */}
                <table className={styles.user_info_section_table}>
                  <thead className={styles.user_info_section_table_header}>
                    <tr className={styles.user_info_section_table_header_row}>
                      <th
                        className={styles.user_info_section_table_header_cell}
                      >
                        User Name
                      </th>
                      <th
                        className={styles.user_info_section_table_header_cell}
                      >
                        Contact
                      </th>
                      <th
                        className={styles.user_info_section_table_header_cell}
                      >
                        Email
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.username}
                        className={styles.user_info_section_table_row}
                      >
                        <td className={styles.user_info_section_table_cell}>
                          {user.username}
                        </td>
                        <td className={styles.user_info_section_table_cell}>
                          {user.contact}
                        </td>
                        <td className={styles.user_info_section_table_cell}>
                          {user.email}
                        </td>
                      </tr>
                    ))}
                    {/* Input Row */}
                    <tr className={styles.user_info_section_table_input_row}>
                      <td className={styles.user_info_section_table_cell}>
                        <div className={styles.user_info_section_input_wrapper}>
                          <Input
                            label=""
                            placeholder="Enter here"
                            name="username"
                            value={values.username}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            inputStyle={styles.user_info_section_input}
                            inputContainerClass={
                              styles.user_info_section_input_container
                            }
                            inputWrapperClass={
                              styles.user_info_section_input_wrapper
                            }
                          />
                          {errors.username && touched.username && (
                            <div
                              className={styles.client_user_modal_error_message}
                            >
                              {errors.username}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className={styles.user_info_section_table_cell}>
                        <div className={styles.user_info_section_input_wrapper}>
                          <Input
                            label=""
                            placeholder="Enter here"
                            name="contact"
                            value={values.contact}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            inputStyle={styles.user_info_section_input}
                            inputContainerClass={
                              styles.user_info_section_input_container
                            }
                            inputWrapperClass={
                              styles.user_info_section_input_wrapper
                            }
                          />
                          {errors.contact && touched.contact && (
                            <div
                              className={styles.client_user_modal_error_message}
                            >
                              {errors.contact}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className={styles.user_info_section_table_cell}>
                        <div className={styles.user_info_section_input_wrapper}>
                          <Input
                            label=""
                            placeholder="Enter here"
                            name="email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            inputStyle={styles.user_info_section_input}
                            inputContainerClass={
                              styles.user_info_section_input_container
                            }
                            inputWrapperClass={
                              styles.user_info_section_input_wrapper
                            }
                          />
                          {errors.email && touched.email && (
                            <div
                              className={styles.client_user_modal_error_message}
                            >
                              {errors.email}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className={styles.user_info_section_add_button}>
                  <Button
                    title="Add User"
                    className={styles.user_info_section_add_button_button}
                    onClick={() => {
                      // Validate contact format
                      const contactRegex = /^[0-9+\-\s()]+$/;
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                      const isContactValid = contactRegex.test(values.contact);
                      const isEmailValid = emailRegex.test(values.email);
                      const isUsernameValid = values.username.trim() !== "";

                      if (isUsernameValid && isContactValid && isEmailValid) {
                        const newUser = {
                          username: values.username,
                          contact: values.contact,
                          email: values.email,
                        };
                        setUsers([...users, newUser]);
                        formikProps.resetForm();
                      } else {
                        // Show validation errors
                        formikProps.setTouched(
                          Object.keys(values).reduce((acc: any, key) => {
                            acc[key] = true;
                            return acc;
                          }, {})
                        );
                      }
                    }}
                    icon={plusRoseIcon}
                    iconContainerClass={
                      styles.user_info_section_add_button_icon
                    }
                    disabled={
                      !isValid ||
                      !values.username ||
                      !values.contact ||
                      !values.email
                    }
                  />
                </div>
              </>
            );
          }}
        </Formik>
      </div>
    );
  };

  return (
    <Modal
      show={show}
      onClose={onClose}
      closeOnOutSideClick={true}
      container_style={styles.client_user_modal_container_style}
      overlay_style={styles.client_user_modal_overlay_style}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={ClientValidationSchema}
        onSubmit={handleSubmit}
      >
        {(formikProps) => (
          <>
            <div className={styles.client_user_modal_header}>
              <div className={styles.client_user_modal_header_top}>
                <div className={styles.client_user_modal_header_left}>
                  <p className={styles.client_user_modal_header_left_text}>
                    Add New Client
                  </p>
                </div>
                <Image
                  src={closeRoseIcon}
                  alt="close"
                  className={styles.client_user_modal_header_close_icon}
                  onClick={() => handleClose(formikProps.resetForm)}
                  style={{ cursor: "pointer" }}
                />
              </div>

              <div className={styles.client_user_modal_tabs}>
                <CustomTabs
                  tabs={[
                    { label: "Add client info", value: "client" },
                    { label: "Add users", value: "user" },
                  ]}
                  activeTab={activeTab}
                  onTabChange={handleTabClick}
                  customStyles={{
                    tabColor: "var(--granite-gray)",
                    selectedTabColor: "var(--rose-red)",
                    indicatorColor: "var(--rose-red)",
                    fontSize: "14px",
                    fontFamily: "var(--font-lato-bold)",
                  }}
                />
              </div>
            </div>
            <div className={styles.client_user_modal_content}>
              {activeTab === "client"
                ? renderClinetInfo(formikProps)
                : renderUserInfo()}
            </div>
            <div className={styles.client_user_modal_footer}>
              <Button
                title="Cancel"
                variant="plain"
                onClick={() => handleCancel(formikProps.resetForm)}
              />
              <Button
                title={activeTab === "client" ? "Save & Continue" : "Submit"}
                className={styles.client_user_modal_footer_button_submit}
                onClick={() => {
                  if (activeTab === "client") {
                    formikProps.validateForm().then((errors: any) => {
                      if (Object.keys(errors).length === 0) {
                        setActiveTab("user");
                      } else {
                        formikProps.setTouched(
                          Object.keys(formikProps.values).reduce(
                            (acc: any, key) => {
                              acc[key] = true;
                              return acc;
                            },
                            {}
                          )
                        );
                      }
                    });
                  } else {
                    handleSubmit(formikProps.values, {
                      setSubmitting: () => {},
                      resetForm: formikProps.resetForm,
                    });
                  }
                }}
                disabled={Boolean(
                  (activeTab === "user" &&
                    users.length === 0 &&
                    (!currentUserFormValues.username ||
                      !currentUserFormValues.contact ||
                      !currentUserFormValues.email)) ||
                    (activeTab === "client" && formikProps.isSubmitting) ||
                    (activeTab === "user" &&
                      currentUserFormValues.username &&
                      currentUserFormValues.contact &&
                      currentUserFormValues.email &&
                      (!/^[0-9+\-\s()]+$/.test(currentUserFormValues.contact) ||
                        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                          currentUserFormValues.email
                        )))
                )}
              />
            </div>
          </>
        )}
      </Formik>
    </Modal>
  );
}
