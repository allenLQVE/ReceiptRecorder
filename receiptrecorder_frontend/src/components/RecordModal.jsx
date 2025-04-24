/* eslint-disable eqeqeq */
import axios from "axios";
import React, { useContext, useState } from "react";
import {
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    FormGroup,
    Input,
    Label,
} from "reactstrap";
import { RecordContext } from '../context/RecordContext';
import { ItemModal } from "./ItemModal";
import { StoreModal } from "./StoreModal";
import WarningModal from "./WarningModal";
import checkToken from "../lib/checkToken";
import refreshToken from "../lib/refreshToken";

export const RecordModal = ({ itemList, storeList, isOpen, toggle, setRecords, isCreate, items, stores, setItems, setStores }) =>{
    let token = sessionStorage.getItem('access');
    const URL = process.env.REACT_APP_API_URL;
    
    const recordContext = useContext(RecordContext)

    // check if the input is valid
    const [invalidItem, setItemValid] = useState(false);
    const [invalidStore, setStoreValid] = useState(false);
    const [invalidDate, setDateValid] = useState(false);

    // control item and store modal while creating new record
    const [itemModal, setItemModal] = useState(false);
    const [storeModal, setStoreModal] = useState(false);
    const toggleItemModal = () => setItemModal(!itemModal);
    const toggleStoreModal = () => setStoreModal(!storeModal);

    const [alert, setAlert] = useState(false);
    const [alertBody, setAlertBody] = useState("");
    const toggleAlert = () => setAlert(!alert);

    const resetEverything = () =>{
        recordContext.reset();
        setItemValid(false);
        setStoreValid(false);
        setDateValid(false);
        toggle();
    }

    const saveRecord = (e) =>{
        // check if the record has required fields
        var invalid = false;
        if(recordContext.store == ""){
            setStoreValid(true);
            invalid = true;
        }
        if(recordContext.item == ""){
            setItemValid(true);
            invalid = true;
        }
        if(recordContext.purchaseDate == null){
            setDateValid(true);
            invalid = true;
        }

        if(invalid){
            return;
        }

        const data = {
            item: recordContext.item,
            store: recordContext.store,
            purchaseDate: recordContext.purchaseDate,
            price: recordContext.price,
            saving: recordContext.saving,
            units: recordContext.units,
            detail: recordContext.detail,
        }

        if (!checkToken()) {
            refreshToken().then(() => {
                token = sessionStorage.getItem("access");
                if(isCreate){
                    create(data);
                } else {
                    update(data);
                }
            }).catch(() => {
                setAlertBody("Session time out, please login again.");
                toggleAlert();
                return;
            });
        } else {
            if(isCreate){
                create(data);
            } else {
                update(data);
            }
        }
        
        toggle();

        // set values back to default
        recordContext.reset();
    };

    function update(data) {
        console.log("update data");
        data['id'] = recordContext.id;

        axios.put(`${URL}records/${recordContext.id}/`, data, {
            headers: {
                'Authorization': token
            }
        }).then(
            response => {
                setRecords(records => records.map(record => record.id == recordContext.id ? response.data : record))
            }
        ).catch(error =>{
            if (error.response.statusText === "Unauthorized") {
                setAlertBody("Please login to modify a record.");
                toggleAlert();
            }
        });
    }

    function create(data) {
        // create the new record
        axios.post(URL + "records/", data, {
            headers: {
                'Authorization': token
            }
        }).then(
            response => {
                setRecords(prev => [...prev, response.data]);
            }
        ).catch(error => {
            if (error.response.statusText === "Unauthorized") {
                setAlertBody("Please login to create a new record.");
                toggleAlert();
            }
        });
    }

    return (
        <>
            <Modal isOpen={isOpen} toggle={resetEverything}>
                <ModalHeader toggle={resetEverything}>{isCreate ? "Create New Record" : "Edit Record"}</ModalHeader>
                <ModalBody>
                    <div>
                        <FormGroup>
                        <div className='float-right'><button className='btn btn-primary btn-sm' onClick={toggleItemModal}>create item</button></div>
                        <Label for="item">Item </Label>
                        <Input
                            type="select"
                            id="item"
                            name="item"
                            onChange={(e) => {
                                recordContext.setItem(e.target.value);
                                setItemValid(false);
                            }}
                            invalid={invalidItem}
                            defaultValue={recordContext.item}
                        >
                            <option></option>
                            {itemList.map((item, index) => (
                                <option key={index}>{item.name}</option>
                            ))}
                        </Input>
                        </FormGroup>
                        <FormGroup>
                        <div className='float-right'><button className='btn btn-primary btn-sm' onClick={toggleStoreModal}>create store</button></div>
                        <Label for="store">Store</Label>
                        <Input
                            type="select"
                            id="store"
                            name="store"
                            onChange={(e) => {
                                recordContext.setStore(e.target.value);
                                setStoreValid(false);
                            }}
                            invalid={invalidStore}
                            defaultValue={recordContext.store}
                        >
                            <option></option>
                            {storeList.map((store, index) => (
                                <option key={index}>{store.name}</option>
                            ))}
                        </Input>
                        </FormGroup>
                        <FormGroup>
                            <Label for="purchaseDate">Date</Label>
                            <Input
                            id="purchaseDate"
                            name="purchaseDate"
                            placeholder="date placeholder"
                            type="date"
                            onChange={(e) => {
                                recordContext.setPurchaseDate(e.target.value);
                                setDateValid(false);
                            }}
                            invalid={invalidDate}
                            defaultValue={recordContext.purchaseDate}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="price">Price</Label>
                            <Input
                            id="price"
                            name="price"
                            type="number"
                            step="0.1"
                            min="0"
                            defaultValue={recordContext.price}
                            onChange={(e) => {recordContext.setPrice(e.target.value)}}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="saving">Saving</Label>
                            <Input
                            id="saving"
                            name="saving"
                            type="number"
                            step="0.1"
                            min="0"
                            defaultValue={recordContext.saving}
                            onChange={(e) => {recordContext.setSaving(e.target.value)}}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="units">Unit</Label>
                            <Input
                            id="units"
                            name="units"
                            type="number"
                            min="1"
                            defaultValue={recordContext.units}
                            onChange={(e) => {recordContext.setUnits(e.target.value)}}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="detail">Note</Label>
                            <Input
                            id="detail"
                            name="detail"
                            type="textarea"
                            onChange={(e) => {recordContext.setDetail(e.target.value)}}
                            defaultValue={recordContext.detail}
                            />
                        </FormGroup>
                    </div>
                </ModalBody>
                <ModalFooter>
                <Button color="success" onClick={saveRecord}>
                    Save
                </Button>
                </ModalFooter>
            </Modal>
            <ItemModal isOpen={itemModal} toggle={toggleItemModal} setItems={setItems} isCreate={true} items={items}/>
            <StoreModal isOpen={storeModal} toggle={toggleStoreModal} setStores={setStores} isCreate={true} stores={stores}/>
            <WarningModal isOpen={alert} toggle={toggleAlert} body={alertBody}/>
        </>
    )
}