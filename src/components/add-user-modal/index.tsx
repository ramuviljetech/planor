import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Modal from "../ui/modal";
import styles from "./styles.module.css";
import { closeRoseIcon, plusRoseIcon } from "@/resources/images";
import Image from "next/image";
import Button from "../ui/button";
import Input from "../ui/input";

interface AddUserModalProps {
    show: boolean;
    onClose: () => void;
}

// Validation schema
const UserSchema = Yup.object().shape({
    name: Yup.string()
        .required("Name is required"),
    contact: Yup.string()
        .matches(/^[0-9+\-\s()]+$/, "Contact must contain only numbers")
        .required("Contact is required"),
    email: Yup.string()
        .email("Invalid email format")
        .required("Email is required"),
});

export default function AddUserModal({ show, onClose }: AddUserModalProps) {

    const [users, setUsers] = useState<any[]>([]);

    // Reset all data
    const resetData = () => {
        setUsers([]);
    };

    // Handle form submission
    const handleSubmit = (values: any, { resetForm }: any) => {
        console.log("Form Values:", values);
        console.log("Users Data:", users);

        // Add current form data to users if it's valid
        const finalUsers = [...users, { id: Date.now(), ...values }];
        console.log("Final Users Data:", finalUsers);

        resetForm();
        resetData();
        onClose();
    };

    // Handle cancel
    const handleCancel = (resetForm: () => void) => {
        resetForm();
        resetData();
        onClose();
    };

    // Handle close icon
    const handleClose = (resetForm: () => void) => {
        resetForm();
        resetData();
        onClose();
    };

    const handleAddUser = (values: any, { resetForm }: any) => {
        console.log("Adding user:", values);
        setUsers([...users, { id: Date.now(), ...values }]);
        resetForm();
    };

    const renderAddUserModal = (formikProps: any) => {
        const { values, errors, touched, handleChange, handleBlur, isValid } = formikProps;

        return (
            <div className={styles.user_modal}>
                {/* Table with Header and Data */}
                <table className={styles.user_modal_table}>
                    <thead className={styles.user_modal_table_header}>
                        <tr className={styles.user_modal_table_header_row}>
                            <th className={styles.user_modal_table_header_cell}>
                                User Name
                            </th>
                            <th className={styles.user_modal_table_header_cell}>
                                Contact
                            </th>
                            <th className={styles.user_modal_table_header_cell}>
                                Email
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className={styles.user_modal_table_row}>
                                <td className={styles.user_modal_table_cell}>
                                    {user.name}
                                </td>
                                <td className={styles.user_modal_table_cell}>
                                    {user.contact}
                                </td>
                                <td className={styles.user_modal_table_cell}>
                                    {user.email}
                                </td>
                            </tr>
                        ))}
                        {/* Input Row */}
                        <tr className={styles.user_modal_table_input_row}>
                            <td className={styles.user_modal_table_cell}>
                                <Input
                                    label=""
                                    placeholder="Enter here"
                                    name="name"
                                    value={values.name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    inputStyle={styles.user_modal_input}
                                    inputContainerClass={styles.user_modal_input_container}
                                    inputWrapperClass={styles.user_modal_input_wrapper}
                                />
                                {errors.name && touched.name && (
                                    <div className={styles.add_user_modal_error_message}>
                                        {errors.name}
                                    </div>
                                )}

                            </td>
                            <td className={styles.user_modal_table_cell}>

                                <Input
                                    label=""
                                    placeholder="Enter here"
                                    name="contact"
                                    value={values.contact}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    inputStyle={styles.user_modal_input}
                                    inputContainerClass={styles.user_modal_input_container}
                                    inputWrapperClass={styles.user_modal_input_wrapper}
                                />
                                {errors.contact && touched.contact && (
                                    <div className={styles.add_user_modal_error_message}>
                                        {errors.contact}
                                    </div>
                                )}

                            </td>
                            <td className={styles.user_modal_table_cell}>

                                <Input
                                    label=""
                                    placeholder="Enter here"
                                    name="email"
                                    value={values.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    inputStyle={styles.user_modal_input}
                                    inputContainerClass={styles.user_modal_input_container}
                                    inputWrapperClass={styles.user_modal_input_wrapper}
                                />
                                {errors.email && touched.email && (
                                    <div className={styles.add_user_modal_error_message}>
                                        {errors.email}
                                    </div>
                                )}

                            </td>
                        </tr>
                    </tbody>
                </table>
                <div className={styles.user_modal_add_button}>
                    <Button
                        title="Add User"
                        className={styles.user_modal_add_button_button}
                        onClick={() => handleAddUser(values, formikProps)}
                        icon={plusRoseIcon}
                        iconContainerClass={styles.user_modal_add_button_icon}
                        disabled={!isValid || !values.name || !values.contact || !values.email}
                    />
                </div>
            </div>
        );
    };

    return (
        <>
            <Modal
                show={show}
                onClose={() => handleClose(() => { })}
                closeOnOutSideClick={true}
                container_style={styles.add_user_modal_container_style}
                overlay_style={styles.add_user_modal_overlay_style}
            >
                <Formik
                    initialValues={{
                        name: "",
                        contact: "",
                        email: ""
                    }}
                    validationSchema={UserSchema}
                    onSubmit={handleSubmit}
                >
                    {(formikProps) => (
                        <>
                            <div className={styles.add_user_modal_header}>
                                <div className={styles.add_user_modal_header_top}>
                                    <div className={styles.add_user_modal_header_left}>
                                        <p className={styles.add_user_modal_header_left_text}>
                                            Add New User
                                        </p>
                                    </div>
                                    <Image
                                        src={closeRoseIcon}
                                        alt="close"
                                        className={styles.add_user_modal_header_close_icon}
                                        onClick={() => handleClose(formikProps.resetForm)}
                                        style={{ cursor: "pointer" }}
                                    />
                                </div>
                            </div>
                            <div className={styles.add_user_modal_content}>
                                {renderAddUserModal(formikProps)}
                            </div>
                            <div className={styles.add_user_modal_footer}>
                                <Button
                                    title="Cancel"
                                    variant="plain"
                                    onClick={() => handleCancel(formikProps.resetForm)}
                                />
                                <Button
                                    title="Submit"
                                    className={styles.add_user_modal_footer_button_submit}
                                    onClick={() => formikProps.handleSubmit()}
                                    disabled={!formikProps.isValid || (!formikProps.values.name && !formikProps.values.contact && !formikProps.values.email && users.length === 0)}
                                />
                            </div>
                        </>
                    )}
                </Formik>
            </Modal>
        </>
    )
}