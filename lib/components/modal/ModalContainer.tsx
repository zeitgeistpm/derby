import { observer } from "mobx-react";
import { FC, PropsWithChildren, useEffect, useRef } from "react";
import { useModals } from "../../context/ModalsContext";

const defaultStyle: React.CSSProperties = {
  width: "320px"
};

const ModalContainer: FC<PropsWithChildren<{}>> = observer(({ children }) => {
  const modalRef = useRef<HTMLDivElement>();
  const modals = useModals();

  const { options } = modals;
  const { styles } = options;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        modals.closeModal();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalRef, modals]);

  useEffect(() => {
    modalRef.current.focus();
  }, [modalRef]);

  const containerClasses =
    "p-ztg-15 z-50 rounded-ztg-10 text-white bg-sky-1000 focus:outline-none shadow-ztg-4";
  return (
    <div className="fixed w-full h-full z-ztg-50 bg-dark-overlay flex justify-center items-center">
      <div
        tabIndex={0}
        ref={modalRef}
        className={containerClasses}
        style={{
          ...defaultStyle,
          ...styles
        }}
      >
        {children}
      </div>
    </div>
  );
});

export default ModalContainer;
