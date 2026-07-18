"""
Build a self-contained training corpus from the uploaded openfootball World Cup
archive (1930-2022) + the transcribed Euros, and extract the real 2026 schedule
and live results. Writes compact JSON into ../data so the project no longer
depends on the uploaded folder.

Run once (re-run if the uploaded 2026 file is refreshed):
    python3 build_corpus.py
"""
import json, glob, os

from data_sources import norm, TEAMS, NORMALIZE
from parse_txt import parse as parse_txt

WC_REPO = "/sessions/nifty-cool-cannon/mnt/worldcup.json-master"
EURO_REPO = "/sessions/nifty-cool-cannon/mnt/euro-master"
GLOBAL_NAMES = set(TEAMS) | set(NORMALIZE)
DATA = os.path.join(os.path.dirname(__file__), "..", "data")
os.makedirs(DATA, exist_ok=True)


def ft(m):
    s = m.get("score") or {}
    v = s.get("ft")
    if not v or len(v) != 2:
        return None
    return int(v[0]), int(v[1])


def main():
    corpus = []
    # ---- World Cups 1930-2022 (skip the live 2026/2025 files here)
    for f in sorted(glob.glob(os.path.join(WC_REPO, "*/worldcup.json"))):
        year = int(os.path.basename(os.path.dirname(f)))
        if year >= 2025:
            continue
        for m in json.load(open(f)).get("matches", []):
            sc = ft(m)
            if not sc:
                continue
            corpus.append({"h": norm(m["team1"]), "a": norm(m["team2"]),
                           "hg": sc[0], "ag": sc[1], "comp": "World Cup", "year": year})

    # ---- Euros 1960-2024 (parsed from the uploaded openfootball euro repo)
    for f in sorted(glob.glob(os.path.join(EURO_REPO, "*/euro.txt"))):
        year = int(os.path.basename(os.path.dirname(f))[:4])
        if year >= 2026:
            continue
        for h, a, hg, ag in parse_txt(open(f).read(), GLOBAL_NAMES):
            corpus.append({"h": norm(h), "a": norm(a), "hg": hg, "ag": ag,
                           "comp": "Euro", "year": year})

    # ---- internationals: WC qualifiers, Copa qualifiers, Nations League, AFCON
    MNT = "/sessions/nifty-cool-cannon/mnt"
    flat_sources = [
        (f"{MNT}/fifa_world_cup_qualification/*.txt", "Qualifier"),
        (f"{MNT}/copa_america_qualification/*.txt", "Qualifier"),
        (f"{MNT}/uefa_nations_league/*.txt", "Nations League"),
        (f"{MNT}/african_cup_of_nations/*.txt", "AFCON"),
    ]
    for pattern, comp in flat_sources:
        for f in sorted(glob.glob(pattern)):
            base = os.path.basename(f)[:4]
            year = int(base) if base.isdigit() else 2016
            for h, a, hg, ag in parse_txt(open(f).read(), GLOBAL_NAMES):
                corpus.append({"h": norm(h), "a": norm(a), "hg": hg, "ag": ag,
                               "comp": comp, "year": year})

    # ---- Copa America finals (uploaded copa-america-master)
    for f in sorted(glob.glob(f"{MNT}/copa-america-master/*/copa.txt")):
        base = os.path.basename(os.path.dirname(f))[:4]
        year = int(base) if base.isdigit() else 2016
        for h, a, hg, ag in parse_txt(open(f).read(), GLOBAL_NAMES):
            corpus.append({"h": norm(h), "a": norm(a), "hg": hg, "ag": ag,
                           "comp": "Copa America", "year": year})

    with open(os.path.join(DATA, "training_matches.json"), "w") as fh:
        json.dump(corpus, fh, ensure_ascii=False)

    # ---- 2026: real schedule + live results
    src = json.load(open(os.path.join(WC_REPO, "2026/worldcup.json")))
    fixtures = []
    for m in src.get("matches", []):
        sc = ft(m)
        fixtures.append({
            "date": m.get("date"), "round": m.get("round"), "time": m.get("time"),
            "group": (m.get("group") or "").replace("Group ", "") or None,
            "home": norm(m["team1"]), "away": norm(m["team2"]),
            "venue": m.get("ground"),
            "result": ({"home": sc[0], "away": sc[1]} if sc else None),
        })
    with open(os.path.join(DATA, "wc2026.json"), "w") as fh:
        json.dump({"name": src.get("name"), "matches": fixtures}, fh, ensure_ascii=False)

    # ---- report
    played = [m for m in fixtures if m["result"]]
    fs = [m for m in fixtures if {m["home"], m["away"]} == {"France", "Senegal"}]
    from collections import Counter
    comp_counts = Counter(c["comp"] for c in corpus)
    yrs = sorted({c["year"] for c in corpus if c["comp"] == "World Cup"})
    print(f"training corpus: {len(corpus)} matches  {dict(comp_counts)}")
    print(f"WC editions: {len(yrs)} ({yrs[0]}-{yrs[-1]})")
    print(f"2026: {len(fixtures)} fixtures, {len(played)} played so far")
    print("France-Senegal in 2026 file:",
          (f"{fs[0]['date']} Group {fs[0]['group']} @ {fs[0]['venue']} result={fs[0]['result']}"
           if fs else "NOT FOUND"))
    print("first 6 played 2026:")
    for m in played[:6]:
        print("  ", m["date"], m["home"], m["result"]["home"], "-", m["result"]["away"], m["away"])


if __name__ == "__main__":
    main()
