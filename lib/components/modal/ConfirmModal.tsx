import { observer } from "mobx-react";
import React, { FC, PropsWithChildren } from "react";
import { useDerby } from "../../context/DerbyContext";
import { useModals } from "../../context/ModalsContext";
import Modal, { ModalProps } from "./Modal";

export type ConfirmModalProps = ModalProps & {
  onYes?: () => void;
  confirmButtonText?: string;
  cancelButtonText?: string;
};

const ConfirmModal: FC<PropsWithChildren<ConfirmModalProps>> = observer(
  ({
    confirmButtonText = "Confirm",
    cancelButtonText = "Cancel",
    children,
    onYes = () => {},
    heading
  }) => {
    const modals = useModals();
    const confirm = () => {
      onYes();
      modals.closeModal();
    };
    return (
      <Modal heading={heading} showCloseButton={false} centerHeadingText={true}>
        {children}
        <div className="flex">
          <button
            className="rounded-ztg-10 center bg-ztg-blue text-white w-full h-ztg-40 mr-ztg-15 font-lato font-medium text-ztg-16-150 focus:outline-none"
            onClick={() => confirm()}
          >
            {confirmButtonText}
          </button>
          <button
            className="rounded-ztg-10 center bg-border-light bg-sky-700 text-white w-full h-ztg-40 font-lato font-medium text-ztg-16-150 focus:outline-none"
            onClick={() => modals.closeModal()}
          >
            {cancelButtonText}
          </button>
        </div>
      </Modal>
    );
  }
);

export default ConfirmModal;
