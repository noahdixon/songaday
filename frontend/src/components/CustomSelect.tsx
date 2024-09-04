import React, { useState, useRef, useEffect } from "react";
import "./CustomSelect.css";

interface Option {
    value: string;
    label: string;
}

interface CustomSelectProps {
    options: Option[];
    placeholder?: string;
    initialValue?: string;
    onChange: (value: string) => Promise<boolean>;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, placeholder = "Select an option", initialValue, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<Option | null>(
        initialValue ? options.find(option => option.value === initialValue) || null : null
    );
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleSelect = async (option: Option) => {
        setIsOpen(false);
        // Check if option did not change
        if(option.value === selectedOption?.value) {
            return;
        }
        const oldOption = selectedOption;
        setSelectedOption(option);
        if (!(await onChange(option.value))) {
            setSelectedOption(oldOption);
        }
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
    
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (
        <div className="custom-select-container" ref={dropdownRef}>
            <div 
            className={`custom-select-trigger ${isOpen ? "open" : ""}`}
            onClick={() => setIsOpen(!isOpen)}
            > 
            {selectedOption ? selectedOption.label : placeholder}
            <span className={`arrow ${isOpen ? "up" : "down"}`}></span>
        </div>
        {isOpen && (
            <div className="custom-select-options">
            {options.map((option) => (
                <div
                key={option.value}
                className="custom-select-option"
                onClick={() => handleSelect(option)}
                >
                {option.label}
                </div>
            ))}
            </div>
        )}
        </div>
    );
};

export default CustomSelect;