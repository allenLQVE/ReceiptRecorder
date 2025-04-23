import { Modal, ModalBody, ModalHeader } from "reactstrap";

export default function WarningModal({isOpen, toggle, body}) {
    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader className="bg-danger" toggle={toggle}>
                Warning!
            </ModalHeader>
            <ModalBody>
                {body}
            </ModalBody>
        </Modal>
    )
}