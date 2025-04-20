import React from "react";
import "./Modal.css";
import CreateEditWishForm from "../components/CreateWishForm";

function Modal({ active, setActive, onEdit, selectedWish }) {
  return (
    <div
      className={active ? "modal active" : "modal"}
      onClick={() => setActive(false)}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <CreateEditWishForm onEdit={onEdit} selectedWish={selectedWish}  />
      </div>
    </div>
  );
}

export default Modal;
