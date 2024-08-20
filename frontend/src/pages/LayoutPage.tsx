import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "./LayoutPage.css";

const LayoutPage: React.FC = () => {
    return (
        <div className="app-container">
            <Header />
            <div className="main-content">
                <Sidebar />
                <div className="content">
                    <Outlet /> {/* Render matched child route */}
                </div>
            </div>
        </div>
    );
};

export default LayoutPage;