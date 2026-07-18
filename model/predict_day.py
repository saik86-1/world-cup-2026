"""
Daily runner. Self-contained: on every run it replays EVERY matchday from the
start up to today, predicting each day with that day's pre-match Elo (honest,
no hindsight), scores finished games, and writes the full record + today's
predictions. No committed archive or manual backfill needed — just keep
RESULTS_OVERRIDE current and run it.
"""
import json, math, os
from datetime import datetime

from data_sources import TEAMS
from engine import Elo, train_net, predict_match, head_to_head, appearances

DATA = os.path.join(os.path.dirname(__file__), "..", "data")
HOSTS = {"USA", "Mexico", "Canada"}
TARGET_DATE = os.environ.get("WC_DATE") or datetime.utcnow().strftime("%Y-%m-%d")
EASTERN_OFFSET = -4
ELO_ADJUST = {"2026-06-16": {"France": -15}}  # Saliba/Mbappe fitness doubts (pre-match)
START_DATE = "2026-06-16"  # the project's first predictions; record starts here

# Final results, id = date-home-away (spaces -> _). Add yesterday's scores here daily.
RESULTS_OVERRIDE = {
    "2026-06-16-France-Senegal": {"home": 3, "away": 1},
    "2026-06-16-Iraq-Norway": {"home": 1, "away": 4},
    "2026-06-16-Argentina-Algeria": {"home": 3, "away": 0},
    "2026-06-16-Austria-Jordan": {"home": 3, "away": 1},
    "2026-06-17-Portugal-DR_Congo": {"home": 1, "away": 1},
    "2026-06-17-England-Croatia": {"home": 4, "away": 2},
    "2026-06-17-Ghana-Panama": {"home": 1, "away": 0},
    "2026-06-17-Uzbekistan-Colombia": {"home": 1, "away": 3},
    "2026-06-18-Czech_Republic-South_Africa": {"home": 1, "away": 1},
    "2026-06-18-Switzerland-Bosnia_&_Herzegovina": {"home": 4, "away": 1},
    "2026-06-18-Canada-Qatar": {"home": 6, "away": 0},
    "2026-06-18-Mexico-South_Korea": {"home": 1, "away": 0},
    "2026-06-19-Scotland-Morocco": {"home": 0, "away": 1},
    "2026-06-19-Brazil-Haiti": {"home": 3, "away": 0},
    "2026-06-19-USA-Australia": {"home": 2, "away": 0},
    "2026-06-19-Turkey-Paraguay": {"home": 0, "away": 1},
    "2026-06-20-Germany-Ivory_Coast": {"home": 2, "away": 1},
    "2026-06-20-Ecuador-Curaçao": {"home": 0, "away": 0},
    "2026-06-20-Netherlands-Sweden": {"home": 5, "away": 1},
    "2026-06-20-Tunisia-Japan": {"home": 0, "away": 4},
    "2026-06-21-Belgium-Iran": {"home": 0, "away": 0},
    "2026-06-21-New_Zealand-Egypt": {"home": 1, "away": 3},
    "2026-06-21-Spain-Saudi_Arabia": {"home": 4, "away": 0},
    "2026-06-21-Uruguay-Cape_Verde": {"home": 2, "away": 2},
    "2026-06-22-Argentina-Austria": {"home": 2, "away": 0},
    "2026-06-22-France-Iraq": {"home": 3, "away": 0},
    "2026-06-22-Norway-Senegal": {"home": 3, "away": 2},
    "2026-06-22-Jordan-Algeria": {"home": 1, "away": 2},
    "2026-06-23-England-Ghana": {"home": 0, "away": 0},
    "2026-06-23-Panama-Croatia": {"home": 0, "away": 1},
    "2026-06-23-Colombia-DR_Congo": {"home": 1, "away": 0},
    "2026-06-24-Switzerland-Canada": {"home": 2, "away": 1},
    "2026-06-24-Bosnia_&_Herzegovina-Qatar": {"home": 3, "away": 1},
    "2026-06-24-Scotland-Brazil": {"home": 0, "away": 3},
    "2026-06-24-Morocco-Haiti": {"home": 4, "away": 2},
    "2026-06-24-Czech_Republic-Mexico": {"home": 0, "away": 3},
    "2026-06-24-South_Africa-South_Korea": {"home": 1, "away": 0},
    "2026-06-25-Curaçao-Ivory_Coast": {"home": 0, "away": 2},
    "2026-06-25-Ecuador-Germany": {"home": 2, "away": 1},
    "2026-06-25-Japan-Sweden": {"home": 1, "away": 1},
    "2026-06-25-Tunisia-Netherlands": {"home": 1, "away": 3},
    "2026-06-25-Turkey-USA": {"home": 3, "away": 2},
    "2026-06-25-Paraguay-Australia": {"home": 0, "away": 0},
    "2026-06-26-Norway-France": {"home": 1, "away": 4},
    "2026-06-26-Senegal-Iraq": {"home": 5, "away": 0},
    "2026-06-26-Cape_Verde-Saudi_Arabia": {"home": 0, "away": 0},
    "2026-06-26-Uruguay-Spain": {"home": 0, "away": 1},
    "2026-06-26-Egypt-Iran": {"home": 1, "away": 1},
    "2026-06-26-New_Zealand-Belgium": {"home": 1, "away": 5},
    "2026-06-27-Panama-England": {"home": 0, "away": 2},
    "2026-06-27-Croatia-Ghana": {"home": 2, "away": 1},
    "2026-06-27-Colombia-Portugal": {"home": 0, "away": 0},
    "2026-06-27-DR_Congo-Uzbekistan": {"home": 3, "away": 1},
    "2026-06-27-Algeria-Austria": {"home": 3, "away": 3},
    "2026-06-27-Jordan-Argentina": {"home": 1, "away": 3},
    "2026-06-28-South_Africa-Canada": {"home": 0, "away": 1},
    "2026-06-29-Brazil-Japan": {"home": 2, "away": 1},
    "2026-06-29-Netherlands-Morocco": {"home": 1, "away": 1},
    "2026-06-29-Germany-Paraguay": {"home": 1, "away": 1},
    "2026-06-30-Ivory_Coast-Norway": {"home": 1, "away": 2},
    "2026-06-30-Mexico-Ecuador": {"home": 2, "away": 0},
    "2026-06-30-France-Sweden": {"home": 3, "away": 0},
    "2026-07-01-England-DR_Congo": {"home": 2, "away": 1},
    "2026-07-01-Belgium-Senegal": {"home": 3, "away": 2},
    "2026-07-01-USA-Bosnia_&_Herzegovina": {"home": 2, "away": 0},
    "2026-07-02-Spain-Austria": {"home": 3, "away": 0},
    "2026-07-02-Portugal-Croatia": {"home": 2, "away": 1},
    "2026-07-02-Switzerland-Algeria": {"home": 2, "away": 0},
    "2026-07-03-Australia-Egypt": {"home": 1, "away": 1},
    "2026-07-03-Argentina-Cape_Verde": {"home": 3, "away": 2},
    "2026-07-03-Colombia-Ghana": {"home": 1, "away": 0},
    "2026-07-04-Canada-Morocco": {"home": 0, "away": 3},
    "2026-07-04-Paraguay-France": {"home": 0, "away": 1},
    "2026-07-05-Brazil-Norway": {"home": 1, "away": 2},
    "2026-07-05-Mexico-England": {"home": 2, "away": 3},
    "2026-07-06-Portugal-Spain": {"home": 0, "away": 1},
    "2026-07-06-USA-Belgium": {"home": 1, "away": 4},
    "2026-07-07-Argentina-Egypt": {"home": 3, "away": 2},
    "2026-07-07-Switzerland-Colombia": {"home": 0, "away": 0},
    "2026-07-09-France-Morocco": {"home": 2, "away": 0},
    "2026-07-10-Spain-Belgium": {"home": 2, "away": 1},
    "2026-07-11-Norway-England": {"home": 1, "away": 2},
    "2026-07-11-Argentina-Switzerland": {"home": 3, "away": 1},
    "2026-07-14-France-Spain": {"home": 0, "away": 2},
    "2026-07-15-Argentina-England": {"home": 2, "away": 1},
    "2026-06-23-Portugal-Uzbekistan": {"home": 5, "away": 0},
}


def host_of(h, a):
    if h in HOSTS and a not in HOSTS: return h, False
    if a in HOSTS and h not in HOSTS: return a, False
    if h in HOSTS and a in HOSTS: return h, False
    return None, True


def to_eastern(raw):
    if not raw:
        return None, 9999
    try:
        hm, tz = raw.split()
        hh, mm = (int(x) for x in hm.split(":"))
        et = hh * 60 + mm - int(tz.replace("UTC", "")) * 60 + EASTERN_OFFSET * 60
        s = et % (24 * 60); h24, m = divmod(s, 60)
        return f"{h24 % 12 or 12}:{m:02d} {'AM' if h24 < 12 else 'PM'} ET", et
    except Exception:
        return None, 9999


def mid_of(date, h, a):
    return f"{date}-{h}-{a}".replace(" ", "_")


def main():
    fixtures = json.load(open(os.path.join(DATA, "wc2026.json")))["matches"]
    known = [m for m in fixtures if m["home"] in TEAMS and m["away"] in TEAMS]

    def result_of(m):
        return RESULTS_OVERRIDE.get(mid_of(m["date"], m["home"], m["away"]), m["result"])

    fixture_dates = sorted({m["date"] for m in known})
    featured = TARGET_DATE if TARGET_DATE in fixture_dates else next(
        (d for d in fixture_dates if d >= TARGET_DATE),
        fixture_dates[-1] if fixture_dates else TARGET_DATE)
    days = [d for d in fixture_dates if START_DATE <= d <= featured]

    lineup_path = os.path.join(DATA, "lineup_adjust.json")
    lineup_adj = json.load(open(lineup_path)) if os.path.exists(lineup_path) else {}

    elo = Elo()
    clf, scaler, n_train = train_net()
    archive, recorded, predictions = {}, [], []

    for d in days:
        day_fx = sorted([m for m in known if m["date"] == d],
                        key=lambda m: to_eastern(m.get("time"))[1])
        day_preds = []
        is_featured = (d == featured)
        for m in day_fx:
            host, neutral = host_of(m["home"], m["away"])
            mid = mid_of(m["date"], m["home"], m["away"])
            adj = dict(ELO_ADJUST.get(d, {}))
            la = lineup_adj.get(mid, {})
            adj.update({k: v for k, v in la.items() if isinstance(v, (int, float))})
            pred = predict_match(elo, clf, scaler, m["home"], m["away"], neutral, host, adj)
            kickoff_et, _ = to_eastern(m.get("time"))
            r = result_of(m)
            pred.update({"id": mid, "date": d, "group": m["group"], "venue": m["venue"],
                         "kickoff_et": kickoff_et, "lineup_note": la.get("note"),
                         "result": r, "status": "played" if r else "upcoming"})
            if r:
                actual = "home" if r["home"] > r["away"] else ("away" if r["away"] > r["home"] else "draw")
                pred["correct"] = (max(pred["prob"], key=pred["prob"].get) == actual)
                pred["actual_outcome"] = actual
            if is_featured:
                pred["h2h"] = _h2h_text(head_to_head(m["home"], m["away"]), m["home"], m["away"])
                pred["appearances"] = {m["home"]: appearances(m["home"]),
                                       m["away"]: appearances(m["away"])}
            day_preds.append(pred)
            archive[mid] = {
                "id": mid, "date": d, "group": m["group"], "home": m["home"], "away": m["away"],
                "kickoff_et": kickoff_et, "pick": pred["pick"], "prob": pred["prob"],
                "verdict": pred["verdict"], "confidence": pred["confidence"],
                "result": r, "correct": pred.get("correct"), "actual_outcome": pred.get("actual_outcome"),
            }
        if is_featured:
            predictions = day_preds
        # replay this day's finished games into Elo
        for m in day_fx:
            r = result_of(m)
            if r:
                host, neutral = host_of(m["home"], m["away"])
                elo.update(m["home"], m["away"], r["home"], r["away"], "World Cup", neutral, host)
                recorded.append({"id": mid_of(d, m["home"], m["away"]), "date": d,
                                 "group": m["group"], "home": m["home"], "away": m["away"],
                                 "venue": m["venue"], "result": r, "predicted": True})

    nxt = next((p for p in predictions if p["status"] == "upcoming"), None)
    for p in predictions:
        p["is_next"] = (nxt is not None and p["id"] == nxt["id"])

    # ---- cumulative accuracy over the whole archive
    scored = hits = exact_margin = 0; brier = logloss = 0.0
    for a in archive.values():
        if not a.get("result"):
            continue
        scored += 1
        r = a["result"]
        actual = "home" if r["home"] > r["away"] else ("away" if r["away"] > r["home"] else "draw")
        if max(a["prob"], key=a["prob"].get) == actual: hits += 1
        v = a.get("verdict") or {}
        am = abs(r["home"] - r["away"])
        if actual == "draw":
            if v.get("result") == "draw": exact_margin += 1
        else:
            w = a["home"] if r["home"] > r["away"] else a["away"]
            if v.get("result") == "win" and v.get("winner") == w and v.get("margin") == am:
                exact_margin += 1
        for k in ("home", "draw", "away"):
            brier += (a["prob"][k] - (1.0 if k == actual else 0.0)) ** 2
        logloss += -math.log(max(a["prob"][actual], 1e-9))
    accuracy = {
        "predictions_made": scored, "scored": scored, "correct_outcomes": hits,
        "outcome_hit_rate": round(hits / scored, 3) if scored else None,
        "exact_margin": exact_margin,
        "brier_score": round(brier / scored, 4) if scored else None,
        "log_loss": round(logloss / scored, 4) if scored else None,
        "note": "Cumulative record across every predicted match, scored as results come in.",
    }

    teams26 = [t for t in {m["home"] for m in known} | {m["away"] for m in known} if TEAMS[t][2]]
    teams_out = sorted(({"name": t, "flag": TEAMS[t][2], "confederation": TEAMS[t][1],
                         "seed_elo": round(TEAMS[t][0]), "current_elo": round(elo.get(t))}
                        for t in teams26), key=lambda x: -x["current_elo"])
    for i, t in enumerate(teams_out): t["rank"] = i + 1

    meta = {
        "updated": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
        "model": "Elo + negative-binomial + MLP neural net (ensemble)",
        "training_matches": n_train,
        "training_note": "WC 1930-2022, Euro 1960-2024, WC/Copa qualifiers, Nations League, AFCON, Copa America",
        "ensemble_weights": {"poisson": 0.62, "neural_net": 0.38},
        "as_of_date": featured,
    }
    schedule = []
    for m in sorted(known, key=lambda m: (m["date"] or "", to_eastern(m.get("time"))[1])):
        et, _ = to_eastern(m.get("time"))
        schedule.append({"id": mid_of(m["date"], m["home"], m["away"]), "date": m["date"],
                         "group": m["group"], "home": m["home"], "away": m["away"],
                         "venue": m["venue"], "kickoff_et": et, "result": result_of(m)})

    _w("teams.json", {"meta": meta, "teams": teams_out})
    _w("matches.json", {"meta": meta, "matches": recorded})
    _w("predictions.json", {"meta": meta, "predictions": predictions})
    _w("accuracy.json", {"meta": meta, "accuracy": accuracy})
    _w("schedule.json", {"meta": meta, "fixtures": schedule})
    _w("archive.json", {"meta": meta, "predictions": archive})

    print(f"trained on {n_train} | featured {featured} | record {hits}/{scored} "
          f"({round(100*hits/scored) if scored else 0}%)")
    for p in predictions:
        tag = (f"FT {p['result']['home']}-{p['result']['away']} {'OK' if p.get('correct') else 'X'}"
               if p["result"] else ("NEXT" if p["is_next"] else "locked"))
        print(f"  {p['kickoff_et']:>9} {p['home']} v {p['away']}: {p['verdict']['text']} [{tag}]")


def _h2h_text(rows, home, away):
    if not rows:
        return f"{home} and {away} have no World Cup, Euro, Copa or AFCON meetings on record."
    recent = "; ".join(f"{yr}: {h} {hg}-{ag} {a}" for yr, h, hg, ag, a, _ in rows[-3:])
    return f"{len(rows)} prior meeting(s) on record. Recent: {recent}."


def _w(name, obj):
    with open(os.path.join(DATA, name), "w") as f:
        json.dump(obj, f, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()
