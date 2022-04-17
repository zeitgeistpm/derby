import { observer } from "mobx-react";
import React, { FC, PropsWithChildren } from "react";
import { X } from "react-feather";
import { useModals } from "../../context/ModalsContext";

export type ModalProps = {
  heading: JSX.Element | string;
  centerHeadingText?: boolean;
  showCloseButton?: boolean;
};

const Modal: FC<PropsWithChildren<ModalProps>> = observer(
  ({
    children,
    heading,
    centerHeadingText = false,
    showCloseButton = true,
  }) => {
    const modals = useModals();

    return (
      <div>
        <div className="flex justify-between items-center mb-ztg-16">
          <div
            className={
              "font-bold text-ztg-16-150 font-kanit text-white w-full" +
              (centerHeadingText ? " text-center" : "")
            }
          >
            {heading}
          </div>
          {showCloseButton === true ? (
            <div>
              <X
                size={24}
                role="button"
                className="cursor-pointer text-sky-200"
                onClick={() => modals.closeModal()}
              />
            </div>
          ) : undefined}
        </div>
        {children}
      </div>
    );
  }
);

export default Modal;
