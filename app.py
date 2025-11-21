import json
import os
import re

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from openai import OpenAI

client = OpenAI()

app = Flask(__name__, static_folder="public", static_url_path="")
CORS(app)

# Carichiamo le pagine indicizzate
with open("pages.json", "r", encoding="utf-8") as f:
    PAGES = json.load(f)

VALID_DEPARTMENTS = {
    "ATENEO",
    "DMED",
    "DISG",
    "DILL",
    "DI4A",
    "DIES",
    "DMIF",
    "DIUM",
    "DPIA",
}


def normalize(text: str) -> str:
    return text.lower()


def search_pages(query: str, department: str):
    """
    Semplice ricerca full-text:
    - privilegia le pagine del dipartimento scelto
    - usa le parole chiave della domanda
    - restituisce le 5 pagine più rilevanti
    """
    q = normalize(query)
    keywords = [w for w in re.findall(r"\w+", q) if len(w) > 2]

    results = []
    for page in PAGES:
        score = 0
        page_dept = page.get("department", "ATENEO")
        title = normalize(page.get("title", ""))
        content = normalize(page.get("content", ""))

        # peso per il dipartimento
        if department != "ATENEO":
            if page_dept == department:
                score += 5
            elif page_dept == "ATENEO":
                score += 2
        else:
            if page_dept == "ATENEO":
                score += 3

        # matching delle parole chiave
        for kw in keywords:
            if kw in title:
                score += 4
            if kw in content:
                score += 1

        if score > 0:
            results.append((score, page))

    results.sort(key=lambda x: x[0], reverse=True)
    return [p for _, p in results[:5]]


def build_context(pages):
    """
    Costruisce un contesto testuale da passare al modello:
    titolo, url e snippet di contenuto.
    """
    blocks = []
    for p in pages:
        snippet = p.get("content", "")[:700]
        blocks.append(
            f"TITLE: {p['title']}\nURL: {p['url']}\nCONTENT: {snippet}\n----"
        )
    return "\n\n".join(blocks)


@app.route("/")
def index():
    return app.send_static_file("index.html")


@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json() or {}
    question = (data.get("question") or "").strip()
    department = (data.get("department") or "ATENEO").strip().upper()

    if not question:
        return jsonify({"answer": "<p>Per favore scrivi una domanda.</p>"}), 200

    if department not in VALID_DEPARTMENTS:
        department = "ATENEO"

    # Pagine più rilevanti
    relevant_pages = search_pages(question, department)
    context = build_context(relevant_pages)

    system_prompt = (
        "You are UniUD ChatBot, an assistant for students of the University of Udine (UniUd).\n"
        "- You ONLY answer questions related to UniUd, its departments, courses, services, and student life.\n"
        "- If the question is clearly unrelated, reply briefly that you can only answer questions about UniUd.\n"
        "- Always answer in the SAME LANGUAGE used in the user's question (Italian or English).\n"
        "- Answer using SHORT, CLEAN HTML (no <html>, <body>, <head> tags).\n"
        "- Structure the answer with:\n"
        "  * a short intro paragraph;\n"
        "  * use <h3> headings for sections when useful;\n"
        "  * use <ul><li> bullet lists for lists;\n"
        "  * highlight key words with <strong>.\n"
        "- At the end, if relevant, add a section titled <h3>Per approfondire</h3> (Italian) or "
        "<h3>Further information</h3> (English) with at most 3 bullet points.\n"
        "- Each bullet point must be of the form: 📎 <a href=\"URL\">Title – UniUd</a>.\n"
        "- You MUST ONLY use URLs that appear in the context I give you.\n"
    )

    user_prompt = (
        f"User question:\n{question}\n\n"
        "Here are some pages from the UniUd website that may contain the answer.\n"
        "Use them to provide an accurate and synthetic answer.\n\n"
        f"{context}\n\n"
        "If some detail is not explicitly in the context, answer in general terms but still about UniUd "
        "and suggest the most relevant link among those above."
    )

    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
            max_tokens=700,
        )
        answer_html = completion.choices[0].message.content
    except Exception as e:
        print("OpenAI error:", e)
        answer_html = (
            "<p><strong>Si è verificato un problema temporaneo.</strong> "
            "Riprova tra qualche minuto.</p>"
        )

    return jsonify({"answer": answer_html})


@app.route("/public/<path:path>")
def send_public(path):
    return send_from_directory("public", path)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
