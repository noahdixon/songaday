import { Outlet, useLocation } from "react-router-dom";
import { MoonLoader } from "react-spinners";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useUserContent } from "../context/UserContentContext";
import "../global.css"
import "./LayoutPage.css";

const LayoutPage: React.FC = () => {
    const { isLoaded, errorMessage } = useUserContent();
    const location = useLocation();

    const shouldDisableScroll: boolean = location.pathname.startsWith('/search') || 
                                         location.pathname.startsWith('/content') || 
                                         location.pathname.startsWith('/recommendations');


    return (
        <div className={`app-container ${shouldDisableScroll ? 'no-scroll' : ''}`}>
            <Header />
            <div className="main-content">
                <Sidebar />
                <div className="content">
                    {!errorMessage && isLoaded && <Outlet />} {/* Render matched child route */}
                    {!isLoaded && 
                        <div className="loader">
                            {!errorMessage &&
                                <MoonLoader
                                    color={"var(--pink-color)"}
                                    loading={!isLoaded}
                                    size={40}
                                    aria-label="Loading Spinner"
                                    data-testid="moon-loader"
                                /> 
                            }
                            {errorMessage && `${errorMessage}`}
                        </div> 
                    }
                </div>
            </div>
        </div>
    );
};

export default LayoutPage;