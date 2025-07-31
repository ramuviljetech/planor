import { useState } from "react";
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

interface AddClientUserModalProps {
  show: boolean;
  onClose: () => void;
}

interface ClientFormData {
  clientName: string;
  orgNumber: string;
  industryType: string;
  address: string;
  websiteUrl: string;
  status: string;
  primaryContactName: string;
  email: string;
  role: string;
  phone: string;
  description: string;
}

// Validation schema using Yup
const ClientValidationSchema = Yup.object().shape({
  clientName: Yup.string().required("Client name is required"),
  orgNumber: Yup.string(),
  industryType: Yup.string().required("Industry type is required"),
  address: Yup.string().required("Address is required"),
  websiteUrl: Yup.string()
    .required("Website URL is required")
    .url("Invalid website URL format"),
  status: Yup.string().required("Status is required"),
  primaryContactName: Yup.string().required("Primary contact name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .when("$isEmailRequired", {
      is: true,
      then: (schema) => schema.required("Email is required"),
      otherwise: (schema) => schema.optional(),
    }),
  role: Yup.string().required("Role is required"),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(/^[\+]?[1-9][\d]{0,15}$/, "Phone number must be a valid number"),
  description: Yup.string().required("Description is required"),
});

const initialValues: ClientFormData = {
  clientName: "",
  orgNumber: "",
  industryType: "",
  address: "",
  websiteUrl: "",
  status: "",
  primaryContactName: "",
  email: "",
  role: "",
  phone: "",
  description: "",
};

export default function AddClientUserModal({
  show,
  onClose,
}: AddClientUserModalProps) {
  const [activeTab, setActiveTab] = useState("client");

  const handleTabClick = () => {
    if (activeTab === "user") {
      setActiveTab("client");
    }
  };

  const [users, setUsers] = useState<
    Array<{ id: number; name: string; contact: string; email: string }>
  >([]);
  const [newUser, setNewUser] = useState({ name: "", contact: "", email: "" });

  const isUserFormValid =
    newUser.name.trim() !== "" &&
    newUser.contact.trim() !== "" &&
    newUser.email.trim() !== "";

  // Handle form submission
  const handleSubmit = (
    values: ClientFormData,
    { setSubmitting, resetForm }: any
  ) => {
    if (activeTab === "client") {
      console.log("Client Data:", values);
      setActiveTab("user");
    } else {
      console.log("Users Data:", users);
      resetForm();
      setUsers([]);
      setNewUser({ name: "", contact: "", email: "" });
      setActiveTab("client");
      onClose();
    }
    setSubmitting(false);
  };

  // Handle cancel
  const handleCancel = (resetForm: () => void) => {
    resetForm();
    setUsers([]);
    setNewUser({ name: "", contact: "", email: "" });
    setActiveTab("client");
    onClose();
  };

  // Handle close icon
  const handleClose = (resetForm: () => void) => {
    resetForm();
    setUsers([]);
    setNewUser({ name: "", contact: "", email: "" });
    setActiveTab("client");
    onClose();
  };

  const handleAddUser = () => {
    if (newUser.name && newUser.contact && newUser.email) {
      setUsers([...users, { id: Date.now(), ...newUser }]);
      setNewUser({ name: "", contact: "", email: "" });
    }
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
            value={values.orgNumber}
            onChange={handleChange}
            onBlur={handleBlur}
            name="orgNumber"
            placeholder="Enter org number"
            inputStyle={styles.client_info_section_input_section_input}
            error={
              touched.orgNumber && errors.orgNumber
                ? errors.orgNumber
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
              { label: "Active", value: "Active" },
              { label: "Inactive", value: "Inactive" },
            ]}
            selected={values.status}
            onSelect={(value) =>
              formikProps.setFieldValue("status", value as string)
            }
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
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            name="email"
            placeholder="Enter email"
            inputStyle={styles.client_info_section_input_section_input}
            error={touched.email && errors.email ? errors.email : undefined}
          />
          <SelectDropDown
            label="Role*"
            options={[
              { label: "Admin", value: "Admin" },
              { label: "Client", value: "Client" },
              { label: "User", value: "User" },
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
            inputStyle={styles.client_info_section_input_section_input}
            error={touched.phone && errors.phone ? errors.phone : undefined}
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
        {/* Table with Header and Data */}
        <table className={styles.user_info_section_table}>
          <thead className={styles.user_info_section_table_header}>
            <tr className={styles.user_info_section_table_header_row}>
              <th className={styles.user_info_section_table_header_cell}>
                User Name
              </th>
              <th className={styles.user_info_section_table_header_cell}>
                Contact
              </th>
              <th className={styles.user_info_section_table_header_cell}>
                Email
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className={styles.user_info_section_table_row}>
                <td className={styles.user_info_section_table_cell}>
                  {user.name}
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
                <Input
                  label=""
                  placeholder="Enter here"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  inputStyle={styles.user_info_section_input}
                  inputContainerClass={styles.user_info_section_input_container}
                  inputWrapperClass={styles.user_info_section_input_wrapper}
                />
              </td>
              <td className={styles.user_info_section_table_cell}>
                <Input
                  label=""
                  placeholder="Enter here"
                  value={newUser.contact}
                  onChange={(e) =>
                    setNewUser({ ...newUser, contact: e.target.value })
                  }
                  inputStyle={styles.user_info_section_input}
                  inputContainerClass={styles.user_info_section_input_container}
                  inputWrapperClass={styles.user_info_section_input_wrapper}
                />
              </td>
              <td className={styles.user_info_section_table_cell}>
                <Input
                  label=""
                  placeholder="Enter here"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  inputStyle={styles.user_info_section_input}
                  inputContainerClass={styles.user_info_section_input_container}
                  inputWrapperClass={styles.user_info_section_input_wrapper}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <div className={styles.user_info_section_add_button}>
          <Button
            title="Add User"
            className={styles.user_info_section_add_button_button}
            onClick={handleAddUser}
            icon={plusRoseIcon}
            iconContainerClass={styles.user_info_section_add_button_icon}
          />
        </div>
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
                    formikProps.handleSubmit();
                  } else {
                    handleSubmit(formikProps.values, {
                      setSubmitting: () => {},
                      resetForm: formikProps.resetForm,
                    });
                  }
                }}
                disabled={
                  (activeTab === "user" && !isUserFormValid) ||
                  (activeTab === "client" &&
                    (!formikProps.isValid || formikProps.isSubmitting))
                }
              />
            </div>
          </>
        )}
      </Formik>
    </Modal>
  );
}
