/* eslint-disable eqeqeq */
import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import WarningModal from './WarningModal';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faPen } from '@fortawesome/free-solid-svg-icons';
import { ItemContext } from '../context/ItemContext';
import checkToken from "../lib/checkToken";
import refreshToken from "../lib/refreshToken";

export const ItemTable = ({ items, setItems, openItemModal }) => {
    let token = sessionStorage.getItem('access');
    const URL = process.env.REACT_APP_API_URL;

    const itemContext = useContext(ItemContext);
    const [sortedRows, setSortedRows] = useState(items);
    
    const [alert, setAlert] = useState(false);
    const [alertBody, setAlertBody] = useState("");
    const toggleAlert = () => setAlert(!alert);

    useEffect(() => {
        if(items){
            setSortedRows(items);
        }
    }, [items]);

    const editItem = (e) => {
        const row = document.getElementById('item ' + e.currentTarget.value);
        
        // set the value from the selected row to the form
        itemContext.setId(e.currentTarget.value);
        itemContext.setName(row.getElementsByClassName('name')[0].textContent);
        if(row.getElementsByClassName('unit')[0].textContent != null){
            itemContext.setUnit(row.getElementsByClassName('unit')[0].textContent);
        }
        if(row.getElementsByClassName('desc')[0].textContent != null){
            itemContext.setDesc(row.getElementsByClassName('desc')[0].textContent);
        }
            
        openItemModal();
    }

    const removeItem = (e) => {
        // if(!window.confirm("Are you sure to delete the item?")) {
        //     return;
        // }

        // make sure the item is not linking to any record
        const id = e.currentTarget.value;
        const itemName = document.getElementById('item '+ id).getElementsByClassName('name')[0].textContent;
        const data = {item:itemName}
        
        if (!checkToken()) {
            refreshToken().then(() => {
                token = sessionStorage.getItem("access");
                handleDelete(data, id);
            }).catch(() => {
                setAlertBody("Session time out, please login again.");
                toggleAlert();
            });
        } else {
            handleDelete(data, id);
        }
    };

    function handleDelete(data, id) {
        axios.get(URL + 'records/getRecordByItem/', {
            params:data,
            headers: {
                'Authorization': token
            }
        }).then(
            response => {
                if(Object.keys(response.data).length != 0){
                    setAlertBody("The item is linking to at least one record. Please remove the associating records first.");
                    toggleAlert();
                } else {
                    axios.delete(`${URL}items/${id}/`, {
                        headers: {
                            'Authorization': token
                        }
                    }).then(
                        setItems(
                            items.filter((item) => {
                                return item.id != id;
                            })
                        )
                    ).catch(error => {
                        if (error.response.statusText === "Unauthorized") {
                            setAlertBody("Please login to delete a new item.");
                            toggleAlert();
                        }
                    });
                }
            }
        );
    }
    
    return (
        <>
            <table className={'table table-bordered table-striped table-responsive-sm'}>
                <thead>
                    <tr>
                        <th width="20%">Name</th>
                        <th width="10%">Unit</th>
                        <th width="45%">Description</th>
                        <th width="10%">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedRows.map((row, index) => (
                        <tr key={index} id={'item ' + row.id}>
                            <td key='name' className='name'>{row.name}</td>
                            <td key='unit' className='unit'>{row.unit}</td>
                            <td key='desc' className='desc'>{row.desc}</td>
                            <td key='action'>
                                <button className="btn btn-primary me-2" onClick={editItem} value={row.id}>
                                    <FontAwesomeIcon icon={faPen}/>
                                </button>
                                <button className="btn btn-danger" onClick={removeItem} value={row.id}>
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