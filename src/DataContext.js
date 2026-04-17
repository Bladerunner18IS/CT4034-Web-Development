import React, { createContext, useContext, useState } from "react";
import api from './Api';
import axios from 'axios';

const DataContext = createContext();


export const useData = () => useContext(DataContext);


export const useDataState = () => {
    const [state] = useContext(DataContext);
    return state;
}

export const requestUserData = () => {

    api.get("/bikes")
        .then(response => {
            const bikes = response.data;
            
            console.log(bikes);
            requestImages(bikes).then(images => {
                for (const [bikeId, imgs] of Object.entries(images || {})) {
                    if (bikes[bikeId]) {
                        bikes[bikeId].images = imgs;
                    }
                }
                console.log('bikes with images', bikes);

                return bikes;

            }).catch(err => console.log(err));
        })
        .catch(error => {
            console.log(error);
        });
}

const requestImages = async (bikes) => {
    const images = {};

    const bikeEntries = Object.entries(bikes || {});
    const promises = bikeEntries.map(async ([bikeId, bike]) => {
        const urls = (bike.images || []).map(
            (image) => `/images/bikes/${bikeId}/${image.image_filename}`
        );

        if (urls.length === 0) {
            images[bikeId] = [];
            return;
        }

        const requests = urls.map(url => api.get(url, { responseType: 'arraybuffer' }));
        const responses = await axios.all(requests);

        const base64Array = responses.map(response => {
            const binary = new Uint8Array(response.data).reduce(
                (data, byte) => data + String.fromCharCode(byte),
                ''
            );
            return btoa(binary);
        });

        images[bikeId] = base64Array;
    });

    await Promise.all(promises);
    return images;
};

export const DataProvider = props => {

    const [dataContext, setdataContext] = useState(requestUserData());

    return(
        <DataContext.Provider value={[dataContext, setdataContext]}>
            {props.children}
        </DataContext.Provider>
    );

}