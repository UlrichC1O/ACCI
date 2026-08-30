#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Vérifie que les migrations SQL sont acceptées par PostgreSQL.

    python3 tools/check-sql.py [fichier.sql …]

Sans argument, contrôle tout supabase/migrations/*.sql.

POURQUOI CE FICHIER EXISTE
Une migration livrée portait une virgule en trop avant la parenthèse fermante
d'un CREATE TABLE. Le fichier avait été relu, et l'erreur n'a été découverte
qu'au moment où quelqu'un l'a collée dans l'éditeur SQL de Supabase :
« syntax error at or near ")" ». Relire du SQL à l'œil ne détecte pas cela.

DEUX NIVEAUX DE CONTRÔLE
1. Si pglast est installé (pip install pglast), chaque instruction passe par
   libpg_query — l'analyseur syntaxique du serveur PostgreSQL lui-même. Ce
   qu'il accepte, PostgreSQL l'accepte. C'est le contrôle qui compte.
2. Sinon, un contrôle de structure repère les fautes les plus fréquentes :
   virgule avant une parenthèse fermante, parenthèses déséquilibrées. Il est
   moins sûr, et le dit.

Le dépôt n'a aucune dépendance à l'exécution : pglast n'est utile qu'ici, sur
le poste de développement, et son absence n'empêche jamais de travailler.
"""
import glob
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT = os.path.join(ROOT, "supabase", "migrations", "*.sql")


def split_statements(sql):
    """Découpe en instructions, en respectant chaînes, corps $$ et commentaires.

    Un découpage naïf sur « ; » couperait au milieu d'un corps de fonction ou
    d'une chaîne contenant un point-virgule, et signalerait des erreurs qui
    n'existent pas.
    """
    out, buf, i, n = [], [], 0, len(sql)
    line, start = 1, 1
    while i < n:
        c = sql[i]
        if sql.startswith("--", i):
            j = sql.find("\n", i)
            j = n if j < 0 else j
            buf.append(sql[i:j]); i = j; continue
        if sql.startswith("/*", i):
            j = sql.find("*/", i + 2)
            j = n if j < 0 else j + 2
            line += sql[i:j].count("\n"); buf.append(sql[i:j]); i = j; continue
        if c == "'":
            j = i + 1
            while j < n:
                if sql[j] == "'":
                    if j + 1 < n and sql[j + 1] == "'":
                        j += 2; continue
                    j += 1; break
                j += 1
            line += sql[i:j].count("\n"); buf.append(sql[i:j]); i = j; continue
        if c == "$":
            end = sql.find("$", i + 1)
            if end != -1 and "\n" not in sql[i:end + 1]:
                tag = sql[i:end + 1]
                j = sql.find(tag, end + 1)
                j = n if j < 0 else j + len(tag)
                line += sql[i:j].count("\n"); buf.append(sql[i:j]); i = j; continue
        if c == "\n":
            line += 1
        if c == ";":
            stmt = "".join(buf) + ";"
            if stmt.strip(" \n\t;"):
                out.append((start, stmt))
            buf, start, i = [], line, i + 1
            continue
        buf.append(c); i += 1
    if "".join(buf).strip(" \n\t;"):
        out.append((start, "".join(buf)))
    return out


def strip_noise(stmt):
    """Retire commentaires et chaînes : ce qui reste porte la ponctuation."""
    s = re.sub(r"/\*.*?\*/", " ", stmt, flags=re.S)
    s = re.sub(r"--[^\n]*", " ", s)
    s = re.sub(r"'(?:''|[^'])*'", "''", s)
    s = re.sub(r"\$(\w*)\$.*?\$\1\$", " ", s, flags=re.S)
    return s


def structural(stmt):
    """Contrôle de repli, sans pglast. Rend une liste de messages."""
    s = strip_noise(stmt)
    errs = []
    if re.search(r",\s*\)", s):
        errs.append("virgule juste avant une parenthèse fermante")
    depth = 0
    for ch in s:
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
            if depth < 0:
                errs.append("parenthèse fermante en trop"); break
    if depth > 0:
        errs.append("%d parenthèse(s) jamais refermée(s)" % depth)
    return errs


def check(path, parse_sql, ParseError):
    with open(path, encoding="utf-8") as fh:
        sql = fh.read()
    stmts = split_statements(sql)
    errs = []
    for line, stmt in stmts:
        if parse_sql:
            try:
                parse_sql(stmt)
            except ParseError as e:
                errs.append((line, str(e), stmt.strip().replace("\n", " ")[:100]))
        else:
            for msg in structural(stmt):
                errs.append((line, msg, stmt.strip().replace("\n", " ")[:100]))
    return len(stmts), errs


def main(argv):
    files = argv[1:] or sorted(glob.glob(DEFAULT))
    if not files:
        print("Aucune migration à vérifier.")
        return 0

    try:
        from pglast import parse_sql
        from pglast.parser import ParseError
        mode = "analyseur PostgreSQL (pglast)"
    except ImportError:
        parse_sql = ParseError = None
        mode = "contrôle de structure — installez pglast pour la vérification réelle"

    print("Vérification SQL — %s" % mode)
    bad = 0
    for path in files:
        n, errs = check(path, parse_sql, ParseError)
        name = os.path.relpath(path, ROOT)
        if errs:
            bad += 1
            print("  ✗ %s — %d erreur(s) sur %d instructions" % (name, len(errs), n))
            for line, msg, head in errs:
                print("      ligne ~%d : %s" % (line, msg))
                print("        %s…" % head)
        else:
            print("  ✓ %s — %d instructions" % (name, n))
    if bad:
        print("\n%d fichier(s) en erreur." % bad)
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
