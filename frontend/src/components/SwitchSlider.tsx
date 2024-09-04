import { useEffect, useState } from "react";
import "./SwitchSlider.css";

interface SwitchSliderProps {
    initialChecked: boolean;
    onCheck?: (value: boolean) => void;
    isDisabled?: boolean;
}

const SwitchSlider: React.FC<SwitchSliderProps> = ({ initialChecked, onCheck, isDisabled }) => {
    const [on, setOn] = useState<boolean>(initialChecked);

    useEffect(() => {
        setOn(initialChecked);
    }, [initialChecked]);

    const toggleSwitch = () => {
        if (isDisabled) return;
        const newValue = !on;
        setOn(newValue);
        onCheck?.(newValue);
    };

    return (
        <div className="switch-container">
            <label className="switch">
                <input 
                    type="checkbox" 
                    name="build-access" 
                    id="build-access" 
                    checked={on} 
                    onChange={toggleSwitch} 
                />
                <span className={`slider ${isDisabled ? 'slider-disabled' : ''}`}></span>
            </label>
            <div className={`switch-status ${on ? "on" : "off"}`}>
                {on ? "On" : "Off"}
            </div>
        </div>
    );
}

export default SwitchSlider;