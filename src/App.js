import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import Home from './home';
import Login from './login.js';

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

        <Route path='/login' element={<Login/>} />
        <Route path='/register'/>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;