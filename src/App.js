import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import ControlledRoute from './ControlledRoute.js';
import { DataProvider } from './DataContext.js';
import PublicDash from './PublicDashboard.js';
import AddBike from './AddBike.js';
import Login from './Login.js';
import Register from './Register.js'
import Account from './Account.js';
import Cases from './Cases.js';
import CaseDetails from './CaseDetails.js';
import PoliceDashboard from './PoliceDashboard.js';
import Navbar from './Navbar.js';
import AdminDashboard from './AdminDashboard.js';
import EnrolPolice from './EnrolPolice.js';
import Roles from './Roles.js';
import Audits from './Audits.js';

const AppContent = () => {
    const location = useLocation();
    const hideNavbar = ['/login', '/register'].includes(location.pathname);

    return (
        <>
            {!hideNavbar && <Navbar />}
            <Routes>

                <Route element={<ControlledRoute roles={Roles.GUEST}/>}>
                    <Route path='/login' element={<Login/>} />
                    <Route path='/register' element={<Register/>}/>
                </Route>
                
                <Route element={<ControlledRoute roles={Roles.PUBLIC}/>}>
                    <Route path='/' element={<PublicDash/>}/>
                    <Route path='/add-bike' element={<AddBike/>}/>
                    <Route path='/cases' element={<Cases/>}/>
                </Route>

                <Route element={<ControlledRoute roles={Roles.POLICE}/>}>
                    <Route path='/police' element={<PoliceDashboard/>}/>
                    <Route path='/police/case-details' element={<CaseDetails/>}/>
                </Route>
                
                <Route element={<ControlledRoute roles={Roles.ADMIN}/> }>
                    <Route path='/admin' element={<AdminDashboard/>} />
                    <Route path='/admin/audit' element={<Audits/>}/>
                    <Route path='/admin/case-details' element={<CaseDetails/>}/>
                    <Route path='/admin/enrol-police' element={<EnrolPolice/>} />
                </Route>

                <Route element={<ControlledRoute roles={[Roles.PUBLIC, Roles.POLICE, Roles.ADMIN]}/>}> 
                    <Route path='/profile' element={<Account/>}/>
                </Route>

                <Route path='*' element={<Navigate to='/' replace />} />
            
            </Routes>
        </>
    );
};

const App = () => {
    return (
        <DataProvider>
            <Router>
                <AppContent />
            </Router>
        </DataProvider>
    );
}

export default App;