import React, { createContext, useContext, useState, useEffect } from "react";
import api from './Api';
import axios from 'axios';
import { useAuthState } from './AuthContext';
import Roles from './Roles';

const DataContext = createContext();


export const useData = () => {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error("useData must be used inside DataProvider");
    return ctx;
};


export const useDataState = () => {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error("useDataState must be used inside DataProvider");
    return ctx[0];
}

export const requestBikes = async () => {
    try {
        const response = await api.get("/bikes");
        const bikes = response.data;

        const images = await requestBikeImages(bikes);

        for (const [bikeId, imgs] of Object.entries(images || {})) {
            if (bikes[bikeId]) {
                bikes[bikeId].images = imgs;
            }
        }

        return bikes;
    } catch (err) {
        console.log(err);
        return null;
    }
};

export const requestUser = async () => {
    try {
        const response = await api.get('/users');
        return response.data;
    } catch (err) {
        console.log('requestUser error', err);
        return null;
    }
};

export const requestCases = async () => {
    try {
        const response = await api.get('/cases');
        return response.data;
    } catch (err) {
        console.log('requestCases error', err);
        return null;
    }
};



const requestBikeImages = async (bikes) => {
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

    const [dataContext, setdataContext] = useState({
        bikes: [],
        cases: null,
        user: null
    });

    const authState = useAuthState();

    useEffect(() => {
        const fetchData = async () => {
            const bikeDataPromise = authState.role === Roles.PUBLIC ? requestBikes() : [];
            const userPromise = requestUser();
            const casesPromise = requestCases();

            const [bikeData, userData, casesData] = await Promise.all([bikeDataPromise, userPromise, casesPromise]);

            const bikesArray = Array.isArray(bikeData)
                ? bikeData
                : Object.entries(bikeData || {}).map(([bikeId, bike]) => ({
                    ...bike,
                    bike_id: Number(bikeId),
                }));

            const casesArray = Array.isArray(casesData) ? casesData : Object.values(casesData || {});

            setdataContext({
                bikes: bikesArray,
                cases: casesArray,
                user: userData
            });
        };

        if (authState.role !== Roles.GUEST) {
            fetchData();
        }
    }, [authState.role]);

    return(
        <DataContext.Provider value={[dataContext, setdataContext]}>
            {props.children}
        </DataContext.Provider>
    );

}