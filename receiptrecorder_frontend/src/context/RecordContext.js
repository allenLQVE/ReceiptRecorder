import React, { createContext, useState } from "react";

export const RecordContext = createContext();

export const RecordProvider = ({ children }) =>  {
    const [id, setId] = useState();
    const [item, setItem] = useState('');
    const [store, setStore] = useState('');
    const [purchaseDate, setPurchaseDate] = useState();
    const [price, setPrice] = useState(0);
    const [saving, setSaving] = useState(0);
    const [units, setUnits] = useState(1);
    const [detail, setDetail] = useState('');

    const reset = () => {
        setId(null);
        setItem('');
        setStore('');
        setPurchaseDate(null);
        setPrice(0);
        setSaving(0);
        setUnits(1);
        setDetail('');
    };

    const value = {
        reset: reset,
        id: id,
        setId: setId,
        item: item,
        setItem: setItem, 
        store: store, 
        setStore: setStore, 
        purchaseDate: purchaseDate, 
        setPurchaseDate: setPurchaseDate,
        price: price, 
        setPrice: setPrice,
        saving: saving, 
        setSaving: setSaving,
        units: units, 
        setUnits: setUnits,
        detail: detail, 
        setDetail: setDetail,
    }

    return (
        <RecordContext.Provider value={value}> 
            {children}
        </RecordContext.Provider>
    )
}