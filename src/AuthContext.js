import React, { createContext, useContext, useState } from "react";
import Cookies from "js-cookie";
import Roles from './Roles';

const AuthContext = createContext();


export const useAuth = () => useContext(AuthContext);


export const useAuthState = () => {
    const [state] = useContext(AuthContext);
    return state;
}

export const AuthProvider = props => {

    var role = Cookies.get('role');

    const [authContext, setauthContext] = useState({
        role: Roles.isValid(role) ? role : Roles.GUEST,
        accessToken: null
    });

    return(
        <AuthContext.Provider value={[authContext, setauthContext]}>
            {props.children}
        </AuthContext.Provider>
    );

}