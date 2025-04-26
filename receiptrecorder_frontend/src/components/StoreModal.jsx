/* eslint-disable eqeqeq */
import axios from "axios";
import React, { useContext, useState } from "react";
import {
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Form,
    FormGroup,
    Input,
    Label,
} from "reactstrap";
import { StoreContext } from '../context/StoreContext';
import WarningModal from "./WarningModal";
import checkToken from "../lib/checkToken";
import refreshToken from "../lib/refreshToken";

export const StoreModal = ({ isOpen, toggle, setStores, isCreate, stores }) =>{
    let token = sessionStorage.getItem('access');
    const URL = process.env.REACT_APP_API_URL;

    const storeContext = useContext(StoreContext)

    // check if the input is valid
    const [invalidName, setInvalidName] = useState(false);

    const [alert, setAlert] = useState(false);
    const [alertBody, setAlertBody] = useState("");
    const toggleAlert = () => setAlert(!alert);

    const resetEverything = () =>{
        storeContext.reset();
        setInvalidName(false);
        toggle();
    }

    const saveStore = (e) =>{
        // check if the input is valid
        if(storeContext.name == ""){
            setInvalidName(true);
            return;
        }
        for(let i in stores){
            if(stores[i].name == storeContext.name && stores[i].id != storeContext.id){
                setInvalidName(true);
                return;
            }
        }

        const data = {
            name: storeContext.name,
            address: storeContext.address,
            desc: storeContext.desc,
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
            });
        } else if(isCreate){
            create(data);
        } else {
            update(data);
        }

        toggle();

        // set values back to default
        storeContext.reset();
    };

    function create(data) {
        // create the new store
        axios.post(URL + "stores/", data, {
            headers: {
                'Authorization': token
            }
        }).then(
            response => {
                setStores(prev => [...prev, response.data]);
            }
        ).catch(error => {
            if (error.response.statusText === "Unauthorized") {
                window.alert("Please login to create a new store.");
            }
        });
    }

    function update(data) {
        // edit store
        data['id'] = storeContext.id;

        axios.put(`${URL}stores/${storeContext.id}/`, data, {
            headers:{
                'Authorization': token
            }
        }).then(
            response => {
                setStores(stores => stores.map(store => store.id == storeContext.id ? response.data : store))
            }
        ).catch(error =>{
            if (error.response.statusText === "Unauthorized") {
                setAlertBody("Please login to modify a store.");
                toggleAlert()
            }
        });
    }

    return (
    <>
        <Modal isOpen={isOpen} toggle={resetEverything}>
            <ModalHeader toggle={resetEverything}>{isCreate ? "Create New Store" : "Edit Store"}</ModalHeader>
            <ModalBody>
                <Form>
                    <FormGroup>
                    <Label for="name">Name</Label>
                    <Input
                        type="text"
                        id="name"
                        name="name"
                        onChange={(e) => {
                            storeContext.setName(e.target.value);
                            setInvalidName(false);
                        }}
                        invalid={invalidName}
                        defaultValue={storeContext.name}
                    >
                    </Input>
                    </FormGroup>
                    <FormGroup>
                    <Label for="address">Address</Label>
                    <Input
                        type="textarea"
                        id="address"
                        name="address"
                        onChange={(e) => {
                            storeContext.setAddress(e.target.value);
                        }}
                        defaultValue={storeContext.address}
                    >
                    </Input>
                    </FormGroup>
                    <FormGroup>
                        <Label for="desc">Description</Label>
                        <Input
                        id="desc"
                        name="desc"
                        type="textarea"
                        onChange={(e) => {storeContext.setDesc(e.target.value)}}
                        defaultValue={storeContext.desc}
                        />
                    </FormGroup>
                </Form>
            </ModalBody>
            <ModalFooter>
            <Button color="success" onClick={saveStore}>
                Save
            </Button>
            </ModalFooter>
        </Modal>
        <WarningModal isOpen={alert} toggle={toggleAlert} body={alertBody}/>
    </>
    )
}