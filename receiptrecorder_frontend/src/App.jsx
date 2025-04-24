import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './App.css';

import { RecordTable } from './components/RecordTable';
import { ItemTable } from './components/ItemTable';
import { StoreTable } from './components/StoreTable';

import { RecordModal } from './components/RecordModal';
import { ItemModal } from './components/ItemModal';
import { StoreModal } from './components/StoreModal';

import { RecordProvider } from './context/RecordContext';
import { ItemProvider } from './context/ItemContext';
import { StoreProvider } from './context/StoreContext';

function App() {
    const URL = process.env.REACT_APP_API_URL;
    const navigate = useNavigate();

    // data from api
    const [records, setRecords] = useState();
    const [items, setItems] = useState();
    const [stores, setStores] = useState();

    // control tables
    const [recordTable, setRecordTable] = useState(true);
    const [itemTable, setItemTable] = useState(false);
    const [storeTable, setStoreTable] = useState(false);

    // Modal for creating/editing record
    const [recordModal, setRecordModal] = useState(false);
    const [itemModal, setItemModal] = useState(false);
    const [storeModal, setStoreModal] = useState(false);
    const [isCreate, setIsCreate] = useState(true);

    // loading data from api
    useEffect(() => {
        axios.get(URL + 'records/').then(
            response => {
                setRecords(response.data);
            }
        ).catch(error => {
            console.error(error);
        })
        axios.get(URL + 'items/').then(
            response => {
                setItems(response.data);
            }
        ).catch(error => {
            console.error(error);
        })
        axios.get(URL + 'stores/').then(
            response => {
                setStores(response.data);
            }
        ).catch(error => {
            console.error(error);
        })
    }, [])

    // toggle for modals
    const toggleRecordModal = () => setRecordModal(!recordModal);
    const toggleItemModal = () => setItemModal(!itemModal);
    const toggleStoreModal = () => setStoreModal(!storeModal);

    // open modal for creating new object
    const createModal = () => {
        setIsCreate(true)
        if(recordTable){
            toggleRecordModal();
        } else if (itemTable){
            toggleItemModal();
        } else if (storeTable){
            toggleStoreModal();
        }
    }

    // open modal for editing
    const editRecordModal = () => {
        setIsCreate(false);
        toggleRecordModal();
    }
    const editItemModal = () => {
        setIsCreate(false);
        toggleItemModal();
    }
    const editStoreModal = () => {
        setIsCreate(false);
        toggleStoreModal();
    }

    // open a spesific table and hiding others
    const openRecordTable = () => {
        if(recordTable){
            return;
        }
        const recordTableTag = document.getElementById("recordTableTag");
        recordTableTag.classList.remove("text-muted");
        const storeTableTag = document.getElementById("storeTableTag");
        storeTableTag.classList.add("text-muted");
        const itemTableTag = document.getElementById("itemTableTag");
        itemTableTag.classList.add("text-muted");

        setStoreTable(false);
        setItemTable(false);
        setRecordTable(true);
    }
    const openItemTable = () => {
        if(itemTable){
            return;
        }
        const recordTableTag = document.getElementById("recordTableTag");
        recordTableTag.classList.add("text-muted");
        const storeTableTag = document.getElementById("storeTableTag");
        storeTableTag.classList.add("text-muted");
        const itemTableTag = document.getElementById("itemTableTag");
        itemTableTag.classList.remove("text-muted");

        setStoreTable(false);
        setItemTable(true);
        setRecordTable(false);
    }
    const openStoreTable = () => {
        if(storeTable){
            return;
        }
        const recordTableTag = document.getElementById("recordTableTag");
        recordTableTag.classList.add("text-muted");
        const storeTableTag = document.getElementById("storeTableTag");
        storeTableTag.classList.remove("text-muted");
        const itemTableTag = document.getElementById("itemTableTag");
        itemTableTag.classList.add("text-muted");

        setStoreTable(true);
        setItemTable(false);
        setRecordTable(false);
    }

    return (
        <RecordProvider><ItemProvider><StoreProvider>
            <div className='container'>
                <div className='records'>
                    <div className='container'>
                        <nav className='navbar navbar-default navbar-fixed-top pl-0'>
                            <div className='container pl-0'>
                                <div className="navbar-header">
                                    <button className="btn shadow-none pl-0" onClick={openRecordTable}>
                                        <h1 id="recordTableTag">Records</h1>
                                    </button>
                                    <button className="btn shadow-none" onClick={openItemTable}>
                                        <h1 className="text-muted" id="itemTableTag">Items</h1>
                                    </button>
                                    <button className="btn shadow-none" onClick={openStoreTable}>
                                        <h1 className="text-muted" id="storeTableTag">Stores</h1>
                                    </button>
                                </div>
                                <div>
                                    <button className="btn btn-primary mt-2" onClick={createModal}>Create</button>
                                    <button className="btn btn-secondary mt-2 ml-2" onClick={() => {navigate("/login");}} id='loginBtn'>Login</button>
                                </div>
                            </div>
                        </nav>
                        {(records && recordTable && items && stores) ? <RecordTable records={records} setRecords={setRecords} openRecordModal={editRecordModal} recordTable={recordTable} items={items} stores={stores}/> : null}
                        {(items && itemTable) ? <ItemTable items={items} setItems={setItems} openItemModal={editItemModal} itemTable={itemTable}/> : null}
                        {(stores && storeTable) ? <StoreTable stores={stores} setStores={setStores} openStoreModal={editStoreModal} storeTable={storeTable}/> : null}
                    </div>
                </div>
                {(items && stores) ? (
                    <RecordModal itemList={items} storeList={stores} isOpen={recordModal} toggle={toggleRecordModal} setRecords={setRecords} isCreate={isCreate} items={items} stores={stores} setItems={setItems} setStores={setStores}/>
                ): null}
                <ItemModal isOpen={itemModal} toggle={toggleItemModal} setItems={setItems} isCreate={isCreate} items={items}/>
                <StoreModal isOpen={storeModal} toggle={toggleStoreModal} setStores={setStores} isCreate={isCreate} stores={stores}/>
            </div>
        </StoreProvider></ItemProvider></RecordProvider>
    );
}

export default App;