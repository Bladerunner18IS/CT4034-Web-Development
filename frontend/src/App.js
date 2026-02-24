import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
// import PrivateRoute from './PrivateRoute';
// import Home from './home';
import Login from './login';

const App = () => {
  return (
    <Router>
      <nav>
        <Link to="/">Home</Link> |{" "}
        <Link to="/login">Login</Link> |{" "}
      </nav>

      <Routes>
        <Route index/>
        <Route path='/login' element={<Login/>} />
      </Routes>
    </Router>
  );
}

export default App;