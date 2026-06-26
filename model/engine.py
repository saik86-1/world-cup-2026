"""
World Cup 2026 prediction engine: Elo + Poisson + a neural-net calibrator.

1. Elo   - every team carries a rating (seeded from data_sources, updated live
           after each result with a competition-weighted K-factor). Elo is a
           running summary of a team's whole match history.
2. Poisson - the Elo gap (plus host-nation advantage) maps to an expected goal
           supremacy feeding two Poisson distributions; their outer product is
           the scoreline matrix -> win/draw/loss + most-likely scoreline.
3. Neural net - an MLP trained on 1,200+ real World Cup (1930-2022) and Euro
           matches, with competition-importance + recency sample weighting.

Final probabilities = weighted blend of the Poisson and net outputs.
"""
import json, math, os
import numpy as np
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler

from data_sources import TEAMS, COMP_WEIGHT, norm

BASE_GOALS = 2.70        # mean total goals (corpus), kept near the data
GOALS_PER_ELO = 1 / 190  # favourite-margin steepened vs the flat corpus fit:
#   the corpus MLE (~1 goal/300 Elo) is biased toward zero because it uses each
#   team's CURRENT rating as a proxy for its strength at match time (errors-in-
#   variables attenuation). Recent real results (favourites winning by 2-3) and
#   the steeper relationship in clean high-gap games support ~1 goal/190 Elo.
DISP_R = 8.0             # negative-binomial dispersion (fits the corpus best; →∞ = Poisson)
LAMBDA_FLOOR = 0.25
MAX_GOALS = 8
W_POISSON, W_NET = 0.62, 0.38
CORPUS = os.path.join(os.path.dirname(__file__), "..", "data", "training_matches.json")


def elo_of(t):
    e = TEAMS.get(t)
    return float(e[0]) if e else None

def conf_of(t):
    e = TEAMS.get(t)
    return e[1] if e else None


class Elo:
    def __init__(self):
        self.r = {n: float(v[0]) for n, v in TEAMS.items()}

    def get(self, t):
        return self.r.get(t, 1500.0)

    @staticmethod
    def expected(rh, ra):
        return 1.0 / (1.0 + 10 ** (-(rh - ra) / 400.0))

    def update(self, home, away, hg, ag, tournament="World Cup", neutral=True, host_team=None):
        k0 = COMP_WEIGHT.get(tournament, 30)
        ha = 0 if neutral else 65
        rh, ra = self.get(home), self.get(away)
        we = self.expected(rh + (ha if host_team == home else 0),
                           ra + (ha if host_team == away else 0))
        result = 1.0 if hg > ag else (0.5 if hg == ag else 0.0)
        margin = abs(hg - ag)
        g = 1.0 if margin <= 1 else (1.5 if margin == 2 else (11 + margin) / 8.0)
        delta = k0 * g * (result - we)
        self.r[home] = rh + delta
        self.r[away] = ra - delta
        return delta


def _nb(k, mu, r=DISP_R):
    # negative binomial pmf with mean mu and dispersion r (variance mu + mu^2/r)
    return math.exp(
        math.lgamma(k + r) - math.lgamma(r) - math.lgamma(k + 1)
        + r * math.log(r / (r + mu)) + k * math.log(mu / (r + mu))
    )


def poisson_match(rh, ra, neutral=True, host_team=None, home=None, away=None):
    ha = 0 if neutral else 65
    adj_h = rh + (ha if host_team == home else 0)
    adj_a = ra + (ha if host_team == away else 0)
    sup = (adj_h - adj_a) * GOALS_PER_ELO
    lam_h = max(LAMBDA_FLOOR, BASE_GOALS / 2 + sup / 2)
    lam_a = max(LAMBDA_FLOOR, BASE_GOALS / 2 - sup / 2)
    ph = [_nb(i, lam_h) for i in range(MAX_GOALS + 1)]
    pa = [_nb(j, lam_a) for j in range(MAX_GOALS + 1)]
    p_home = p_draw = p_away = 0.0
    grid = []
    for i in range(MAX_GOALS + 1):
        for j in range(MAX_GOALS + 1):
            p = ph[i] * pa[j]
            grid.append(((i, j), p))
            if i > j: p_home += p
            elif i == j: p_draw += p
            else: p_away += p
    s = p_home + p_draw + p_away
    grid.sort(key=lambda x: -x[1])
    top = [{"score": f"{i}-{j}", "prob": round(p / s, 4)} for (i, j), p in grid[:3]]
    return (p_home / s, p_draw / s, p_away / s), grid[0][0], (lam_h, lam_a), top


def _features(rh, ra, neutral, weight, same_conf):
    return [rh / 100.0, ra / 100.0, (rh - ra) / 100.0,
            1.0 if neutral else 0.0, weight / 60.0, 1.0 if same_conf else 0.0]


def _recency(year):
    # mild down-weight for very old matches: 1930 -> 0.55, 2026 -> 1.0
    return 0.55 + 0.45 * max(0.0, min(1.0, (year - 1930) / 96.0))


def train_net():
    corpus = json.load(open(CORPUS))
    rows, labels, weights = [], [], []
    used = 0
    for m in corpus:
        h, a = norm(m["h"]), norm(m["a"])
        if h not in TEAMS or a not in TEAMS:
            continue
        used += 1
        eh, ea = elo_of(h), elo_of(a)
        w = COMP_WEIGHT.get(m["comp"], 30) * _recency(m.get("year", 2000))
        same = conf_of(h) == conf_of(a)
        hg, ag = m["hg"], m["ag"]
        lab = 0 if hg > ag else (1 if hg == ag else 2)
        rows.append(_features(eh, ea, True, w, same)); labels.append(lab); weights.append(w)
        rows.append(_features(ea, eh, True, w, same))
        labels.append(0 if ag > hg else (1 if ag == hg else 2)); weights.append(w)
    X, y, sw = np.array(rows), np.array(labels), np.array(weights, float)
    scaler = StandardScaler().fit(X)
    # emulate sample weighting via importance resampling
    idx = np.random.RandomState(42).choice(len(X), size=len(X) * 3, p=sw / sw.sum())
    clf = MLPClassifier(hidden_layer_sizes=(24, 12), alpha=1.5, max_iter=4000,
                        random_state=42, activation="relu")
    clf.fit(scaler.transform(X[idx]), y[idx])
    return clf, scaler, used


def net_predict(clf, scaler, home, away):
    f = np.array([_features(elo_of(home), elo_of(away), True, 60, conf_of(home) == conf_of(away))])
    p = clf.predict_proba(scaler.transform(f))[0]
    out = {0: 0.0, 1: 0.0, 2: 0.0}
    for cls, val in zip(clf.classes_, p):
        out[int(cls)] = float(val)
    return out[0], out[1], out[2]


def appearances(team):
    try:
        corpus = json.load(open(CORPUS))
    except OSError:
        return 0
    return sum(1 for m in corpus if norm(m["h"]) == team or norm(m["a"]) == team)


def head_to_head(a, b, limit=6):
    try:
        corpus = json.load(open(CORPUS))
    except OSError:
        return []
    out = []
    for m in corpus:
        h, aw = norm(m["h"]), norm(m["a"])
        if {h, aw} == {a, b}:
            out.append((m.get("year"), h, m["hg"], m["ag"], aw, m["comp"]))
    return sorted(out, key=lambda r: r[0] or 0)[-limit:]


def _margins(lh, la):
    # probability the home side wins by exactly 1 / by 2+ (and the same for away)
    h1 = h2 = a1 = a2 = 0.0
    for i in range(MAX_GOALS + 1):
        for j in range(MAX_GOALS + 1):
            p = _nb(i, lh) * _nb(j, la)
            d = i - j
            if d == 1: h1 += p
            elif d >= 2: h2 += p
            elif d == -1: a1 += p
            elif d <= -2: a2 += p
    return h1, h2, a1, a2


def predict_match(elo, clf, scaler, home, away, neutral=True, host_team=None, elo_adjust=None):
    elo_adjust = elo_adjust or {}
    rh = elo.get(home) + elo_adjust.get(home, 0)
    ra = elo.get(away) + elo_adjust.get(away, 0)
    (ph, pd, pa), score, lams, top_scores = poisson_match(rh, ra, neutral, host_team, home, away)
    h1, h2, a1, a2 = _margins(lams[0], lams[1])
    nh, nd, na = net_predict(clf, scaler, home, away)
    bh = W_POISSON * ph + W_NET * nh
    bd = W_POISSON * pd + W_NET * nd
    ba = W_POISSON * pa + W_NET * na
    s = bh + bd + ba
    bh, bd, ba = bh / s, bd / s, ba / s
    top = max(bh, bd, ba)
    cold = appearances(home) < 4 or appearances(away) < 4
    conf = "High" if top >= 0.55 else ("Medium" if top >= 0.42 else "Low")
    if cold and conf == "High":
        conf = "Medium"
    pick = home if bh == top else (away if ba == top else "Draw")
    # margin verdict: no scoreline guessing — just the expected goal-difference
    if pick == "Draw":
        verdict = {"result": "draw", "winner": None, "margin": 0,
                   "text": "Predicted to be a draw"}
    else:
        margin = max(1, round(abs(lams[0] - lams[1])))
        verdict = {"result": "win", "winner": pick, "margin": margin,
                   "text": f"{pick} to win by {margin} goal" + ("s" if margin > 1 else "")}
    return {
        "home": home, "away": away,
        "elo": {home: round(rh), away: round(ra)},
        "prob": {"home": round(bh, 4), "draw": round(bd, 4), "away": round(ba, 4)},
        "verdict": verdict,
        "scoreline": f"{score[0]}-{score[1]}",
        "projected_score": f"{max(0, round(lams[0]))}-{max(0, round(lams[1]))}",
        "top_scores": top_scores,
        "margins": {  # probability the named side wins by exactly 1 / by 2+ goals
            "home_by1": round(h1, 4), "home_by2plus": round(h2, 4),
            "away_by1": round(a1, 4), "away_by2plus": round(a2, 4),
        },
        "expected_goals": {home: round(lams[0], 2), away: round(lams[1], 2)},
        "confidence": conf,
        "components": {
            "poisson": {"home": round(ph, 3), "draw": round(pd, 3), "away": round(pa, 3)},
            "net": {"home": round(nh, 3), "draw": round(nd, 3), "away": round(na, 3)},
            "weights": {"poisson": W_POISSON, "net": W_NET},
        },
        "pick": home if bh == top else (away if ba == top else "Draw"),
    }
