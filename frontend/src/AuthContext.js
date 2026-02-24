import React, {createContext, useContext, useState} from "react";


export const AuthContext = createContext();


export const AuthProvider = props=>{

    const [accessToken, setaccessToken] = useState("");

    return(
        <AuthContext.Provider value={[accessToken, setaccessToken]}>
            {props.children}
        </AuthContext.Provider>
    );

}