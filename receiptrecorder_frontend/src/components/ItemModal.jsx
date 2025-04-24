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
import { ItemContext } from '../context/ItemContext';
import WarningModal from "./WarningModal";
import checkToken from "../lib/checkToken";
import refreshToken from "../lib/refreshToken";

export const ItemModal = ({ isOpen, toggle, setItems, isCreate, items }) =>{
    let token = sessionStorage.getItem('access');
    const URL = process.env.REACT_APP_API_URL;

    const itemContext = useContext(ItemContext)

    // check if the input is valid
    const [invalidName, setNameValid] = useState(false);

    const [alert, setAlert] = useState(false);
    const [alertBody, setAlertBody] = useState("");
    const toggleAlert = () => setAlert(!alert);

    const resetEverything = () =>{
        itemContext.reset();
        setNameValid(false);
        toggle();
    }

    const saveItem = (e) =>{
        // check if the input is valid
        if(itemContext.name == ""){
            setNameValid(true);
            return;
        }
        for(var i in items){
            if(items[i].name == itemContext.name && items[i].id != itemContext.id){
                setNameValid(true);
                return;
            }
        }

        const data = {
            name: itemContext.name,
            unit: itemContext.unit,
            desc: itemContext.desc,
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
        itemContext.reset();
    };

    function update(data) {
        // edit item
        data['id'] = itemContext.id;

        axios.put(`${URL}items/${itemContext.id}/`, data, {
            headers: {
                'Authorization': token
            }
        }).then(
            response => {
                setItems(items => items.map(item => item.id == itemContext.id ? response.data : item))
            }
        ).catch(error =>{
            console.error(error);
            if (error.response.statusText === "Unauthorized") {
                setAlertBody("Please login to modify items.");
                toggleAlert();
            }
        });
    }

    function create(data) {
        // create the new item
        axios.post(URL + "items/", data, {
            headers: {
                'Authorization': token
            }
        }).then(
            response => {
                setItems(prev => [...prev, response.data]);
            }
        ).catch(error => {
            console.error(error);
            if (error.response.statusText === "Unauthorized") {
                setAlertBody("Please login to create a new item.");
                toggleAlert();
            }
        })
    }

    return (
    <>
        <Modal isOpen={isOpen} toggle={resetEverything}>
            <ModalHeader toggle={resetEverything}>{isCreate ? "Create New Item" : "Edit Item"}</ModalHeader>
            <ModalBody>
                <Form>
                    <FormGroup>
                    <Label for="name">Name</Label>
                    <Input
                        type="text"
                        id="name"
                        name="name"
                        onChange={(e) => {
                            itemContext.setName(e.target.value);
                            setNameValid(false);
                        }}
                        invalid={invalidName}
                        defaultValue={itemContext.name}
                    >
                    </Input>
                    </FormGroup>
                    <FormGroup>
                    <Label for="unit">Unit</Label>
                    <Input
                        type="text"
                        id="unit"
                        name="unit"
                        onChange={(e) => {
                            itemContext.setUnit(e.target.value);
                        }}
                        defaultValue={itemContext.unit}
                    >
                    </Input>
                    </FormGroup>
                    <FormGroup>
                        <Label for="desc">Description</Label>
                        <Input
                        id="desc"
                        name="desc"
                        type="textarea"
                        onChange={(e) => {itemContext.setDesc(e.target.value)}}
                        defaultValue={itemContext.desc}
                        />
                    </FormGroup>
                </Form>
            </ModalBody>
            <ModalFooter>
            <Button color="success" onClick={saveItem}>
                Save
            </Button>
            </ModalFooter>
        </Modal>
        <WarningModal isOpen={alert} toggle={toggleAlert} body={alertBody}/>
    </>
    )
}