from pathlib import Path

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas


def write_summary_report(path: Path, title: str, lines: list[str]) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    pdf = canvas.Canvas(str(path), pagesize=letter)
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(72, 740, title)
    pdf.setFont("Helvetica", 11)
    y = 710
    for line in lines:
        pdf.drawString(72, y, line[:95])
        y -= 18
    pdf.save()
    return path
