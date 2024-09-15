import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MoonLoader } from "react-spinners";
import CustomSelect from "../components/CustomSelect";
import SwitchSlider from "../components/SwitchSlider";
import { getDeliverySettings, updateDeliverySetting, UserServiceResponse } from "../services/userService";
import "./SettingsOutlet.css"

const SettingsOutlet: React.FC = () => {
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [phone, setPhone] = useState<string | null>(null);
    const [initialFrequency, setInitialFrequency] = useState<string>("");
    const [sendEmails, setSendEmails] = useState<boolean>(false);
    const [sendTexts, setSendTexts] = useState<boolean>(false);
    const [frequencyNote, setFrequencyNote] = useState("");

    const handleFrequencyChange = async (value: string): Promise<boolean> => {
        const oldNote = frequencyNote;

        // Check that new frequency is a valid option
        const selectedOption = frequecyOptions.find(option => option.value === value);
        if (!selectedOption) {
            return false;
        }

        // Update state
        setFrequencyNote(selectedOption.note);

        // Update database
        const response: UserServiceResponse = await updateDeliverySetting("frequency", selectedOption.value);

        // If error, revert state
        if (!response.success) {
            setFrequencyNote(oldNote);
            return false;
        }

        return true;
    };

    const handleEmailChange = async (on: boolean) => {
        // Update state
        setSendEmails(on);

        // Update database
        const response: UserServiceResponse = await updateDeliverySetting("sendEmails", on);

        // If error, revert state
        if (!response.success) {
            setSendEmails(!on);
        }
    }

    const handleTextChange = async (on: boolean) => {
        // Update state
        setSendTexts(on);

        // Update database
        const response: UserServiceResponse = await updateDeliverySetting("sendTexts", on);

        // If error, revert state
        if (!response.success) {
            setSendTexts(!on);
        }
    }

    const frequecyOptions = [
        { value: "DAILY", label: "Once per day", note: "Recommendations will be delivered once per day at 12 PM EST." },
        { value: "THRICE_WEEKLY", label: "Three times per week", note: "Recommendations will be delivered on Mondays, Wednesdays, and Fridays at 12 PM EST." },
        { value: "WEEKLY", label: "Once per week", note: "Recommendations will be delivered every Friday at 12 PM EST." },
        { value: "BIWEEKLY", label: "Twice per Month", note: "Recommendations will be delivered on the first and third Friday of each month at 12 PM EST." },
        { value: "MONTHLY", label: "Once per Month", note: "Recommendations will be delivered on the first Friday of each month at 12 PM EST." }
    ];

    useEffect(() => {
        const fetchUserDeliverySettings = async (): Promise<void> => {
            const response: UserServiceResponse = await getDeliverySettings();
            if (!response.success 
                || typeof response.data?.email !== "string"
                || (response.data?.phone && typeof response.data?.phone !== "string") 
                || typeof response.data?.frequency !== "string" 
                || typeof response.data?.sendEmails !== "boolean" 
                || typeof response.data?.sendTexts !== "boolean" ) {
                setError("Sorry. An error occurred while fetching user delivery settings.");
                return;
            }

            const selectedOption = frequecyOptions.find(option => option.value === response.data.frequency);
            if (selectedOption) {
                setInitialFrequency(selectedOption.value);
                setFrequencyNote(selectedOption.note);
            } else {
                setError("Sorry. An error occurred while fetching user delivery settings.");
                return;
            }

            setEmail(response.data.email);
            if(response.data.phone) setPhone(`${response.data.phone.slice(0, 3)}-${response.data.phone.slice(3, 6)}-${response.data.phone.slice(6)}`);
            setSendEmails(response.data.sendEmails);
            setSendTexts(response.data.sendTexts);
            setIsLoaded(true);
        };

        fetchUserDeliverySettings();
    }, []);

    if (!isLoaded) {
        return (
            <div className="loader">

                { error && `${error}` }

                { !error && <MoonLoader
                    color={"var(--pink-color)"}
                    loading={!isLoaded}
                    size={40}
                    aria-label="Loading Spinner"
                    data-testid="moon-loader"
                /> }
            </div>
        );
    }

    return (
        <div className="settings-container">
            <div className="settings-frequency-container">
                <div className="settings-title">
                    Recommendation Frequency:
                </div>
                <div>
                    <CustomSelect 
                        options={frequecyOptions} 
                        initialValue={initialFrequency}
                        onChange={handleFrequencyChange}
                    />
                </div>
                
            </div>

            <div className="settings-subtitle">
                {frequencyNote}
            </div>

            <hr className="settings-line"/>

            <div className="settings-switch-container">
                <div className="settings-switch">
                    <SwitchSlider initialChecked={sendEmails} onCheck={handleEmailChange}/>
                </div>
                <div className="settings-switch-text">
                    <div className="settings-title settings-switch-title">
                        Deliver Recommendations Via Email
                    </div>
                    <div className="settings-subtitle">
                        Recommendations will be sent to {email}.
                    </div>
                </div>
            </div>

            <hr className="settings-line"/>

            {/* <div className="settings-switch-container">

            {phone ? (
                <>
                    <div className="settings-switch">
                        <SwitchSlider initialChecked={sendTexts} onCheck={handleTextChange} />
                    </div>
                    <div className="settings-switch-text">
                        <div className="settings-title settings-switch-title">
                            Deliver Recommendations Via Text
                        </div>
                        <div className="settings-subtitle">
                            Recommendations will be sent via SMS to {phone}.
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="settings-switch">
                        <SwitchSlider initialChecked={false} isDisabled={true} />
                    </div>
                    <div className="settings-switch-text">
                        <div className="settings-title settings-switch-title settings-title-disabled">
                            Deliver Recommendations Via Text
                        </div>
                        <div className="settings-subtitle">
                            You must have a phone number associated with your account to enable texts.&nbsp;
                            <Link className="settings-subtitle-link" to="/profile">Add one here</Link>.
                        </div>
                    </div>
                </>
            )}

                
            </div>

            <hr className="settings-line"/> */}
            
            <div className="settings-subtitle">
                Note: If email delivery is disabled, recommendations will only be shown on the Songaday Recommendations page.
                In this case, if you do not sign in to your account for 30 days your liked content and attribute preferences will be deleted,
                and you will stop receiving recommendations.
                You can still sign back into your account at any time and reset them manually.
            </div>
        </div>
    );
}

export default SettingsOutlet;