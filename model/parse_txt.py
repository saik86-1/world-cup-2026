"""
Parser for openfootball text match files (euro / copa / afcon).

Strategy: the group-roster lines ("Group A | Team Team Team Team") give the full
list of participating team names for the edition. For every line that contains a
score, we locate the participating teams by name and read the result, correctly
handling half-time scores in parentheses, extra-time (a.e.t.) and penalty (pen.)
notation. Penalty-decided games are recorded at their drawn regulation/ET score.

Returns list of (home, away, home_goals, away_goals).
"""
import re

PAIR = re.compile(r"(\d+)\s*-\s*(\d+)")
TIME = re.compile(r"\b\d{1,2}:\d{2}\b")
PARENS = re.compile(r"\([^)]*\)")


def _rosters(text):
    teams = set()
    for line in text.splitlines():
        if line.strip().startswith("Group") and "|" in line:
            rhs = line.split("|", 1)[1]
            for name in re.split(r"\s{2,}", rhs.strip()):
                name = name.strip()
                if name:
                    teams.add(name)
    return teams


def parse(text, global_names=None):
    teams = _rosters(text) or set(global_names or [])
    if not teams:
        return []
    # match longest names first so "North Macedonia" wins over a bare substring
    names = sorted(teams, key=len, reverse=True)
    name_re = re.compile("(?<![A-Za-z])(" + "|".join(re.escape(n) for n in names) + ")(?![A-Za-z])")

    out = []
    SKIP = ("#", "(", "=", "▪", "Group", "Matchday")
    for raw in text.splitlines():
        s = raw.lstrip()
        if s.startswith(SKIP):
            continue  # comment / goalscorer / title / section / roster header
        line = TIME.sub(" ", raw)
        line = PARENS.sub(" ", line)          # drop HT "(3-0)" and "(aet, 6-5 pen)"
        pairs = list(PAIR.finditer(line))
        if not pairs:
            continue
        # first two DISTINCT team names, in order of appearance = home, away
        # (works for both "Team1 score Team2" and "Team1 v Team2 score" layouts)
        seen, ordered = set(), []
        for m in name_re.finditer(line):
            nm = m.group(1)
            if nm not in seen:
                seen.add(nm); ordered.append(nm)
        if len(ordered) < 2:
            continue
        home, away = ordered[0], ordered[1]
        first, last = pairs[0], pairs[-1]
        # choose the scoreline: pen. -> the a.e.t. draw after it; a.e.t. -> pair
        # before it; otherwise the first (full-time) pair
        low = line.lower()
        if "a.e.t." in low:                    # extra-time score is the result/draw
            aet_at = low.index("a.e.t.")
            before = [p for p in pairs if p.start() < aet_at]
            chosen = before[-1] if before else first
        elif "pen." in low:                    # shootout w/o explicit a.e.t. tag
            pen_at = low.index("pen.")
            before = [p for p in pairs if p.start() < pen_at]
            chosen = before[-1] if before else first
        else:
            chosen = first
        hg, ag = int(chosen.group(1)), int(chosen.group(2))
        out.append((home, away, hg, ag))
    return out
