import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Modal from "../ui/modal";
import { closeRoseIcon } from "@/resources/images";
import Image from "next/image";
import Input from "../ui/input";
import Button from "../ui/button";
import SelectDropDown from "../ui/select-dropdown";
import styles from "./styles.module.css";
import TextArea from "../ui/textarea";

interface AddPropertyModalProps {
  show: boolean;
  onClose: () => void;
}

interface PropertyFormData {
  propertyName: string;
  propertyCode: string;
  propertyType: string;
  address: string;
  city: string;
  grossArea: string;
  primaryContactName: string;
  email: string;
  role: string;
  phone: string;
  description: string;
}

// Validation schema using Yup
const PropertyValidationSchema = Yup.object().shape({
  propertyName: Yup.string().required("Property name is required"),
  propertyCode: Yup.string(),
  propertyType: Yup.string(),
  address: Yup.string().required("Address is required"),
  city: Yup.string().required("City is required"),
  grossArea: Yup.string()
    .required("Gross area is required")
    .matches(/^\d+(\.\d+)?$/, "Gross area must be a valid number"),
  primaryContactName: Yup.string().required("Primary contact name is required"),
  email: Yup.string()
    .required("Email is required")
    .email("Invalid email format"),
  role: Yup.string(),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(/^[\+]?[1-9][\d]{0,15}$/, "Phone number must be a valid number"),
  description: Yup.string().required("Description is required"),
});

const initialValues: PropertyFormData = {
  propertyName: "",
  propertyCode: "",
  propertyType: "",
  address: "",
  city: "",
  grossArea: "",
  primaryContactName: "",
  email: "",
  role: "",
  phone: "",
  description: "",
};

export default function AddPropertyModal({
  show,
  onClose,
}: AddPropertyModalProps) {
  // Handle form submission
  const handleSubmit = (
    values: PropertyFormData,
    { setSubmitting, resetForm }: any
  ) => {
    console.log("Form Data:", values);
    // Here you can add your API call logic
    setSubmitting(false);
    resetForm();
    onClose();
  };

  // Handle cancel
  const handleCancel = (resetForm: () => void) => {
    resetForm();
    onClose();
  };

  // Handle close icon
  const handleClose = (resetForm: () => void) => {
    resetForm();
    onClose();
  };

  const renderPropertyInfo = (formikProps: any) => {
    const { values, errors, touched, handleChange, handleBlur, isSubmitting } =
      formikProps;

    return (
      <div className={styles.add_property_modal_content}>
        <div className={styles.add_property_modal_input_section}>
          <Input
            label="Property name*"
            value={values.propertyName}
            onChange={handleChange}
            onBlur={handleBlur}
            name="propertyName"
            placeholder="Enter property name"
            inputStyle={styles.add_property_modal_input_section_input}
            inputContainerClass={styles.add_property_modal_input_container}
            error={
              touched.propertyName && errors.propertyName
                ? errors.propertyName
                : undefined
            }
          />
          <Input
            label="Property Code"
            value={values.propertyCode}
            onChange={handleChange}
            onBlur={handleBlur}
            name="propertyCode"
            placeholder="Enter property code"
            inputStyle={styles.add_property_modal_input_section_input}
            inputContainerClass={styles.add_property_modal_input_container}
            error={
              touched.propertyCode && errors.propertyCode
                ? errors.propertyCode
                : undefined
            }
          />
          <SelectDropDown
            label="Property Type*"
            options={[
              { label: "Property Type", value: "Property Type" },
              { label: "Property Type 2", value: "Property Type 2" },
              { label: "Property Type 3", value: "Property Type 3" },
            ]}
            selected={values.propertyType}
            onSelect={(value) =>
              formikProps.setFieldValue("propertyType", value as string)
            }
          />
          <Input
            label="Address*"
            value={values.address}
            onChange={handleChange}
            onBlur={handleBlur}
            name="address"
            placeholder="Enter address"
            inputStyle={styles.add_property_modal_input_section_input}
            inputContainerClass={styles.add_property_modal_input_container}
            error={
              touched.address && errors.address ? errors.address : undefined
            }
          />
          <Input
            label="City*"
            value={values.city}
            onChange={handleChange}
            onBlur={handleBlur}
            name="city"
            placeholder="Enter city"
            inputStyle={styles.add_property_modal_input_section_input}
            inputContainerClass={styles.add_property_modal_input_container}
            error={touched.city && errors.city ? errors.city : undefined}
          />
          <SelectDropDown
            label="Gross Area*"
            options={[
              { label: "Gross Area", value: "Gross Area" },
              { label: "Gross Area 2", value: "Gross Area 2" },
              { label: "Gross Area 3", value: "Gross Area 3" },
            ]}
            selected={values.grossArea}
            onSelect={(value) =>
              formikProps.setFieldValue("grossArea", value as string)
            }
          />
          <Input
            label="Primary Contact Name*"
            value={values.primaryContactName}
            onChange={handleChange}
            onBlur={handleBlur}
            name="primaryContactName"
            placeholder="Enter primary contact name"
            inputStyle={styles.add_property_modal_input_section_input}
            inputContainerClass={styles.add_property_modal_input_container}
            error={
              touched.primaryContactName && errors.primaryContactName
                ? errors.primaryContactName
                : undefined
            }
          />
          <Input
            label="Email*"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            name="email"
            placeholder="Enter email"
            inputStyle={styles.add_property_modal_input_section_input}
            inputContainerClass={styles.add_property_modal_input_container}
            error={touched.email && errors.email ? errors.email : undefined}
          />
          <SelectDropDown
            label="Role"
            options={[
              { label: "Admin", value: "Admin" },
              { label: "User", value: "User" },
              { label: "Client", value: "Client" },
            ]}
            selected={values.role}
            onSelect={(value) =>
              formikProps.setFieldValue("role", value as string)
            }
          />
          <Input
            label="Phone*"
            value={values.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            name="phone"
            placeholder="Enter phone"
            inputStyle={styles.add_property_modal_input_section_input}
            inputContainerClass={styles.add_property_modal_input_container}
            error={touched.phone && errors.phone ? errors.phone : undefined}
          />
        </div>
        <div className={styles.add_property_modal_input_bottom_section}>
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

  return (
    <Modal
      show={show}
      onClose={() => onClose()}
      closeOnOutSideClick={true}
      container_style={styles.add_property_modal_container_style}
      overlay_style={styles.add_property_modal_overlay_style}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={PropertyValidationSchema}
        onSubmit={handleSubmit}
      >
        {(formikProps) => (
          <>
            <div className={styles.add_property_modal_header}>
              <div className={styles.add_property_modal_header_left}>
                <p className={styles.add_property_modal_header_left_text}>
                  Add New Property
                </p>
              </div>
              <Image
                src={closeRoseIcon}
                alt="close"
                className={styles.add_property_modal_header_close_icon}
                onClick={() => handleClose(formikProps.resetForm)}
                style={{ cursor: "pointer" }}
              />
            </div>
            {renderPropertyInfo(formikProps)}
            <div className={styles.add_property_modal_footer}>
              <Button
                title="Cancel"
                className={styles.add_property_modal_footer_button_cancel}
                onClick={() => handleCancel(formikProps.resetForm)}
              />
              <Button
                title="Submit"
                className={styles.add_property_modal_footer_button_submit}
                onClick={() => formikProps.handleSubmit()}
              />
            </div>
          </>
        )}
      </Formik>
    </Modal>
  );
}
