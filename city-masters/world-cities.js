// ══════ DE (Germany) ══════
const DE_CITY_MASTER = {
    "Baden-Württemberg": [
        { en: "Stuttgart", local: "Stuttgart", pop: 635911 },
        { en: "Mannheim", local: "Mannheim", pop: 311831 },
        { en: "Karlsruhe", local: "Karlsruhe", pop: 308436 },
        { en: "Freiburg", local: "Freiburg im Breisgau", pop: 230241 },
        { en: "Heidelberg", local: "Heidelberg", pop: 159245 }
    ],
    "Bayern": [
        { en: "Munich", local: "München", pop: 1472000 },
        { en: "Nuremberg", local: "Nürnberg", pop: 518370 },
        { en: "Augsburg", local: "Augsburg", pop: 296582 },
        { en: "Regensburg", local: "Regensburg", pop: 153094 },
        { en: "Würzburg", local: "Würzburg", pop: 127934 }
    ],
    "Berlin": [
        { en: "Berlin", local: "Berlin", pop: 3645000 }
    ],
    "Brandenburg": [
        { en: "Potsdam", local: "Potsdam", pop: 183154 }
    ],
    "Bremen": [
        { en: "Bremen", local: "Bremen", pop: 567559 }
    ],
    "Hamburg": [
        { en: "Hamburg", local: "Hamburg", pop: 1853935 }
    ],
    "Hessen": [
        { en: "Frankfurt", local: "Frankfurt am Main", pop: 753056 },
        { en: "Wiesbaden", local: "Wiesbaden", pop: 278474 },
        { en: "Kassel", local: "Kassel", pop: 201585 },
        { en: "Darmstadt", local: "Darmstadt", pop: 159878 }
    ],
    "Niedersachsen": [
        { en: "Hanover", local: "Hannover", pop: 535932 },
        { en: "Braunschweig", local: "Braunschweig", pop: 248823 },
        { en: "Oldenburg", local: "Oldenburg", pop: 170389 },
        { en: "Osnabrück", local: "Osnabrück", pop: 165251 }
    ],
    "Nordrhein-Westfalen": [
        { en: "Cologne", local: "Köln", pop: 1083498 },
        { en: "Düsseldorf", local: "Düsseldorf", pop: 621877 },
        { en: "Dortmund", local: "Dortmund", pop: 588250 },
        { en: "Essen", local: "Essen", pop: 582760 },
        { en: "Duisburg", local: "Duisburg", pop: 498590 },
        { en: "Bochum", local: "Bochum", pop: 364628 },
        { en: "Bonn", local: "Bonn", pop: 329673 },
        { en: "Münster", local: "Münster", pop: 315293 }
    ],
    "Sachsen": [
        { en: "Leipzig", local: "Leipzig", pop: 597493 },
        { en: "Dresden", local: "Dresden", pop: 556780 },
        { en: "Chemnitz", local: "Chemnitz", pop: 244401 }
    ],
    "Schleswig-Holstein": [
        { en: "Kiel", local: "Kiel", pop: 246794 },
        { en: "Lübeck", local: "Lübeck", pop: 216530 }
    ]
};

// ══════ GB (United Kingdom) ══════
const GB_CITY_MASTER = {
    "England — London": [
        { en: "London", pop: 8982000 }
    ],
    "England — South East": [
        { en: "Brighton", pop: 229700 },
        { en: "Southampton", pop: 252796 },
        { en: "Portsmouth", pop: 208100 },
        { en: "Reading", pop: 174224 },
        { en: "Oxford", pop: 152450 }
    ],
    "England — West Midlands": [
        { en: "Birmingham", pop: 1144900 },
        { en: "Coventry", pop: 379387 },
        { en: "Wolverhampton", pop: 254406 }
    ],
    "England — North West": [
        { en: "Manchester", pop: 553230 },
        { en: "Liverpool", pop: 496784 },
        { en: "Preston", pop: 141818 }
    ],
    "England — Yorkshire": [
        { en: "Leeds", pop: 812000 },
        { en: "Sheffield", pop: 584853 },
        { en: "Bradford", pop: 537173 },
        { en: "York", pop: 210618 }
    ],
    "England — East Midlands": [
        { en: "Nottingham", pop: 321500 },
        { en: "Leicester", pop: 354224 },
        { en: "Derby", pop: 255394 }
    ],
    "England — North East": [
        { en: "Newcastle", pop: 302820 },
        { en: "Sunderland", pop: 277417 }
    ],
    "England — South West": [
        { en: "Bristol", pop: 467099 },
        { en: "Plymouth", pop: 264200 },
        { en: "Exeter", pop: 130428 }
    ],
    "Scotland": [
        { en: "Glasgow", pop: 635640 },
        { en: "Edinburgh", pop: 527620 },
        { en: "Aberdeen", pop: 198590 },
        { en: "Dundee", pop: 148820 }
    ],
    "Wales": [
        { en: "Cardiff", pop: 362756 },
        { en: "Swansea", pop: 246563 }
    ],
    "Northern Ireland": [
        { en: "Belfast", pop: 343542 }
    ]
};

// ══════ FR (France) ══════
const FR_CITY_MASTER = {
    "Île-de-France": [
        { en: "Paris", local: "Paris", pop: 2161000 },
        { en: "Boulogne-Billancourt", local: "Boulogne-Billancourt", pop: 120071 },
        { en: "Saint-Denis", local: "Saint-Denis", pop: 113067 }
    ],
    "Auvergne-Rhône-Alpes": [
        { en: "Lyon", local: "Lyon", pop: 516092 },
        { en: "Grenoble", local: "Grenoble", pop: 158454 },
        { en: "Saint-Étienne", local: "Saint-Étienne", pop: 172565 },
        { en: "Clermont-Ferrand", local: "Clermont-Ferrand", pop: 147284 }
    ],
    "Provence-Alpes-Côte d'Azur": [
        { en: "Marseille", local: "Marseille", pop: 870018 },
        { en: "Nice", local: "Nice", pop: 342669 },
        { en: "Toulon", local: "Toulon", pop: 176198 },
        { en: "Aix-en-Provence", local: "Aix-en-Provence", pop: 147122 }
    ],
    "Occitanie": [
        { en: "Toulouse", local: "Toulouse", pop: 486828 },
        { en: "Montpellier", local: "Montpellier", pop: 290053 },
        { en: "Nîmes", local: "Nîmes", pop: 150672 },
        { en: "Perpignan", local: "Perpignan", pop: 121875 }
    ],
    "Nouvelle-Aquitaine": [
        { en: "Bordeaux", local: "Bordeaux", pop: 257068 },
        { en: "Limoges", local: "Limoges", pop: 132175 }
    ],
    "Hauts-de-France": [
        { en: "Lille", local: "Lille", pop: 233897 },
        { en: "Amiens", local: "Amiens", pop: 134706 }
    ],
    "Grand Est": [
        { en: "Strasbourg", local: "Strasbourg", pop: 284677 },
        { en: "Reims", local: "Reims", pop: 183042 },
        { en: "Metz", local: "Metz", pop: 116429 }
    ],
    "Pays de la Loire": [
        { en: "Nantes", local: "Nantes", pop: 314138 },
        { en: "Le Mans", local: "Le Mans", pop: 143813 },
        { en: "Angers", local: "Angers", pop: 155850 }
    ],
    "Bretagne": [
        { en: "Rennes", local: "Rennes", pop: 216815 },
        { en: "Brest", local: "Brest", pop: 139386 }
    ]
};

// ══════ IT (Italy) ══════
const IT_CITY_MASTER = {
    "Lombardia": [
        { en: "Milan", local: "Milano", pop: 1396059 },
        { en: "Brescia", local: "Brescia", pop: 196670 },
        { en: "Bergamo", local: "Bergamo", pop: 122444 }
    ],
    "Lazio": [
        { en: "Rome", local: "Roma", pop: 2873000 }
    ],
    "Campania": [
        { en: "Naples", local: "Napoli", pop: 959470 },
        { en: "Salerno", local: "Salerno", pop: 135261 }
    ],
    "Piemonte": [
        { en: "Turin", local: "Torino", pop: 870952 }
    ],
    "Sicilia": [
        { en: "Palermo", local: "Palermo", pop: 663401 },
        { en: "Catania", local: "Catania", pop: 311584 },
        { en: "Messina", local: "Messina", pop: 236962 }
    ],
    "Veneto": [
        { en: "Venice", local: "Venezia", pop: 261905 },
        { en: "Verona", local: "Verona", pop: 259608 },
        { en: "Padova", local: "Padova", pop: 213009 }
    ],
    "Emilia-Romagna": [
        { en: "Bologna", local: "Bologna", pop: 394463 },
        { en: "Parma", local: "Parma", pop: 198292 },
        { en: "Modena", local: "Modena", pop: 186307 }
    ],
    "Toscana": [
        { en: "Florence", local: "Firenze", pop: 382258 },
        { en: "Prato", local: "Prato", pop: 195089 },
        { en: "Livorno", local: "Livorno", pop: 158493 }
    ],
    "Puglia": [
        { en: "Bari", local: "Bari", pop: 326799 },
        { en: "Taranto", local: "Taranto", pop: 195182 }
    ],
    "Liguria": [
        { en: "Genoa", local: "Genova", pop: 580097 }
    ]
};

// ══════ ES (Spain) ══════
const ES_CITY_MASTER = {
    "Comunidad de Madrid": [
        { en: "Madrid", local: "Madrid", pop: 3266126 },
        { en: "Móstoles", local: "Móstoles", pop: 207095 },
        { en: "Alcalá de Henares", local: "Alcalá de Henares", pop: 197562 },
        { en: "Fuenlabrada", local: "Fuenlabrada", pop: 194791 }
    ],
    "Cataluña": [
        { en: "Barcelona", local: "Barcelona", pop: 1636762 },
        { en: "Hospitalet de Llobregat", local: "L'Hospitalet", pop: 264923 },
        { en: "Badalona", local: "Badalona", pop: 223166 },
        { en: "Terrassa", local: "Terrassa", pop: 223627 }
    ],
    "Andalucía": [
        { en: "Seville", local: "Sevilla", pop: 688711 },
        { en: "Malaga", local: "Málaga", pop: 578460 },
        { en: "Cordoba", local: "Córdoba", pop: 325916 },
        { en: "Granada", local: "Granada", pop: 232462 },
        { en: "Jerez", local: "Jerez de la Frontera", pop: 212915 }
    ],
    "Comunidad Valenciana": [
        { en: "Valencia", local: "València", pop: 800215 },
        { en: "Alicante", local: "Alacant", pop: 337482 },
        { en: "Elche", local: "Elx", pop: 234765 }
    ],
    "País Vasco": [
        { en: "Bilbao", local: "Bilbo", pop: 346405 },
        { en: "Vitoria-Gasteiz", local: "Vitoria-Gasteiz", pop: 253672 }
    ],
    "Galicia": [
        { en: "Vigo", local: "Vigo", pop: 296692 },
        { en: "A Coruña", local: "A Coruña", pop: 245711 }
    ],
    "Castilla y León": [
        { en: "Valladolid", local: "Valladolid", pop: 298866 }
    ],
    "Canarias": [
        { en: "Las Palmas", local: "Las Palmas de Gran Canaria", pop: 379925 },
        { en: "Santa Cruz de Tenerife", local: "Santa Cruz de Tenerife", pop: 207312 }
    ],
    "Aragón": [
        { en: "Zaragoza", local: "Zaragoza", pop: 674997 }
    ],
    "Islas Baleares": [
        { en: "Palma de Mallorca", local: "Palma", pop: 416065 }
    ]
};

// ══════ NL (Netherlands) ══════
const NL_CITY_MASTER = {
    "Noord-Holland": [
        { en: "Amsterdam", local: "Amsterdam", pop: 873338 },
        { en: "Haarlem", local: "Haarlem", pop: 162902 }
    ],
    "Zuid-Holland": [
        { en: "Rotterdam", local: "Rotterdam", pop: 651446 },
        { en: "The Hague", local: "Den Haag", pop: 547757 },
        { en: "Leiden", local: "Leiden", pop: 124899 },
        { en: "Dordrecht", local: "Dordrecht", pop: 119114 }
    ],
    "Noord-Brabant": [
        { en: "Eindhoven", local: "Eindhoven", pop: 238478 },
        { en: "Tilburg", local: "Tilburg", pop: 222693 },
        { en: "Breda", local: "Breda", pop: 184126 }
    ],
    "Utrecht": [
        { en: "Utrecht", local: "Utrecht", pop: 361924 },
        { en: "Amersfoort", local: "Amersfoort", pop: 157276 }
    ],
    "Gelderland": [
        { en: "Nijmegen", local: "Nijmegen", pop: 177949 },
        { en: "Arnhem", local: "Arnhem", pop: 163575 },
        { en: "Apeldoorn", local: "Apeldoorn", pop: 163814 }
    ],
    "Overijssel": [
        { en: "Enschede", local: "Enschede", pop: 160995 }
    ],
    "Groningen": [
        { en: "Groningen", local: "Groningen", pop: 233218 }
    ]
};

// ══════ PL (Poland) ══════
const PL_CITY_MASTER = {
    "Mazowieckie": [
        { en: "Warsaw", local: "Warszawa", pop: 1793579 }
    ],
    "Małopolskie": [
        { en: "Krakow", local: "Kraków", pop: 780981 }
    ],
    "Dolnośląskie": [
        { en: "Wroclaw", local: "Wrocław", pop: 643782 }
    ],
    "Łódzkie": [
        { en: "Lodz", local: "Łódź", pop: 672185 }
    ],
    "Wielkopolskie": [
        { en: "Poznan", local: "Poznań", pop: 534813 }
    ],
    "Pomorskie": [
        { en: "Gdansk", local: "Gdańsk", pop: 470907 },
        { en: "Gdynia", local: "Gdynia", pop: 246306 }
    ],
    "Śląskie": [
        { en: "Katowice", local: "Katowice", pop: 292774 }
    ],
    "Zachodniopomorskie": [
        { en: "Szczecin", local: "Szczecin", pop: 401907 }
    ],
    "Lubelskie": [
        { en: "Lublin", local: "Lublin", pop: 340727 }
    ],
    "Kujawsko-Pomorskie": [
        { en: "Bydgoszcz", local: "Bydgoszcz", pop: 348190 }
    ]
};

// ══════ AU (Australia) ══════
const AU_CITY_MASTER = {
    "New South Wales": [
        { en: "Sydney", pop: 5312000 },
        { en: "Newcastle", pop: 322278 },
        { en: "Wollongong", pop: 302739 }
    ],
    "Victoria": [
        { en: "Melbourne", pop: 5078000 },
        { en: "Geelong", pop: 270800 }
    ],
    "Queensland": [
        { en: "Brisbane", pop: 2560700 },
        { en: "Gold Coast", pop: 679127 },
        { en: "Sunshine Coast", pop: 353294 },
        { en: "Townsville", pop: 196219 },
        { en: "Cairns", pop: 156169 }
    ],
    "Western Australia": [
        { en: "Perth", pop: 2085973 }
    ],
    "South Australia": [
        { en: "Adelaide", pop: 1376601 }
    ],
    "Tasmania": [
        { en: "Hobart", pop: 236348 }
    ],
    "Australian Capital Territory": [
        { en: "Canberra", pop: 457558 }
    ],
    "Northern Territory": [
        { en: "Darwin", pop: 147255 }
    ]
};

// ══════ CA (Canada) ══════
const CA_CITY_MASTER = {
    "Ontario": [
        { en: "Toronto", pop: 2794356 },
        { en: "Ottawa", pop: 1017449 },
        { en: "Mississauga", pop: 717961 },
        { en: "Brampton", pop: 656480 },
        { en: "Hamilton", pop: 569353 },
        { en: "London", pop: 422324 },
        { en: "Markham", pop: 338503 },
        { en: "Kitchener", pop: 256885 }
    ],
    "Quebec": [
        { en: "Montreal", pop: 1762949 },
        { en: "Quebec City", pop: 549459 },
        { en: "Laval", pop: 438366 },
        { en: "Gatineau", pop: 291041 },
        { en: "Longueuil", pop: 249277 }
    ],
    "British Columbia": [
        { en: "Vancouver", pop: 662248 },
        { en: "Surrey", pop: 568322 },
        { en: "Burnaby", pop: 249125 },
        { en: "Richmond", pop: 209937 },
        { en: "Victoria", pop: 91867 }
    ],
    "Alberta": [
        { en: "Calgary", pop: 1306784 },
        { en: "Edmonton", pop: 1010899 },
        { en: "Red Deer", pop: 100418 }
    ],
    "Manitoba": [
        { en: "Winnipeg", pop: 749607 }
    ],
    "Saskatchewan": [
        { en: "Saskatoon", pop: 317480 },
        { en: "Regina", pop: 228928 }
    ],
    "Nova Scotia": [
        { en: "Halifax", pop: 439819 }
    ]
};

// ══════ BR (Brazil) ══════
const BR_CITY_MASTER = {
    "São Paulo": [
        { en: "São Paulo", local: "São Paulo", pop: 12325232 },
        { en: "Guarulhos", local: "Guarulhos", pop: 1392121 },
        { en: "Campinas", local: "Campinas", pop: 1223237 },
        { en: "São Bernardo do Campo", local: "São Bernardo do Campo", pop: 844483 },
        { en: "Santos", local: "Santos", pop: 433311 }
    ],
    "Rio de Janeiro": [
        { en: "Rio de Janeiro", local: "Rio de Janeiro", pop: 6748000 },
        { en: "Niterói", local: "Niterói", pop: 515317 }
    ],
    "Minas Gerais": [
        { en: "Belo Horizonte", local: "Belo Horizonte", pop: 2521564 },
        { en: "Uberlândia", local: "Uberlândia", pop: 706244 },
        { en: "Contagem", local: "Contagem", pop: 668949 }
    ],
    "Bahia": [
        { en: "Salvador", local: "Salvador", pop: 2886698 },
        { en: "Feira de Santana", local: "Feira de Santana", pop: 619609 }
    ],
    "Rio Grande do Sul": [
        { en: "Porto Alegre", local: "Porto Alegre", pop: 1492530 },
        { en: "Caxias do Sul", local: "Caxias do Sul", pop: 516078 }
    ],
    "Paraná": [
        { en: "Curitiba", local: "Curitiba", pop: 1963726 },
        { en: "Londrina", local: "Londrina", pop: 575377 }
    ],
    "Pernambuco": [
        { en: "Recife", local: "Recife", pop: 1653461 },
        { en: "Jaboatão dos Guararapes", local: "Jaboatão", pop: 706867 }
    ],
    "Ceará": [
        { en: "Fortaleza", local: "Fortaleza", pop: 2686612 }
    ],
    "Distrito Federal": [
        { en: "Brasília", local: "Brasília", pop: 3055149 }
    ]
};

// ══════ IN (India) ══════
const IN_CITY_MASTER = {
    "Maharashtra": [
        { en: "Mumbai", local: "मुंबई", pop: 12442373 },
        { en: "Pune", local: "पुणे", pop: 3124458 },
        { en: "Nagpur", local: "नागपूर", pop: 2405421 }
    ],
    "Delhi": [
        { en: "New Delhi", local: "नई दिल्ली", pop: 11034555 }
    ],
    "Karnataka": [
        { en: "Bangalore", local: "ಬೆಂಗಳೂರು", pop: 8443675 },
        { en: "Mysore", local: "ಮೈಸೂರು", pop: 920550 }
    ],
    "Tamil Nadu": [
        { en: "Chennai", local: "சென்னை", pop: 4681087 },
        { en: "Coimbatore", local: "கோயம்புத்தூர்", pop: 1061447 },
        { en: "Madurai", local: "மதுரை", pop: 1017865 }
    ],
    "Telangana": [
        { en: "Hyderabad", local: "హైదరాబాద్", pop: 6809970 }
    ],
    "West Bengal": [
        { en: "Kolkata", local: "কলকাতা", pop: 4496694 }
    ],
    "Gujarat": [
        { en: "Ahmedabad", local: "અમદાવાદ", pop: 5570585 },
        { en: "Surat", local: "સુરત", pop: 4467797 },
        { en: "Vadodara", local: "વડોદરા", pop: 1670806 }
    ],
    "Rajasthan": [
        { en: "Jaipur", local: "जयपुर", pop: 3073350 },
        { en: "Jodhpur", local: "जोधपुर", pop: 1033918 }
    ],
    "Uttar Pradesh": [
        { en: "Lucknow", local: "लखनऊ", pop: 2817105 },
        { en: "Kanpur", local: "कानपुर", pop: 2767031 },
        { en: "Agra", local: "आगरा", pop: 1585704 }
    ],
    "Kerala": [
        { en: "Kochi", local: "കൊച്ചി", pop: 677381 },
        { en: "Thiruvananthapuram", local: "തിരുവനന്തപുരം", pop: 957730 }
    ]
};

// ══════ MX (Mexico) ══════
const MX_CITY_MASTER = {
    "Ciudad de México": [
        { en: "Mexico City", local: "Ciudad de México", pop: 9209944 }
    ],
    "Estado de México": [
        { en: "Ecatepec", local: "Ecatepec de Morelos", pop: 1645352 },
        { en: "Nezahualcóyotl", local: "Nezahualcóyotl", pop: 1077208 },
        { en: "Naucalpan", local: "Naucalpan de Juárez", pop: 844219 },
        { en: "Toluca", local: "Toluca de Lerdo", pop: 873536 }
    ],
    "Jalisco": [
        { en: "Guadalajara", local: "Guadalajara", pop: 1385629 },
        { en: "Zapopan", local: "Zapopan", pop: 1476491 },
        { en: "Tlaquepaque", local: "Tlaquepaque", pop: 664193 }
    ],
    "Nuevo León": [
        { en: "Monterrey", local: "Monterrey", pop: 1142994 },
        { en: "Guadalupe", local: "Guadalupe", pop: 678006 },
        { en: "San Nicolás", local: "San Nicolás de los Garza", pop: 430143 }
    ],
    "Puebla": [
        { en: "Puebla", local: "Puebla de Zaragoza", pop: 1692181 }
    ],
    "Guanajuato": [
        { en: "León", local: "León de los Aldama", pop: 1578626 },
        { en: "Irapuato", local: "Irapuato", pop: 529440 }
    ],
    "Chihuahua": [
        { en: "Juárez", local: "Ciudad Juárez", pop: 1512354 },
        { en: "Chihuahua", local: "Chihuahua", pop: 925762 }
    ],
    "Yucatán": [
        { en: "Mérida", local: "Mérida", pop: 995129 }
    ],
    "Querétaro": [
        { en: "Querétaro", local: "Santiago de Querétaro", pop: 1049777 }
    ]
};

// ══════ TR (Türkiye) ══════
const TR_CITY_MASTER = {
    "Marmara": [
        { en: "Istanbul", local: "İstanbul", pop: 15840900 },
        { en: "Bursa", local: "Bursa", pop: 3147818 },
        { en: "Kocaeli", local: "Kocaeli", pop: 2033441 }
    ],
    "İç Anadolu": [
        { en: "Ankara", local: "Ankara", pop: 5747325 },
        { en: "Konya", local: "Konya", pop: 2277017 },
        { en: "Kayseri", local: "Kayseri", pop: 1421455 },
        { en: "Eskişehir", local: "Eskişehir", pop: 888828 }
    ],
    "Ege": [
        { en: "Izmir", local: "İzmir", pop: 4394694 },
        { en: "Denizli", local: "Denizli", pop: 1037208 }
    ],
    "Akdeniz": [
        { en: "Antalya", local: "Antalya", pop: 2548308 },
        { en: "Adana", local: "Adana", pop: 2258718 },
        { en: "Mersin", local: "Mersin", pop: 1868757 }
    ],
    "Güneydoğu Anadolu": [
        { en: "Gaziantep", local: "Gaziantep", pop: 2130432 },
        { en: "Şanlıurfa", local: "Şanlıurfa", pop: 2073614 },
        { en: "Diyarbakır", local: "Diyarbakır", pop: 1790823 }
    ],
    "Karadeniz": [
        { en: "Samsun", local: "Samsun", pop: 1356079 },
        { en: "Trabzon", local: "Trabzon", pop: 808974 }
    ]
};

// ══════ CO (Colombia) ══════
const CO_CITY_MASTER = {
    "Bogotá D.C.": [
        { en: "Bogotá", local: "Bogotá", pop: 7181469 }
    ],
    "Antioquia": [
        { en: "Medellín", local: "Medellín", pop: 2569007 },
        { en: "Bello", local: "Bello", pop: 533264 }
    ],
    "Valle del Cauca": [
        { en: "Cali", local: "Cali", pop: 2252616 },
        { en: "Buenaventura", local: "Buenaventura", pop: 407539 }
    ],
    "Atlántico": [
        { en: "Barranquilla", local: "Barranquilla", pop: 1274250 },
        { en: "Soledad", local: "Soledad", pop: 685584 }
    ],
    "Santander": [
        { en: "Bucaramanga", local: "Bucaramanga", pop: 581130 }
    ],
    "Bolívar": [
        { en: "Cartagena", local: "Cartagena de Indias", pop: 1028736 }
    ]
};

// ══════ ID (Indonesia) ══════
const ID_CITY_MASTER = {
    "DKI Jakarta": [
        { en: "Jakarta", local: "Jakarta", pop: 10562088 }
    ],
    "Jawa Barat": [
        { en: "Bandung", local: "Bandung", pop: 2444160 },
        { en: "Bekasi", local: "Bekasi", pop: 2543676 },
        { en: "Depok", local: "Depok", pop: 2056335 },
        { en: "Bogor", local: "Bogor", pop: 1043070 }
    ],
    "Jawa Timur": [
        { en: "Surabaya", local: "Surabaya", pop: 2874314 },
        { en: "Malang", local: "Malang", pop: 843810 }
    ],
    "Jawa Tengah": [
        { en: "Semarang", local: "Semarang", pop: 1653524 },
        { en: "Solo", local: "Surakarta", pop: 522364 }
    ],
    "Banten": [
        { en: "Tangerang", local: "Tangerang", pop: 1895486 },
        { en: "South Tangerang", local: "Tangerang Selatan", pop: 1492999 }
    ],
    "DI Yogyakarta": [
        { en: "Yogyakarta", local: "Yogyakarta", pop: 414055 }
    ],
    "Sumatera Utara": [
        { en: "Medan", local: "Medan", pop: 2435252 }
    ],
    "Sulawesi Selatan": [
        { en: "Makassar", local: "Makassar", pop: 1526677 }
    ],
    "Bali": [
        { en: "Denpasar", local: "Denpasar", pop: 725314 }
    ]
};

// ══════ RU (Russia) ══════
const RU_CITY_MASTER = {
    "Центральный": [
        { en: "Moscow", local: "Москва", pop: 12655050 },
        { en: "Voronezh", local: "Воронеж", pop: 1058261 }
    ],
    "Северо-Западный": [
        { en: "Saint Petersburg", local: "Санкт-Петербург", pop: 5384342 },
        { en: "Kaliningrad", local: "Калининград", pop: 489359 }
    ],
    "Южный": [
        { en: "Rostov-on-Don", local: "Ростов-на-Дону", pop: 1137904 },
        { en: "Volgograd", local: "Волгоград", pop: 1004763 },
        { en: "Krasnodar", local: "Краснодар", pop: 948827 }
    ],
    "Приволжский": [
        { en: "Nizhny Novgorod", local: "Нижний Новгород", pop: 1252236 },
        { en: "Kazan", local: "Казань", pop: 1257391 },
        { en: "Samara", local: "Самара", pop: 1144759 },
        { en: "Ufa", local: "Уфа", pop: 1128787 },
        { en: "Perm", local: "Пермь", pop: 1055397 }
    ],
    "Уральский": [
        { en: "Yekaterinburg", local: "Екатеринбург", pop: 1544376 },
        { en: "Chelyabinsk", local: "Челябинск", pop: 1202371 },
        { en: "Tyumen", local: "Тюмень", pop: 816700 }
    ],
    "Сибирский": [
        { en: "Novosibirsk", local: "Новосибирск", pop: 1633595 },
        { en: "Omsk", local: "Омск", pop: 1139897 },
        { en: "Krasnoyarsk", local: "Красноярск", pop: 1092851 }
    ],
    "Дальневосточный": [
        { en: "Vladivostok", local: "Владивосток", pop: 606589 },
        { en: "Khabarovsk", local: "Хабаровск", pop: 616242 }
    ]
};
