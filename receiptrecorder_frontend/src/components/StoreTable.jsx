/* eslint-disable eqeqeq */
import React, { useContext, useEffect } from 'react';
import { useState } from 'react';
import axios from "axios";
// import { Modal, ModalBody, ModalHeader } from "reactstrap";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faPen } from '@fortawesome/free-solid-svg-icons';
import { StoreContext } from '../context/StoreContext';
import WarningModal from './WarningModal';
import checkToken from '../lib/checkToken';
import refreshToken from '../lib/refreshToken';

export const StoreTable = ({ stores, setStores, openStoreModal }) => {
    let token = sessionStorage.getItem('access');
    const URL = process.env.REACT_APP_API_URL;

    const storeContext = useContext(StoreContext);
    const [sortedRows, setRows] = useState(stores);

    const [alert, setAlert] = useState(false);
    const [alertBody, setAlertBody] = useState("");
    const toggleAlert = () => setAlert(!alert);

    useEffect(() => {
        if(stores){
            setRows(stores);
        }
    }, [stores]);

    const editStore = (e) => {
        const row = document.getElementById('store ' + e.currentTarget.value);
        
        // set the value from the selected row to the form
        storeContext.setId(e.currentTarget.value);
        storeContext.setName(row.getElementsByClassName('name')[0].textContent);
        if(row.getElementsByClassName('address')[0].textContent != null){
            storeContext.setAddress(row.getElementsByClassName('address')[0].textContent);
        }
        if(row.getElementsByClassName('desc')[0].textContent != null){
            storeContext.setDesc(row.getElementsByClassName('desc')[0].textContent);
        }
            
        openStoreModal();
    }

    const removeStore = (e) => {
        if(!window.confirm("Are you sure to delete the store?")) {
            return;
        }

        // make sure the store is not linking to any record
        const id = e.currentTarget.value;
        const storeName = document.getElementById('store ' + id).getElementsByClassName('name')[0].textContent;
        const data = {store:storeName}
        
        if (!checkToken()) {
            refreshToken().then(() => {
                token = sessionStorage.getItem("access");
                handleDelete(data, id);
            }).catch(() => {
                setAlertBody("Session time out, please login again.");
                toggleAlert();
                return;
            });
        } else {
            handleDelete(data, id);
        }
    };

    function handleDelete(data, id) {
        axios.get(URL + 'records/getRecordByStore/', {
            params:data,
            headers: {
                'Authorization': token
            }
        }).then(
            response => {
                if(Object.keys(response.data).length != 0){
                    setAlertBody("The store is linking to at least one record. Please remove the associating records first.");
                    toggleAlert();
                } else {
                    axios.delete(`${URL}stores/${id}/`, {
                        headers: {
                            'Authorization': token
                        }
                    }).then(
                        () => {
                            setStores(
                                stores.filter((store) => {
                                    return store.id != id;
                                })
                            )
                        }
                    ).catch(error => {
                        if (error.response.statusText === "Unauthorized") {
                            setAlertBody("Please login to delete a store.");
                            toggleAlert()
                        }
                    });
                }
        }).catch(error => {
            console.error(error)
        });
    }
    
    return (
        <>
            <table className={'table table-bordered table-striped table-responsive-sm'}>
                <thead>
                    <tr>
                        <th width="15%">Name</th>
                        <th width="25%">Address</th>
                        <th width="35%">Description</th>
                        <th width="10%">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedRows.map((row, index) => (
                        <tr key={index} id={'store ' + row.id}>
                            <td key='name' className='name'>{row.name}</td>
                            <td key='address' className='address'>{row.address}</td>
                            <td key='desc' className='desc'>{row.desc}</td>
                            <td key='action'>
                                <button className="btn btn-primary mr-2" onClick={editStore} value={row.id}>
                                    <FontAwesomeIcon icon={faPen}/>
                                </button>
                                <button className="btn btn-danger" onClick={removeStore} value={row.id}>
                                    <FontAwesomeIcon icon={faTrashCan}/>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <WarningModal isOpen={alert} toggle={toggleAlert} body={alertBody}/>
        </>
    )
}