import React, { createContext, useContext, useState } from "react";
import Cookies from "js-cookie"

const AuthContext = createContext();


export const useAuth = () => useContext(AuthContext);


export const useAuthState = () => {
    const [state] = useContext(AuthContext);
    return state;
}

export const AuthProvider = props => {

    console.log(Cookies.get('loggedIn'));
    const [authContext, setauthContext] = useState({
        loggedIn: Boolean(Cookies.get('loggedIn')),
        accessToken: null
    });

    return(
        <AuthContext.Provider value={[authContext, setauthContext]}>
            {props.children}
        </AuthContext.Provider>
    );

}