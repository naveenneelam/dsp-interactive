#!/usr/bin/env python3
"""
Rebuild js/data/source_index.js from the supplied PDF.

The PDF is Smith, *The Scientist and Engineer's Guide to Digital Signal
Processing*, 2nd ed.  Section headings are Arial-Bold at ~15.7 pt.  The PDF
contains a duplicated 24-page block in Chapter 2 (PDF pages 49-72 repeat
25-48); the duplicate is skipped.

Usage:
    python tools/build_source_index.py "C:/path/to/Guide_to_Digital_Signal_Process.pdf"
"""
import json
import re
import sys
from pathlib import Path

try:
    import fitz  # PyMuPDF
except ImportError:
    sys.exit("PyMuPDF is required: pip install pymupdf")

CHAPTERS = [
    (1, "The Breadth and Depth of DSP", 15, 1, "Foundations"),
    (2, "Statistics, Probability and Noise", 25, 11, "Foundations"),
    (3, "ADC and DAC", 73, 35, "Foundations"),
    (4, "DSP Software", 105, 67, "Foundations"),
    (5, "Linear Systems", 125, 87, "Fundamentals"),
    (6, "Convolution", 145, 107, "Fundamentals"),
    (7, "Properties of Convolution", 161, 123, "Fundamentals"),
    (8, "The Discrete Fourier Transform", 179, 141, "Fundamentals"),
    (9, "Applications of the DFT", 207, 169, "Fundamentals"),
    (10, "Fourier Transform Properties", 223, 185, "Fundamentals"),
    (11, "Fourier Transform Pairs", 247, 209, "Fundamentals"),
    (12, "The Fast Fourier Transform", 263, 225, "Fundamentals"),
    (13, "Continuous Signal Processing", 281, 243, "Fundamentals"),
    (14, "Introduction to Digital Filters", 299, 261, "Digital Filters"),
    (15, "Moving Average Filters", 315, 277, "Digital Filters"),
    (16, "Windowed-Sinc Filters", 323, 285, "Digital Filters"),
    (17, "Custom Filters", 335, 297, "Digital Filters"),
    (18, "FFT Convolution", 349, 311, "Digital Filters"),
    (19, "Recursive Filters", 357, 319, "Digital Filters"),
    (20, "Chebyshev Filters", 371, 333, "Digital Filters"),
    (21, "Filter Comparison", 381, 343, "Digital Filters"),
    (22, "Audio Processing", 389, 351, "Applications"),
    (23, "Image Formation & Display", 411, 373, "Applications"),
    (24, "Linear Image Processing", 435, 397, "Applications"),
    (25, "Special Imaging Techniques", 461, 423, "Applications"),
    (26, "Neural Networks (and more!)", 489, 451, "Applications"),
    (27, "Data Compression", 519, 481, "Applications"),
    (28, "Digital Signal Processors", 541, 503, "Applications"),
    (29, "Getting Started with DSPs", 573, 535, "Applications"),
    (30, "Complex Numbers", 589, 551, "Complex Techniques"),
    (31, "The Complex Fourier Transform", 605, 567, "Complex Techniques"),
    (32, "The Laplace Transform", 619, 581, "Complex Techniques"),
    (33, "The z-Transform", 643, 605, "Complex Techniques"),
]

def book_page(pdf_page: int) -> int:
    """Map PDF page to printed book page, accounting for the duplicate block."""
    return pdf_page - 14 if pdf_page < 49 else pdf_page - 38

def main() -> None:
    pdf = Path(sys.argv[1] if len(sys.argv) > 1 else
               r"C:\Users\NAVEEN\Desktop\Guide_to_Digital_Signal_Process.pdf")
    doc = fitz.open(pdf)
    headings = []
    for i, page in enumerate(doc):
        if 49 <= i + 1 <= 72:  # duplicate block
            continue
        for block in page.get_text("dict")["blocks"]:
            for line in block.get("lines", []):
                text = "".join(span["text"] for span in line["spans"]).strip()
                if not text or len(text) > 90:
                    continue
                span = line["spans"][0]
                if span["font"].startswith("Arial-Bold") and 15 <= span["size"] <= 18.5:
                    headings.append((i + 1, text))

    out = []
    for idx, (num, title, pdf_start, book_start, part) in enumerate(CHAPTERS):
        pdf_end = CHAPTERS[idx + 1][2] if idx + 1 < len(CHAPTERS) else 689
        sections = []
        seen = set()
        for p, text in headings:
            if pdf_start <= p < pdf_end and book_page(p) >= book_start:
                key = (book_page(p), text)
                if key in seen:
                    continue
                seen.add(key)
                sections.append({
                    "id": f"{num}.{len(sections) + 1}",
                    "title": text.replace("\ufffd", "×"),
                    "bookPage": book_page(p),
                })
        out.append({
            "number": num, "title": title, "part": part,
            "bookStart": book_start,
            "bookEnd": CHAPTERS[idx + 1][3] - 1 if idx + 1 < len(CHAPTERS) else 630,
            "pdfStart": pdf_start,
            "sections": sections,
        })

    target = Path("js/data/source_index.js")
    target.write_text(
        "/** Generated from the PDF outline. Do not edit by hand; see tools/build_source_index.py. */\n"
        "export const sourceIndex = " + json.dumps(out, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )
    print(f"Wrote {target}: {len(out)} chapters, {sum(len(c['sections']) for c in out)} sections")

if __name__ == "__main__":
    main()
