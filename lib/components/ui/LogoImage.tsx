import { observer } from "mobx-react";
import { FC } from "react";
import Image from "./Image";

const convertToFileName = (category: string) => {
  return category.toLocaleLowerCase().replace(/\ /g, '_');
}

const LogoImage: FC<{
  staticBaseUrl: string;
  team: string;
  className?: string;
}> = observer(({ staticBaseUrl, team, className = "" }) => {
  const logoUrls = [
    `${staticBaseUrl}/${convertToFileName(team)}_logo.png`,
    `${staticBaseUrl}/${convertToFileName(team)}_logo@2x.png`
  ];

  if (team.toLowerCase() === "none") {
    return (
      <div className={`${className} flex justify-center items-center text-xl`}>
        None
      </div>
    );
  }

  return (
    <Image
      imageUrl1x={logoUrls[0]}
      imageUrl2x={logoUrls[1]}
      alt={`${team} logo`}
      className={className}
    />
  );
});

export default LogoImage;
