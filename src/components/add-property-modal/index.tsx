import React, { useState, useEffect } from 'react'
import Modal from '../ui/modal'
import styles from './styles.module.css'
import { closeRoseIcon } from '@/resources/images';
import Image from 'next/image';
import Input from '../ui/input';
import Button from '../ui/button';

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

export default function AddPropertyModal({ show, onClose }: AddPropertyModalProps) {
  const [formData, setFormData] = useState<PropertyFormData>({
    propertyName: '',
    propertyCode: '',
    propertyType: '',
    address: '',
    city: '',
    grossArea: '',
    primaryContactName: '',
    email: '',
    role: '',
    phone: '',
    description: ''
  });

  const [isFormValid, setIsFormValid] = useState(false);

  // Check if all required fields are filled
  useEffect(() => {
    const requiredFields = [
      formData.propertyName,
      formData.address,
      formData.city,
      formData.grossArea,
      formData.primaryContactName,
      formData.phone,
      formData.description
    ];
    
    const isValid = requiredFields.every(field => field.trim() !== '');
    setIsFormValid(isValid);
  }, [formData]);

  // Reset form data
  const resetForm = () => {
    setFormData({
      propertyName: '',
      propertyCode: '',
      propertyType: '',
      address: '',
      city: '',
      grossArea: '',
      primaryContactName: '',
      email: '',
      role: '',
      phone: '',
      description: ''
    });
  };

  // Handle input changes
  const handleInputChange = (field: keyof PropertyFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // Handle form submission
  const handleSubmit = () => {
    console.log('Form Data:', formData);
    // Here you can add your API call logic
    resetForm();
    onClose();
  };

  // Handle cancel
  const handleCancel = () => {
    resetForm();
    onClose();
  };

  // Handle close icon
  const handleClose = () => {
    resetForm();
    onClose();
  };

    const renderPropertyInfo = () => {
        return (
            <div className={styles.add_property_modal_content}>
                <div className={styles.add_property_modal_input_section}>
                    <Input
                    label="Property name*"
                    value={formData.propertyName}
                    onChange={handleInputChange('propertyName')}
                    placeholder="Enter property name"
                    inputStyle={styles.add_property_modal_input_section_input}
                    />
                    <Input  
                    label="Property Code"
                    value={formData.propertyCode}
                    onChange={handleInputChange('propertyCode')}
                    placeholder="Enter property code"
                    inputStyle={styles.add_property_modal_input_section_input}
                    />
                    <Input
                    label="Property Type"
                    value={formData.propertyType}
                    onChange={handleInputChange('propertyType')}
                    placeholder="Enter property type"
                    inputStyle={styles.add_property_modal_input_section_input}
                    />
                    <Input
                    label="Address*"
                    value={formData.address}
                    onChange={handleInputChange('address')}
                    placeholder="Enter address"
                    inputStyle={styles.add_property_modal_input_section_input}
                    />
                    <Input
                    label="City*"
                    value={formData.city}
                    onChange={handleInputChange('city')}
                    placeholder="Enter city"
                    inputStyle={styles.add_property_modal_input_section_input}
                    />
                    <Input
                    label="Gross Area*"
                    value={formData.grossArea}
                    onChange={handleInputChange('grossArea')}
                    placeholder="Enter gross area"
                    inputStyle={styles.add_property_modal_input_section_input}
                    />
                    <Input
                    label="Primary Contact Name*"
                    value={formData.primaryContactName}
                    onChange={handleInputChange('primaryContactName')}
                    placeholder="Enter primary contact name"
                    inputStyle={styles.add_property_modal_input_section_input}
                    />
                    <Input
                    label="Email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    placeholder="Enter email"
                    inputStyle={styles.add_property_modal_input_section_input}
                    />
                    <Input
                    label="Role"
                    value={formData.role}
                    onChange={handleInputChange('role')}
                    placeholder="Enter role"
                    inputStyle={styles.add_property_modal_input_section_input}
                    />
                    <Input
                    label="Phone*"
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    placeholder="Enter phone"
                    inputStyle={styles.add_property_modal_input_section_input}
                    />
                </div>
                <div className={styles.add_property_modal_input_bottom_section}>
                    <Input
                    label="Description*"
                    value={formData.description}
                    onChange={handleInputChange('description')}
                    placeholder="Add description"
                    inputStyle={styles.add_property_modal_input_section_input}
                    />
                </div>
            </div>
        );
        };
  return (
    <Modal
      show={show}
      onClose={handleClose}
      closeOnOutSideClick={true}
      container_style={styles.add_property_modal_container_style}
      overlay_style={styles.add_property_modal_overlay_style}
    >
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
                onClick={handleClose}
                style={{ cursor: "pointer" }}
            />
        </div>
        {renderPropertyInfo()}
        <div className={styles.add_property_modal_footer}>
        <Button
          title="Cancel"
          className={styles.add_property_modal_footer_button_cancel}
          onClick={handleCancel}
        />
        <Button
          title="Submit"
          className={styles.add_property_modal_footer_button_submit}
          onClick={handleSubmit}
          disabled={!isFormValid}
        />
      </div>
    </Modal>
  )
}