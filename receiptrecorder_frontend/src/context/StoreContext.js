import React, { createContext, useState } from "react";

export const StoreContext = createContext();

export const StoreProvider = ({ children }) =>  {
    const [id, setId] = useState();
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [desc, setDesc] = useState("");

    const reset = () => {
        setId(null);
        setName("");
        setAddress("");
        setDesc("");
    };

    const value = {
        reset: reset,
        id: id,
        setId: setId,
        name: name,
        setName: setName,
        address: address, 
        setAddress: setAddress,
        desc: desc, 
        setDesc: setDesc,
    }

    return (
        <StoreContext.Provider value={value}> 
            {children}
        </StoreContext.Provider>
    )
}