import { useState, useEffect } from 'react';

interface PhoneNumberInputProps {
    value: string;
    onPhoneChange: (phone: string) => void;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({ value, onPhoneChange }) => {
    const [phone, setPhone] = useState<string>(value);

    useEffect(() => {
        onPhoneChange(phone);
    }, [phone, onPhoneChange]);

    const formatPhoneNumber = (value: string) => {
        // Remove all non-digit characters
        const cleaned = value.replace(/\D/g, '');

        // Format the cleaned string
        const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);

        if (match) {
            // Construct the phone number with dashes
            const formattedPhone = [match[1], match[2], match[3]]
                .filter(group => group)
                .join('-');

            return formattedPhone;
        }

        return value;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedPhone = formatPhoneNumber(e.target.value);
        setPhone(formattedPhone);
    };

    return (
        <input
            className="auth-input"
            type="text"
            name="phone"
            autoComplete="phone"
            value={phone}
            placeholder="xxx-xxx-xxxx"
            onChange={handlePhoneChange}
            maxLength={12}
            pattern="\d{3}-\d{3}-\d{4}"
            title="Phone number must consist of 10 digits."
        />
    );
}

export default PhoneNumberInput;