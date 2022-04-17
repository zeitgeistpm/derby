import { makeAutoObservable, reaction } from "mobx";
import React, { ReactFragment } from "react";

import ConfirmModal from "../components/modal/ConfirmModal";
import Modal from "../components/modal/Modal";

export type ModalOptions = {
  styles?: React.CSSProperties;
};

export default class Modals {
  modal: JSX.Element | null = null;
  options: ModalOptions = {};

  constructor() {
    makeAutoObservable(this, {}, { deep: false });
  }

  closeModal() {
    this.modal = null;
    this.options = {};
  }

  openConfirmModal(
    el: JSX.Element,
    heading: JSX.Element,
    action?: () => void,
    options?: ModalOptions
  ) {
    if (options) {
      this.setOptions(options);
    }
    this.modal = (
      <ConfirmModal onYes={action} heading={heading}>
        {el}
      </ConfirmModal>
    );
  }

  openModal(
    el: JSX.Element,
    heading: JSX.Element | string,
    options?: ModalOptions
  ) {
    if (options) {
      this.setOptions(options);
    }
    this.modal = <Modal heading={heading}>{el}</Modal>;
  }

  setOptions(options: ModalOptions) {
    this.options = options;
  }
}
