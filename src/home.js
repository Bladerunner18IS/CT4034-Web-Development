import React, { useState, useEffect } from 'react';
import { useAuthState } from './AuthContext';
import api from './Api';


const Home = () => {

    const [bikeList, setbikeList] = useState([]);

    useEffect(() => {
        console.log(bikeList);
    }, [bikeList]);
    
    api.get("/home")
        .then(data => {
            setbikeList(data);
        })
        .catch(error => {
            console.log(error);
        });

    return ( 
        <div className="Home">
            <h2>Home</h2>
        </div>
    );
};

export default Home;