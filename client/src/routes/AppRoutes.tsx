import { Route,Routes,Navigate } from "react-router-dom"
import Dashboard from "../pages/Dashboard";
import LandingPage from "../public/LandingPage";
import ProtectedRoute from "../components/init/ProtectedRoute";
import ProductUploadPage from "../pages/ProductUpload";

import Inventory from "../pages/Inventory";
import POS from "../pages/POS";
import Supplier from "../pages/Supplier";
import InventoryReport from "../pages/InventoryReport";
import History from "../pages/History";
import Setting from "../pages/Setting";
import About from "../pages/About";
import MainLayout from "../layouts/MainLayout";

import InitShop from "../components/init/InitShop";
import { NotificationContainer,useNotification } from "../public/Notify"
const AppRoutes = () => {
    const {notifications} = useNotification();
    return(
        <>
        <NotificationContainer notifications={notifications} />
        <Routes>
            <Route path="/" element={<LandingPage />} />
            
            <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout/>}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/upload" element={<ProductUploadPage/>}></Route>
                    <Route path="/inventory" element={<Inventory/>}></Route>
                    <Route path="/pos" element={<POS/>}></Route>
                    <Route path="/supplier" element={<Supplier/>}></Route>
                    <Route path="/inventory-report" element={<InventoryReport/>}></Route>
                    <Route path="/history" element={<History/>}></Route>
                    <Route path="/setting" element={<Setting/>}></Route>
                    <Route path="/about" element={<About/>}></Route>
                </Route>
            </Route>
            <Route path="/init-shop" element={<InitShop/>}></Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>   
        </>
    )
}
export default AppRoutes;