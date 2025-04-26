/* eslint-disable eqeqeq */
import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import WarningModal from './WarningModal';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faPen, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { RecordContext } from '../context/RecordContext';

import './RecordTable.css';
import checkToken from '../lib/checkToken';
import refreshToken from '../lib/refreshToken';

export const RecordTable = ({ records, setRecords, openRecordModal, items, stores }) => {
    let token = sessionStorage.getItem('access');
    const URL = process.env.REACT_APP_API_URL;

    const recordContext = useContext(RecordContext);
    const [sortedRows, setSortedRows] = useState(records);
    const [asc, setAsc] = useState(true);

    const [alert, setAlert] = useState(false);
    const [alertBody, setAlertBody] = useState("");
    const toggleAlert = () => setAlert(!alert);

    useEffect(() => {
        if(records){
            setSortedRows(records);
        }
    }, [records]);

    const reverse = () => {
        setSortedRows([...sortedRows].reverse());
        setAsc(!asc);
    }

    const sortRow = () => {
        const col = document.getElementById('sortRow').value;
        const order = asc ? 1 : -1
        if(col == 'default'){
            setSortedRows([...sortedRows.sort((a, b) => {
                return a.id > b.id ? order : -1 * order
            })])
        } else if (col == 'item') {
            setSortedRows([...sortedRows.sort((a, b) => {
                return a.item.name > b.item.name ? order : -1 * order
            })])
        } else if (col == 'store') {
            setSortedRows([...sortedRows.sort((a, b) => {
                return a.store.name > b.store.name ? order : -1 * order
            })])
        } else if (col == 'unitPrice') {
            setSortedRows([...sortedRows.sort((a, b) => {
                return (a.price / a.units) > (b.price / b.units) ? order : -1 * order
            })])
        } else if (col == 'unitPriceWOS') {
            setSortedRows([...sortedRows.sort((a, b) => {
                return ((a.price - a.saving) / a.units) > ((b.price - b.saving) / b.units) ? order : -1 * order
            })])
        } else if (col == 'paid') {
            setSortedRows([...sortedRows.sort((a, b) => {
                return (a.price - a.saving) > (b.price - b.saving) ? order : -1 * order
            })])
        } else {
            setSortedRows([...sortedRows.sort((a, b) => {
                return a[col] > b[col] ? order : -1 * order
            })])
        }
    }

    const filter = () => {
        const itemFilter = document.getElementById('itemFilter').value;
        const storeFilter = document.getElementById('storeFilter').value;

        if(storeFilter == 'select store' && itemFilter == 'select item'){
            setSortedRows(records);
        } else if (storeFilter == 'select store') {
            setSortedRows(records.filter((record) => {
                return record.item.name == itemFilter;
            }))
        } else if (itemFilter == 'select item') {
            setSortedRows(records.filter((record) => {
                return record.store.name == storeFilter;
            }))
        } else {
            setSortedRows(records.filter((record) => {
                return record.store.name == storeFilter && record.item.name == itemFilter;
            }))
        }
    }

    const editRecord = (e) => {
        const row = document.getElementById('record ' + e.currentTarget.value);
        // set the value from the selected row to the form
        recordContext.setId(e.currentTarget.value);
        recordContext.setItem(row.getElementsByClassName('itemName')[0].textContent);
        recordContext.setStore(row.getElementsByClassName('storeName')[0].textContent);
        recordContext.setPurchaseDate(row.getElementsByClassName('purchaseDate')[0].textContent);
        recordContext.setPrice(parseFloat(row.getElementsByClassName('price')[0].textContent.slice(1)));
        recordContext.setSaving(parseFloat(row.getElementsByClassName('saving')[0].textContent.slice(1)));
        recordContext.setUnits(parseInt(row.getElementsByClassName('units')[0].textContent.split('/')[0]));
        if(row.getElementsByClassName('detail')[0].textContent != null){
            recordContext.setDetail(row.getElementsByClassName('detail')[0].textContent);
        }
            
        openRecordModal();
    }

    const removeRecord = (e) => {
        const targetId = e.currentTarget.value
        // if(!window.confirm("Are you sure to delete the record?")) {
        //     return;
        // }

        if (!checkToken()) {
            refreshToken().then(() => {
                token = sessionStorage.getItem("access");
                handleDelete(targetId);
            }).catch(() => {
                setAlertBody("Session time out, please login again.");
                toggleAlert();
            });
        } else {
            handleDelete(targetId);
        }
    };

    function handleDelete(targetId) {
        axios.delete(`${URL}records/${targetId}/`, {
            headers: {
                'Authorization': token
            }
        }
        ).then(() => {
            setRecords(
                records.filter((record) => {
                    return record.id != targetId;
                })
            )
        }).catch(error => {
            if (error.response.statusText === "Unauthorized") {
                setAlertBody("Please login to delete a record.");
                toggleAlert();
            }
        });
    }
    
    return (
        <>
            <div>
                <div>
                    <label className='fw-bold'>Filter By Item</label>
                    <select id='itemFilter' className='mx-1 width-auto' onChange={filter}>
                        <option key={'default'}>select item</option>
                        {items.map((item) => (
                            <option key={item.id} id={item.id}>{item.name}</option>
                        ))}
                    </select>
                    <label className='fw-bold ms-2'>Filter By Store</label>
                    <select id='storeFilter' className='m-1 width-auto' onChange={filter}>
                        <option key={'default'}>select store</option>
                        {stores.map((store) => (
                                <option key={store.id} id={store.id}>{store.name}</option>
                        ))}
                    </select>
                    <div className='float-end'>
                        <label className='fw-bold'>Sort By</label>
                        <select className='ms-2 width-auto' id='sortRow' onChange={sortRow}>
                            <option key='default' value='default'>select column</option>
                            <option key='item' value='item'>Item</option>
                            <option key='store' value='store'>Store</option>
                            <option key='purchaseDate' value='purchaseDate'>Date</option>
                            <option key='price' value='price'>Cost</option>
                            <option key='saving' value='saving'>Saving</option>
                            <option key='units' value='units'>Unit</option>
                            <option key='unitPrice' value='unitPrice'>Unit Price</option>
                            <option key='unitPriceWOS' value='unitPriceWOS'>U.P. (W/Saving)</option>
                            <option key='paid' value='paid'>Paid</option>
                        </select>
                        <button className='btn shadow-none' onClick={reverse}>{asc ? <FontAwesomeIcon icon={faSortUp}/> : <FontAwesomeIcon icon={faSortDown}/>}</button>
                    </div>
                    
                </div>
                    
            </div>
            <table className={'table table-bordered table-striped table-responsive-sm'}>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Store</th>
                        <th>Date</th>
                        <th>Cost</th>
                        <th>Saving</th>
                        <th>Unit</th>
                        <th>Unit Price</th>
                        <th>U.P. (W/Saving)</th>
                        <th>Paid</th>
                        <th>Note</th>
                        <th className='nowrap'>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedRows.map((row, index) => (
                        <tr key={index} id={'record ' + row.id}>
                            <td key='itemName' className='itemName'>{row.item.name}</td>
                            <td key='storeName' className='storeName'>{row.store.name}</td>
                            <td key='purchaseDate' className='purchaseDate'>{row.purchaseDate}</td>
                            <td key='price' className='price'>${row.price}</td>
                            <td key='saving' className='saving'>${row.saving}</td>
                            <td key='units' className='units'>{row.units + (row.item.unit ? ('/' + row.item.unit) : null)}</td>
                            <td key='unitPrice'>${(row.price / row.units).toFixed(2)}</td>
                            <td key='unitPriceSaving'>${((row.price - row.saving) / row.units).toFixed(2)}</td>
                            <td key='paid'>${(row.price - row.saving).toFixed(2)}</td>
                            <td key='detail' className='detail'>{row.detail}</td>
                            {/* add a col for removing or update record */}
                            <td key='action'>
                                <button className="btn btn-primary me-2" onClick={editRecord} value={row.id}>
                                    <FontAwesomeIcon icon={faPen}/>
                                </button>
                                <button className="btn btn-danger" onClick={removeRecord} value={row.id}>
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