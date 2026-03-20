import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute.js';
import Home from './home.js';
import Login from './login.js';
import Register from './register.js'
import GuestRoute from './GuestRoute.js';

const App = () => {
  return (
    <Router>
      <nav>
        <Link to="/">Home</Link> |{" "}
        <Link to="/login">Login</Link> |{" "}
      </nav>

      <Routes>
        <Route element={<PrivateRoute/>}>
          <Route path='/' element={<Home/>}/>
          <Route path='/police'/>
          <Route path='/admin'/>
        </Route>

        <Route element={<GuestRoute/>}>
          <Route path='/login' element={<Login/>} />
          <Route path='/register' element={<Register/>}/>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;