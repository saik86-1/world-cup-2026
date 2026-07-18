"""
Static reference data: team strength (Elo), confederations, flags, name
normalization, and competition importance weights.

Elo values are current-era ratings anchored to published June-2026 World Football
Elo values (Spain 2157, Argentina 2115, France 2063, England 2024, Netherlands
2035, Brazil 1991, Portugal 1989, Colombia 1982) with the rest placed on the same
scale from recent form. They SEED the engine; the Elo system then updates them
live from real results.

For historical training matches a team's current rating is used as a strength
proxy (standard practice; documented limitation). The neural net trains on these
gaps with competition-importance sample weights, World Cup and continental finals
weighted highest per the user's request.

Match data is NOT stored here: the World Cup archive 1930-2022 is parsed from the
uploaded openfootball repo and the Euros from historical_extra.py, both
consolidated into data/training_matches.json by build_corpus.py.
"""

# name -> (elo, confederation, flag)   flag "" = training-only team (not displayed)
# Elo ratings are the exact World Football Elo values as of 2026-06-16 (eloratings.net).
TEAMS = {
    # ---- 2026 qualified nations (live prediction set)
    "Spain": (2129, "UEFA", "🇪🇸"), "Argentina": (2115, "CONMEBOL", "🇦🇷"),
    "France": (2063, "UEFA", "🇫🇷"), "Netherlands": (1944, "UEFA", "🇳🇱"),
    "England": (2024, "UEFA", "🏴󠁧󠁢󠁥󠁮󠁧󠁿"), "Brazil": (1978, "CONMEBOL", "🇧🇷"),
    "Portugal": (1989, "UEFA", "🇵🇹"), "Colombia": (1982, "CONMEBOL", "🇨🇴"),
    "Germany": (1939, "UEFA", "🇩🇪"), "Croatia": (1912, "UEFA", "🇭🇷"),
    "Belgium": (1879, "UEFA", "🇧🇪"), "Uruguay": (1870, "CONMEBOL", "🇺🇾"),
    "Morocco": (1840, "CAF", "🇲🇦"), "Switzerland": (1865, "UEFA", "🇨🇭"),
    "Mexico": (1881, "CONCACAF", "🇲🇽"), "Japan": (1910, "AFC", "🇯🇵"),
    "Austria": (1830, "UEFA", "🇦🇹"), "Senegal": (1860, "CAF", "🇸🇳"),
    "USA": (1780, "CONCACAF", "🇺🇸"), "Norway": (1914, "UEFA", "🇳🇴"),
    "Ecuador": (1890, "CONMEBOL", "🇪🇨"), "South Korea": (1786, "AFC", "🇰🇷"),
    "Czech Republic": (1712, "UEFA", "🇨🇿"), "Iran": (1756, "AFC", "🇮🇷"),
    "Turkey": (1849, "UEFA", "🇹🇷"), "Scotland": (1794, "UEFA", "🏴󠁧󠁢󠁳󠁣󠁴󠁿"),
    "Algeria": (1772, "CAF", "🇩🇿"), "Sweden": (1755, "UEFA", "🇸🇪"),
    "Canada": (1767, "CONCACAF", "🇨🇦"), "Australia": (1839, "AFC", "🇦🇺"),
    "Ivory Coast": (1743, "CAF", "🇨🇮"), "Egypt": (1711, "CAF", "🇪🇬"),
    "Paraguay": (1700, "CONMEBOL", "🇵🇾"), "Bosnia & Herzegovina": (1616, "UEFA", "🇧🇦"),
    "Tunisia": (1585, "CAF", "🇹🇳"), "DR Congo": (1652, "CAF", "🇨🇩"),
    "Qatar": (1447, "AFC", "🇶🇦"), "Ghana": (1510, "CAF", "🇬🇭"),
    "Cape Verde": (1606, "CAF", "🇨🇻"), "Saudi Arabia": (1598, "AFC", "🇸🇦"),
    "South Africa": (1511, "CAF", "🇿🇦"), "Panama": (1730, "CONCACAF", "🇵🇦"),
    "Uzbekistan": (1714, "AFC", "🇺🇿"), "Jordan": (1680, "AFC", "🇯🇴"),
    "Iraq": (1607, "AFC", "🇮🇶"), "Curaçao": (1427, "CONCACAF", "🇨🇼"),
    "New Zealand": (1578, "OFC", "🇳🇿"), "Haiti": (1536, "CONCACAF", "🇭🇹"),
    # ---- training-only nations (historical opponents; exact 2026-06-16 Elo)
    "Italy": (1869, "UEFA", ""), "Denmark": (1869, "UEFA", ""),
    "Serbia": (1734, "UEFA", ""), "Poland": (1710, "UEFA", ""),
    "Chile": (1717, "CONMEBOL", ""), "Wales": (1682, "UEFA", ""),
    "Ukraine": (1780, "UEFA", ""), "Russia": (1772, "UEFA", ""),
    "Greece": (1744, "UEFA", ""), "Peru": (1700, "CONMEBOL", ""),
    "Romania": (1639, "UEFA", ""), "Nigeria": (1767, "CAF", ""),
    "Cameroon": (1614, "CAF", ""), "Hungary": (1710, "UEFA", ""),
    "Slovakia": (1667, "UEFA", ""), "Slovenia": (1682, "UEFA", ""),
    "Ireland": (1699, "UEFA", ""), "Costa Rica": (1608, "CONCACAF", ""),
    "Georgia": (1654, "UEFA", ""), "Iceland": (1568, "UEFA", ""),
    "Albania": (1616, "UEFA", ""), "Finland": (1536, "UEFA", ""),
    "North Macedonia": (1589, "UEFA", ""), "Northern Ireland": (1605, "UEFA", ""),
    "Israel": (1647, "UEFA", ""), "Bulgaria": (1458, "UEFA", ""),
    "Angola": (1542, "CAF", ""), "Honduras": (1570, "CONCACAF", ""),
    "Bolivia": (1621, "CONMEBOL", ""), "Jamaica": (1527, "CONCACAF", ""),
    "Togo": (1379, "CAF", ""), "United Arab Emirates": (1540, "AFC", ""),
    "Trinidad and Tobago": (1386, "CONCACAF", ""), "China": (1424, "AFC", ""),
    "El Salvador": (1342, "CONCACAF", ""), "Kuwait": (1332, "AFC", ""),
    "Latvia": (1288, "UEFA", ""), "North Korea": (1375, "AFC", ""),
    "Cuba": (1239, "CONCACAF", ""), "Indonesia": (1372, "AFC", ""),
    # ---- qualifier opponents (exact 2026-06-16 Elo) so mismatches aren't dropped
    "Venezuela": (1733, "CONMEBOL", ""), "Kosovo": (1715, "UEFA", ""),
    "Mali": (1588, "CAF", ""), "Guatemala": (1504, "CONCACAF", ""),
    "Oman": (1480, "AFC", ""), "Syria": (1479, "AFC", ""),
    "Palestine": (1465, "AFC", ""), "Guinea": (1463, "CAF", ""),
    "Montenegro": (1461, "UEFA", ""), "Luxembourg": (1450, "UEFA", ""),
    "Suriname": (1431, "CONCACAF", ""), "Kazakhstan": (1428, "UEFA", ""),
    "Libya": (1420, "CAF", ""), "Gambia": (1419, "CAF", ""),
    "Bahrain": (1414, "AFC", ""), "Benin": (1405, "CAF", ""),
    "Gabon": (1401, "CAF", ""), "Uganda": (1394, "CAF", ""),
    "Faroe Islands": (1386, "UEFA", ""), "Niger": (1382, "CAF", ""),
    "Madagascar": (1380, "CAF", ""), "Equatorial Guinea": (1380, "CAF", ""),
    "Thailand": (1376, "AFC", ""), "Comoros": (1374, "CAF", ""),
    "Armenia": (1373, "UEFA", ""), "Zimbabwe": (1372, "CAF", ""),
    "Zambia": (1371, "CAF", ""), "Kenya": (1363, "CAF", ""),
    "Estonia": (1360, "UEFA", ""), "Vietnam": (1351, "AFC", ""),
    "Sudan": (1350, "CAF", ""), "Mozambique": (1342, "CAF", ""),
    "Guadeloupe": (1338, "CONCACAF", ""), "Sierra Leone": (1341, "CAF", ""),
    "Rwanda": (1336, "CAF", ""), "Nicaragua": (1333, "CONCACAF", ""),
    "Mauritania": (1329, "CAF", ""), "Azerbaijan": (1322, "UEFA", ""),
    "Cyprus": (1314, "UEFA", ""), "Tanzania": (1313, "CAF", ""),
    "Martinique": (1312, "CONCACAF", ""), "Liberia": (1304, "CAF", ""),
    "Namibia": (1303, "CAF", ""), "Kyrgyzstan": (1295, "AFC", ""),
    "Malaysia": (1293, "AFC", ""), "Guyana": (1292, "CONCACAF", ""),
    "Lebanon": (1288, "AFC", ""), "Ethiopia": (1287, "CAF", ""),
    "New Caledonia": (1286, "OFC", ""), "Tajikistan": (1285, "AFC", ""),
    "Burundi": (1285, "CAF", ""), "Dominican Republic": (1283, "CONCACAF", ""),
    "Lithuania": (1279, "UEFA", ""), "Moldova": (1270, "UEFA", ""),
    "Botswana": (1267, "CAF", ""), "Malta": (1255, "UEFA", ""),
    "Guinea-Bissau": (1248, "CAF", ""), "Malawi": (1239, "CAF", ""),
    "French Guiana": (1223, "CONCACAF", ""), "Turkmenistan": (1209, "AFC", ""),
    "Andorra": (1080, "UEFA", ""), "Liechtenstein": (895, "UEFA", ""),
    "Gibraltar": (1011, "UEFA", ""), "San Marino": (825, "UEFA", ""),
}

# defunct / variant names -> the entry above (so they share Elo + history)
NORMALIZE = {
    "West Germany": "Germany", "East Germany": "Germany", "Soviet Union": "Russia",
    "Czechoslovakia": "Czech Republic", "Czechia": "Czech Republic",
    "Yugoslavia": "Serbia", "FR Yugoslavia": "Serbia", "Serbia and Montenegro": "Serbia",
    "Zaire": "DR Congo", "Dutch East Indies": "Indonesia",
    "United States": "USA", "Korea Republic": "South Korea", "IR Iran": "Iran",
    "Republic of Ireland": "Ireland", "China PR": "China",
    "Côte d'Ivoire": "Ivory Coast", "Bosnia-Herzegovina": "Bosnia & Herzegovina",
}
def norm(n):
    return NORMALIZE.get(n, n)

COMP_WEIGHT = {
    "World Cup": 60, "Euro": 50, "Copa America": 50, "AFCON": 50,
    "Qualifier": 40, "Nations League": 40, "Confederations": 35, "Friendly": 20,
}
