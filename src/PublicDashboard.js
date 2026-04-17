import React, { useState, useEffect } from 'react';
import { useDataState, requestUserData } from './DataContext';

const PublicDash = () => {

    const [cardList, setcardList] = useState([]);

    const userData = useDataState();

    useEffect(() => {
        if (userData) {
            setcardList(
                Object.keys(userData).map(bike_id => 
                    <li>
                        <div class="card">
                            <img src={`data:;base64,${userData.bikes[bike_id].images[0]}`} alt="Bike"/>
                            <h4><b>{userData.bikes[bike_id].model}</b></h4>
                        </div>
                    </li>
                )
            );
        }
    }, [userData]);

    useEffect(() => {
        requestUserData();
    }, [])

    return ( 
        <div className="Dashboard">
            <ul>{cardList}</ul>
        </div>
    );
};

export default PublicDash;