import { Outlet } from "react-router-dom";
import ContentRadioButtons from "../components/ContentRadioButtons";

const ContentOutlet: React.FC = () => {

    return (
        <div>
            <ContentRadioButtons />
            <div>
                <Outlet /> {/* Render matched child route */}
            </div>    
        </div>
        
    );
}

export default ContentOutlet;