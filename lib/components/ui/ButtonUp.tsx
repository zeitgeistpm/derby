import { observer } from "mobx-react";
import { FC } from "react";
import Derby from "../../state/Derby";

const slotColors = Derby.config.slots.map(s => s.color);

const ButtonUp: FC<{ onClick?: () => void; pageIndex: number }> =
  observer(({ onClick, pageIndex }) => {
    const color = slotColors[pageIndex];

    return (
      <div className="cursor-pointer" onClick={onClick}>
        <svg
          width="54"
          height="54"
          viewBox="0 0 54 54"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="27" cy="27" r="27" fill={color} />
          <path
            d="M27.7071 13.2929C27.3166 12.9024 26.6834 12.9024 26.2929 13.2929L19.9289 19.6569C19.5384 20.0474 19.5384 20.6805 19.9289 21.0711C20.3195 21.4616 20.9526 21.4616 21.3431 21.0711L27 15.4142L32.6569 21.0711C33.0474 21.4616 33.6805 21.4616 34.0711 21.0711C34.4616 20.6805 34.4616 20.0474 34.0711 19.6569L27.7071 13.2929ZM28 41L28 14L26 14L26 41L28 41Z"
            fill="white"
          />
        </svg>
      </div>
    );
  });

export default ButtonUp;
