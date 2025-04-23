import React, { createContext, useState } from "react";

export const ItemContext = createContext();

export const ItemProvider = ({ children }) =>  {
    const [id, setId] = useState();
    const [name, setName] = useState("");
    const [unit, setUnit] = useState("");
    const [desc, setDesc] = useState("");

    const reset = () => {
        setId(null);
        setName("");
        setUnit("");
        setDesc("");
    };

    const value = {
        reset: reset,
        id: id,
        setId: setId,
        name: name,
        setName: setName,
        unit: unit, 
        setUnit: setUnit,
        desc: desc, 
        setDesc: setDesc,
    }

    return (
        <ItemContext.Provider value={value}> 
            {children}
        </ItemContext.Provider>
    )
}