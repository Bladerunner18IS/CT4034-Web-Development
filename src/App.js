import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ControlledRoute from './ControlledRoute.js';
import { DataProvider } from './DataContext.js';
import PublicDash from './PublicDashboard.js';
import Login from './Login.js';
import Register from './Register.js'
import Navbar from './Navbar.js';
import Roles from './Roles.js'

const App = () => {
  return (
    <DataProvider>
      <Router>
        
        <Navbar/>

        <Routes>

          <Route element={<ControlledRoute roles={Roles.GUEST}/>}>
            <Route path='/login' element={<Login/>} />
            <Route path='/register' element={<Register/>}/>
          </Route>
          
          <Route element={<ControlledRoute roles={Roles.PUBLIC}/>}>
            <Route path='/' element={<PublicDash/>}/>
            <Route path='/cases'/>
          </Route>

          <Route element={<ControlledRoute roles={Roles.POLICE}/>}>
            <Route path='/police'/>
            <Route path='/police/cases'/>
          </Route>

          <Route element={<ControlledRoute roles={Roles.ADMIN}/>}>
            <Route path='/admin'/>
            <Route path='/admin/users'/>
            <Route path='/admin/cases'/>
            <Route path='/admin/data'/>
          </Route>

          <Route element={<ControlledRoute roles={[Roles.PUBLIC, Roles.POLICE, Roles.ADMIN]}/>}>
            <Route path='/profile'/>
          </Route>

          <Route path='*' element={<Navigate to='/' replace />} />
        
        </Routes>
      </Router>
    </DataProvider>
  );
}

export default App;