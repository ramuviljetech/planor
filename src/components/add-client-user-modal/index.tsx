import { useState } from "react";

import Image from "next/image";
import {
  accordianDownBlackIcon,
  backButtonIcon,
  closeRoseIcon,
  leftArrowBlackIcon,
  plusRoseIcon,
} from "@/resources/images";
import Input from "../ui/input";
import Button from "../ui/button";
import Modal from "../ui/modal";
import SelectDropDown from "../ui/select-dropdown";
import TextArea from "../ui/textarea";
import styles from "./styles.module.css";
import CustomTabs from "../ui/tabs";

interface AddClientUserModalProps {
  show: boolean;
  onClose: () => void;
}

export default function AddClientUserModal({
  show,
  onClose,
}: AddClientUserModalProps) {
  const [activeTab, setActiveTab] = useState("client");

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  // Client Info Section
  const [clientData, setClientData] = useState({
    clientName: "",
    orgNumber: "",
    industryType: "",
    address: "",
    websiteUrl: "",
    timeZone: "",
    primaryContactName: "",
    email: "",
    role: "",
    phone: "",
    description: "",
  });

  const [users, setUsers] = useState<
    Array<{ id: number; name: string; contact: string; email: string }>
  >([]);
  const [newUser, setNewUser] = useState({ name: "", contact: "", email: "" });

  const isUserFormValid =
    newUser.name.trim() !== "" &&
    newUser.contact.trim() !== "" &&
    newUser.email.trim() !== "";
  const isClientFormValid =
    clientData.clientName.trim() !== "" &&
    clientData.industryType.trim() !== "" &&
    clientData.address.trim() !== "" &&
    clientData.websiteUrl.trim() !== "" &&
    clientData.timeZone.trim() !== "" &&
    clientData.primaryContactName.trim() !== "" &&
    clientData.phone.trim() !== "" &&
    clientData.description.trim() !== "";

  const handleAddUser = () => {
    if (newUser.name && newUser.contact && newUser.email) {
      setUsers([...users, { id: Date.now(), ...newUser }]);
      setNewUser({ name: "", contact: "", email: "" });
    }
  };

  const handleSubmit = () => {
    if (activeTab === "client") {
      console.log("Client Data:", clientData);
      setActiveTab("user");
    } else {
      console.log("Users Data:", users);
      setClientData({
        clientName: "",
        orgNumber: "",
        industryType: "",
        address: "",
        websiteUrl: "",
        timeZone: "",
        primaryContactName: "",
        email: "",
        role: "",
        phone: "",
        description: "",
      });
      setUsers([]);
      setNewUser({ name: "", contact: "", email: "" });
      setActiveTab("client");
      onClose();
    }
  };

  const renderClinetInfo = () => {
    return (
      <div className={styles.client_info_section}>
        <div className={styles.client_info_section_input_section}>
          <Input
            label="Client name*"
            value={clientData.clientName}
            onChange={(e) =>
              setClientData({ ...clientData, clientName: e.target.value })
            }
            placeholder="Enter client name"
            inputStyle={styles.client_info_section_input_section_input}
          />
          <Input
            label="Org Number"
            value={clientData.orgNumber}
            onChange={(e) =>
              setClientData({ ...clientData, orgNumber: e.target.value })
            }
            placeholder="Enter org number"
            inputStyle={styles.client_info_section_input_section_input}
          />
          <SelectDropDown
            label="Industry Type*"
            options={[
              { label: "Industry Type", value: "Industry Type" },
              { label: "Industry Type 2", value: "Industry Type 2" },
              { label: "Industry Type 3", value: "Industry Type 3" },
            ]}
            selected={clientData.industryType}
            onSelect={(value) =>
              setClientData({ ...clientData, industryType: value as string })
            }
          />
          <Input
            label="Address*"
            value={clientData.address}
            onChange={(e) =>
              setClientData({ ...clientData, address: e.target.value })
            }
            placeholder="Enter address"
            inputStyle={styles.client_info_section_input_section_input}
          />
          <Input
            label="Website URL*"
            value={clientData.websiteUrl}
            onChange={(e) =>
              setClientData({ ...clientData, websiteUrl: e.target.value })
            }
            placeholder="Enter website url"
            inputStyle={styles.client_info_section_input_section_input}
          />
          <SelectDropDown
            label="Status*"
            options={[
              { label: "Active", value: "Active" },
              { label: "Inactive", value: "Inactive" },
            ]}
            selected={clientData.timeZone}
            onSelect={(value) =>
              setClientData({ ...clientData, timeZone: value as string })
            }
          />
          <Input
            label="Primary Contact Name*"
            value={clientData.primaryContactName}
            onChange={(e) =>
              setClientData({
                ...clientData,
                primaryContactName: e.target.value,
              })
            }
            placeholder="Enter primary contact name"
            inputStyle={styles.client_info_section_input_section_input}
          />
          <Input
            label="Email"
            value={clientData.email}
            onChange={(e) =>
              setClientData({ ...clientData, email: e.target.value })
            }
            placeholder="Enter email"
            inputStyle={styles.client_info_section_input_section_input}
          />
          <SelectDropDown
            label="Role*"
            options={[
              { label: "Admin", value: "Admin" },
              { label: "Client", value: "Client" },
              { label: "User", value: "User" },
            ]}
            selected={clientData.role}
            onSelect={(value) =>
              setClientData({ ...clientData, role: value as string })
            }
          />
          <Input
            label="Phone*"
            value={clientData.phone}
            onChange={(e) =>
              setClientData({ ...clientData, phone: e.target.value })
            }
            placeholder="Enter phone"
            inputStyle={styles.client_info_section_input_section_input}
          />
        </div>
        <div className={styles.client_info_input_bottom_section}>
          <TextArea
            label="Description*"
            value={clientData.description}
            onChange={(e) =>
              setClientData({ ...clientData, description: e.target.value })
            }
            placeholder="Enter description"
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
            onClick={() => {
              // Reset all form data
              setClientData({
                clientName: "",
                orgNumber: "",
                industryType: "",
                address: "",
                websiteUrl: "",
                timeZone: "",
                primaryContactName: "",
                email: "",
                role: "",
                phone: "",
                description: "",
              });
              setUsers([]);
              setNewUser({ name: "", contact: "", email: "" });
              setActiveTab("client");
              onClose();
            }}
            style={{ cursor: "pointer" }}
          />
        </div>

        <div className={styles.client_user_modal_tabs}>
          <CustomTabs
            tabs={[
              { label: "Add client info", value: "client" },
              { label: "Add users", value: "user" },
            ]}
            defaultTab={activeTab}
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
        {activeTab === "client" ? renderClinetInfo() : renderUserInfo()}
      </div>
      <div className={styles.client_user_modal_footer}>
        <Button
          title="Cancel"
          className={styles.client_user_modal_footer_button_cancel}
          onClick={() => {
            // Reset all form data
            setClientData({
              clientName: "",
              orgNumber: "",
              industryType: "",
              address: "",
              websiteUrl: "",
              timeZone: "",
              primaryContactName: "",
              email: "",
              role: "",
              phone: "",
              description: "",
            });
            setUsers([]);
            setNewUser({ name: "", contact: "", email: "" });
            setActiveTab("client");
            onClose();
          }}
        />
        <Button
          title={activeTab === "client" ? "Save & Continue" : "Submit"}
          className={styles.client_user_modal_footer_button_submit}
          onClick={handleSubmit}
          disabled={
            (activeTab === "user" && !isUserFormValid) ||
            (activeTab === "client" && !isClientFormValid)
          }
        />
      </div>
    </Modal>
  );
}
