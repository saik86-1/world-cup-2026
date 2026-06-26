// team name -> ISO code used by flagcdn.com (large flag imagery)
const ISO: Record<string, string> = {
  France: "fr", Senegal: "sn", Spain: "es", Argentina: "ar", England: "gb-eng",
  Brazil: "br", Portugal: "pt", Colombia: "co", Netherlands: "nl", Germany: "de",
  Croatia: "hr", Belgium: "be", Uruguay: "uy", Morocco: "ma", Switzerland: "ch",
  Mexico: "mx", Japan: "jp", Austria: "at", USA: "us", Norway: "no", Ecuador: "ec",
  "South Korea": "kr", "Czech Republic": "cz", Iran: "ir", Turkey: "tr",
  Scotland: "gb-sct", Algeria: "dz", Sweden: "se", Canada: "ca", Australia: "au",
  "Ivory Coast": "ci", Egypt: "eg", Paraguay: "py", "Bosnia & Herzegovina": "ba",
  Tunisia: "tn", "DR Congo": "cd", Qatar: "qa", Ghana: "gh", "Cape Verde": "cv",
  "Saudi Arabia": "sa", "South Africa": "za", Panama: "pa", Uzbekistan: "uz",
  Jordan: "jo", Iraq: "iq", "Curaçao": "cw", "New Zealand": "nz", Haiti: "ht",
  Italy: "it", Denmark: "dk", Serbia: "rs", Poland: "pl", Chile: "cl", Wales: "gb-wls",
  Ukraine: "ua", Russia: "ru", Greece: "gr", Peru: "pe", Romania: "ro", Nigeria: "ng",
  Cameroon: "cm", Hungary: "hu", Slovakia: "sk", Slovenia: "si", Ireland: "ie",
  "Costa Rica": "cr", Georgia: "ge", Iceland: "is", Albania: "al", Finland: "fi",
  "North Macedonia": "mk", "Northern Ireland": "gb-nir", Israel: "il", Bulgaria: "bg",
  Honduras: "hn", Bolivia: "bo", Jamaica: "jm", China: "cn", "El Salvador": "sv",
};

export const iso = (name: string) => ISO[name] ?? "un";
export const flagUrl = (name: string, w = 1280) =>
  `https://flagcdn.com/w${w}/${iso(name)}.png`;
export const flagSmall = (name: string, w = 80) =>
  `https://flagcdn.com/w${w}/${iso(name)}.png`;
