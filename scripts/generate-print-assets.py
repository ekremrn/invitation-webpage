#!/usr/bin/env python3
from __future__ import annotations

import os
import sys
from pathlib import Path

BUNDLED_PYTHON = (
    Path.home()
    / ".cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3"
)
if (
    not os.environ.get("INVITATION_PRINT_BUNDLED_PYTHON")
    and BUNDLED_PYTHON.exists()
    and Path(sys.executable).resolve() != BUNDLED_PYTHON.resolve()
):
    os.environ["INVITATION_PRINT_BUNDLED_PYTHON"] = "1"
    os.execv(str(BUNDLED_PYTHON), [str(BUNDLED_PYTHON), *sys.argv])

import html
import json
import math
import shutil
import subprocess
from dataclasses import dataclass
from typing import Any

from PIL import Image, ImageDraw, ImageFont
from reportlab.graphics import renderPDF
from reportlab.graphics.barcode import qr
from reportlab.graphics.shapes import Drawing
from reportlab.lib import colors
from reportlab.lib.pagesizes import landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "output" / "pdf"
PREVIEW_DIR = OUTPUT_DIR / "previews"
PUBLIC_ASSETS_DIR = ROOT / "public" / "assets"

SITE_URL = "https://evleniyoz.com"
MAIN_SITE_URL = f"{SITE_URL}/"
HENNA_UPLOAD_URL = f"{SITE_URL}/upload/henna"
CEREMONY_UPLOAD_URL = f"{SITE_URL}/upload/ceremony"

BLEED = 3 * mm
MAIN_TRIM_W = 260 * mm
MAIN_TRIM_H = 180 * mm
MAIN_PAGE_W = MAIN_TRIM_W + (2 * BLEED)
MAIN_PAGE_H = MAIN_TRIM_H + (2 * BLEED)
MAIN_PANEL_W = MAIN_TRIM_W / 2

TENT_TRIM_W = 210 * mm
TENT_TRIM_H = 148 * mm
TENT_PAGE_W = TENT_TRIM_W + (2 * BLEED)
TENT_PAGE_H = TENT_TRIM_H + (2 * BLEED)
TENT_PANEL_W = TENT_TRIM_W / 2

IVORY = colors.HexColor("#f7efe2")
PEARL = colors.HexColor("#fffdf8")
WARM_WHITE = colors.HexColor("#faf8f5")
CREAM = colors.HexColor("#eadbc5")
CHAMPAGNE = colors.HexColor("#cfc0a8")
GOLD = colors.HexColor("#b8a882")
OLIVE = colors.HexColor("#3f4a36")
SAGE = colors.HexColor("#879070")
BURGUNDY = colors.HexColor("#7a2535")
WINE = colors.HexColor("#541b29")
CHARCOAL = colors.HexColor("#2f2a26")
MUTED = colors.HexColor("#8c7f75")


@dataclass(frozen=True)
class FontPaths:
    display: Path
    display_italic: Path
    body: Path
    body_bold: Path


def first_existing(candidates: list[Path]) -> Path:
    for candidate in candidates:
        if candidate.exists():
            return candidate
    return candidates[0]


BUNDLED_FONT_DIR = (
    Path.home()
    / ".cache/codex-runtimes/codex-primary-runtime/dependencies/native/"
    "libreoffice-headless/libreoffice/LibreOfficeDev.app/Contents/Resources/fonts/truetype"
)


FONT_PATHS = FontPaths(
    display=first_existing(
        [
            Path("/System/Library/Fonts/Supplemental/Georgia.ttf"),
            BUNDLED_FONT_DIR / "NotoSerif-Regular.ttf",
            BUNDLED_FONT_DIR / "LiberationSerif-Regular.ttf",
        ]
    ),
    display_italic=first_existing(
        [
            Path("/System/Library/Fonts/Supplemental/Georgia Italic.ttf"),
            BUNDLED_FONT_DIR / "NotoSerif-Italic.ttf",
            BUNDLED_FONT_DIR / "LiberationSerif-Italic.ttf",
        ]
    ),
    body=first_existing(
        [
            BUNDLED_FONT_DIR / "NotoSans-Regular.ttf",
            Path("/System/Library/Fonts/Supplemental/Arial.ttf"),
            BUNDLED_FONT_DIR / "LiberationSans-Regular.ttf",
        ]
    ),
    body_bold=first_existing(
        [
            BUNDLED_FONT_DIR / "NotoSans-Bold.ttf",
            Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf"),
            BUNDLED_FONT_DIR / "LiberationSans-Bold.ttf",
        ]
    ),
)


def require_file(path: Path) -> Path:
    if not path.exists():
        raise FileNotFoundError(f"Required file not found: {path}")
    return path


def asset_path(public_path: str) -> Path:
    relative = public_path.lstrip("/")
    return require_file(ROOT / "public" / relative)


def load_site_data() -> dict[str, Any]:
    node_bin = os.environ.get("NODE_BINARY") or shutil.which("node")
    if not node_bin:
        raise RuntimeError("Node.js is required to read the TypeScript site config.")

    loader = r"""
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ts = require("typescript");

const root = process.cwd();

function loadTs(relativePath) {
  const filename = path.join(root, relativePath);
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: filename,
  }).outputText;
  const module = { exports: {} };
  const sandbox = {
    module,
    exports: module.exports,
    console,
    process,
    require(spec) {
      throw new Error(`Unexpected runtime import "${spec}" while loading ${relativePath}`);
    },
  };
  vm.runInNewContext(output, sandbox, { filename });
  return module.exports;
}

const { events } = loadTs("src/config/events.ts");
const { siteCopy } = loadTs("src/content/copy.ts");
const { assetSlots } = loadTs("src/config/design.ts");

process.stdout.write(JSON.stringify({ events, siteCopy, assetSlots }));
"""

    result = subprocess.run(
        [node_bin, "-e", loader],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


def register_fonts() -> None:
    pdfmetrics.registerFont(TTFont("GeorgiaCustom", str(require_file(FONT_PATHS.display))))
    pdfmetrics.registerFont(
        TTFont("GeorgiaCustomItalic", str(require_file(FONT_PATHS.display_italic)))
    )
    pdfmetrics.registerFont(TTFont("NotoSansCustom", str(require_file(FONT_PATHS.body))))
    pdfmetrics.registerFont(TTFont("NotoSansCustomBold", str(require_file(FONT_PATHS.body_bold))))


def clean_text(value: str) -> str:
    return (
        value.replace("–", "-")
        .replace("—", "-")
        .replace("’", "'")
        .replace("“", '"')
        .replace("”", '"')
    )


def hex_color(value: colors.Color) -> tuple[int, int, int]:
    return tuple(round(channel * 255) for channel in (value.red, value.green, value.blue))


def with_alpha(color: colors.Color, alpha: float) -> colors.Color:
    return colors.Color(color.red, color.green, color.blue, alpha=alpha)


def draw_cover_image(
    c: canvas.Canvas,
    image_path: Path,
    x: float,
    y: float,
    width: float,
    height: float,
    alpha: float = 1,
) -> None:
    c.saveState()
    if alpha < 1:
        c.setFillAlpha(alpha)
        c.setStrokeAlpha(alpha)
    c.drawImage(ImageReader(str(image_path)), x, y, width=width, height=height, mask="auto")
    c.restoreState()


def draw_crop_marks(
    c: canvas.Canvas,
    page_w: float,
    page_h: float,
    trim_w: float,
    trim_h: float,
    bleed: float = BLEED,
) -> None:
    x0 = bleed
    y0 = bleed
    x1 = bleed + trim_w
    y1 = bleed + trim_h
    mark = 4 * mm
    c.saveState()
    c.setStrokeColor(with_alpha(GOLD, 0.72))
    c.setLineWidth(0.28)
    for x in (x0, x1):
        c.line(x, 0.8 * mm, x, bleed - 0.8 * mm)
        c.line(x, page_h - bleed + 0.8 * mm, x, page_h - 0.8 * mm)
    for y in (y0, y1):
        c.line(0.8 * mm, y, bleed - 0.8 * mm, y)
        c.line(page_w - bleed + 0.8 * mm, y, page_w - 0.8 * mm, y)
    for x, y in ((x0, y0), (x1, y0), (x0, y1), (x1, y1)):
        c.line(x - math.copysign(mark, x - page_w / 2), y, x, y)
        c.line(x, y - math.copysign(mark, y - page_h / 2), x, y)
    c.restoreState()


def draw_fold_marks(c: canvas.Canvas, x: float, page_h: float, bleed: float = BLEED) -> None:
    c.saveState()
    c.setStrokeColor(with_alpha(OLIVE, 0.38))
    c.setLineWidth(0.32)
    c.line(x, 0.8 * mm, x, bleed - 0.8 * mm)
    c.line(x, page_h - bleed + 0.8 * mm, x, page_h - 0.8 * mm)
    c.restoreState()


def draw_panel_frame(
    c: canvas.Canvas,
    x: float,
    y: float,
    width: float,
    height: float,
    accent: colors.Color = GOLD,
    alpha: float = 0.35,
) -> None:
    c.saveState()
    c.setStrokeColor(with_alpha(accent, alpha))
    c.setLineWidth(0.52)
    inset = 7.5 * mm
    c.roundRect(x + inset, y + inset, width - (2 * inset), height - (2 * inset), 4 * mm)
    c.restoreState()


def draw_paragraph(
    c: canvas.Canvas,
    text: str,
    x: float,
    top: float,
    width: float,
    style: ParagraphStyle,
) -> float:
    paragraph = Paragraph(html.escape(clean_text(text)).replace("\n", "<br/>"), style)
    _, height = paragraph.wrap(width, 1000 * mm)
    paragraph.drawOn(c, x, top - height)
    return height


def draw_center_text(
    c: canvas.Canvas,
    text: str,
    x_center: float,
    y: float,
    font: str,
    size: float,
    color: colors.Color,
) -> None:
    c.saveState()
    c.setFont(font, size)
    c.setFillColor(color)
    c.drawCentredString(x_center, y, clean_text(text))
    c.restoreState()


def draw_tracking_text(
    c: canvas.Canvas,
    text: str,
    x_center: float,
    y: float,
    font: str,
    size: float,
    color: colors.Color,
    tracking: float,
) -> None:
    text = clean_text(text)
    total_width = sum(pdfmetrics.stringWidth(char, font, size) for char in text)
    total_width += tracking * max(len(text) - 1, 0)
    x = x_center - (total_width / 2)
    c.saveState()
    c.setFont(font, size)
    c.setFillColor(color)
    for char in text:
        c.drawString(x, y, char)
        x += pdfmetrics.stringWidth(char, font, size) + tracking
    c.restoreState()


def draw_rule(c: canvas.Canvas, x_center: float, y: float, width: float, color: colors.Color) -> None:
    c.saveState()
    c.setStrokeColor(with_alpha(color, 0.42))
    c.setLineWidth(0.45)
    c.line(x_center - width / 2, y, x_center + width / 2, y)
    c.setFillColor(with_alpha(color, 0.62))
    c.circle(x_center, y, 1.1 * mm, fill=1, stroke=0)
    c.restoreState()


def draw_qr_code(
    c: canvas.Canvas,
    value: str,
    x: float,
    y: float,
    size: float,
    fill_color: colors.Color = CHARCOAL,
) -> None:
    widget = qr.QrCodeWidget(value)
    bounds = widget.getBounds()
    qr_width = bounds[2] - bounds[0]
    qr_height = bounds[3] - bounds[1]
    drawing = Drawing(
        size,
        size,
        transform=[
            size / qr_width,
            0,
            0,
            size / qr_height,
            0,
            0,
        ],
    )
    widget.barFillColor = fill_color
    widget.barStrokeColor = fill_color
    drawing.add(widget)
    c.saveState()
    c.setFillColor(PEARL)
    c.roundRect(x - 2.2 * mm, y - 2.2 * mm, size + 4.4 * mm, size + 4.4 * mm, 3 * mm, fill=1, stroke=0)
    renderPDF.draw(drawing, c, x, y)
    c.restoreState()


def draw_background(c: canvas.Canvas, asset_slots: dict[str, str], page_w: float, page_h: float) -> None:
    c.setFillColor(IVORY)
    c.rect(0, 0, page_w, page_h, fill=1, stroke=0)
    draw_cover_image(c, asset_path(asset_slots["paperTexture"]), 0, 0, page_w, page_h, alpha=0.42)
    c.saveState()
    c.setFillColor(with_alpha(PEARL, 0.74))
    c.rect(BLEED, BLEED, page_w - 2 * BLEED, page_h - 2 * BLEED, fill=1, stroke=0)
    c.restoreState()


def draw_front_cover(c: canvas.Canvas, site_copy: dict[str, Any], asset_slots: dict[str, str]) -> None:
    x = BLEED + MAIN_PANEL_W
    y = BLEED
    w = MAIN_PANEL_W
    h = MAIN_TRIM_H
    cx = x + w / 2

    draw_cover_image(
        c,
        asset_path(asset_slots["mediterraneanBotanicalRight"]),
        x + w - 64 * mm,
        y - 24 * mm,
        78 * mm,
        63 * mm,
        alpha=0.1,
    )
    draw_cover_image(
        c,
        asset_path(asset_slots["mediterraneanBotanicalLeft"]),
        x - 30 * mm,
        y + h - 72 * mm,
        84 * mm,
        84 * mm,
        alpha=0.22,
    )
    draw_panel_frame(c, x, y, w, h, GOLD, 0.32)

    draw_center_text(c, "İE", cx, y + h - 22 * mm, "GeorgiaCustomItalic", 18, GOLD)
    draw_tracking_text(
        c,
        "BU GÜZEL GÜNE DAVETLİSİNİZ",
        cx,
        y + h - 38 * mm,
        "NotoSansCustom",
        7.2,
        MUTED,
        1.15,
    )
    names = site_copy["hero"]["names"]
    draw_center_text(c, names["bride"], cx, y + h - 61 * mm, "GeorgiaCustomItalic", 38, CHARCOAL)
    draw_center_text(c, site_copy["familyNames"]["bride"], cx, y + h - 71 * mm, "GeorgiaCustom", 9.4, MUTED)
    draw_center_text(c, names["joiner"], cx, y + h - 83 * mm, "GeorgiaCustomItalic", 20, GOLD)
    draw_center_text(c, names["groom"], cx, y + h - 103 * mm, "GeorgiaCustomItalic", 38, CHARCOAL)
    draw_center_text(c, site_copy["familyNames"]["groom"], cx, y + h - 113 * mm, "GeorgiaCustom", 9.4, MUTED)
    draw_rule(c, cx, y + h - 124 * mm, 46 * mm, GOLD)
    subtitle_style = ParagraphStyle(
        "frontSubtitle",
        fontName="NotoSansCustom",
        fontSize=8.6,
        leading=12.4,
        alignment=1,
        textColor=MUTED,
    )
    draw_paragraph(c, site_copy["hero"]["subtitle"], x + 22 * mm, y + h - 133 * mm, w - 44 * mm, subtitle_style)

    draw_tracking_text(
        c,
        clean_text(site_copy["hero"]["dateLine"]).upper(),
        cx,
        y + 16 * mm,
        "NotoSansCustom",
        7.2,
        OLIVE,
        1.0,
    )


def draw_back_cover(c: canvas.Canvas, site_copy: dict[str, Any], asset_slots: dict[str, str]) -> None:
    x = BLEED
    y = BLEED
    w = MAIN_PANEL_W
    h = MAIN_TRIM_H
    cx = x + w / 2

    draw_cover_image(
        c,
        asset_path(asset_slots["mediterraneanBotanicalAccent"]),
        x - 30 * mm,
        y - 14 * mm,
        86 * mm,
        69 * mm,
        alpha=0.18,
    )
    draw_cover_image(
        c,
        asset_path(asset_slots["mediterraneanBotanicalLeft"]),
        x + w - 49 * mm,
        y + h - 48 * mm,
        63 * mm,
        63 * mm,
        alpha=0.16,
    )
    draw_panel_frame(c, x, y, w, h, SAGE, 0.22)

    draw_tracking_text(c, "TÜM DETAYLAR", cx, y + h - 39 * mm, "NotoSansCustom", 7.4, OLIVE, 1.25)
    draw_center_text(c, "Dijital davetiyemiz", cx, y + h - 53 * mm, "GeorgiaCustomItalic", 18, CHARCOAL)
    body_style = ParagraphStyle(
        "backBody",
        fontName="NotoSansCustom",
        fontSize=8.6,
        leading=13,
        alignment=1,
        textColor=MUTED,
    )
    draw_paragraph(
        c,
        "Yol tarifi, etkinlik bilgileri ve güncel detaylar için QR kodu okutabilirsiniz.",
        x + 22 * mm,
        y + h - 64 * mm,
        w - 44 * mm,
        body_style,
    )
    qr_size = 38 * mm
    draw_qr_code(c, MAIN_SITE_URL, cx - qr_size / 2, y + h - 121 * mm, qr_size, CHARCOAL)
    draw_tracking_text(c, "EVLENİYOZ.COM", cx, y + h - 133 * mm, "NotoSansCustomBold", 7.4, OLIVE, 1)
    draw_rule(c, cx, y + 31 * mm, 42 * mm, GOLD)
    draw_center_text(c, site_copy["final"]["signature"], cx, y + 20 * mm, "GeorgiaCustomItalic", 16, CHARCOAL)
    draw_center_text(c, site_copy["hero"]["dateLine"], cx, y + 12.5 * mm, "NotoSansCustom", 7.2, MUTED)


def event_accent(event: dict[str, Any]) -> colors.Color:
    return BURGUNDY if event["key"] == "henna" else OLIVE


def event_soft_accent(event: dict[str, Any]) -> colors.Color:
    return WINE if event["key"] == "henna" else SAGE


def draw_event_panel(
    c: canvas.Canvas,
    event: dict[str, Any],
    x: float,
    y: float,
    w: float,
    h: float,
    asset_slots: dict[str, str],
) -> None:
    accent = event_accent(event)
    soft = event_soft_accent(event)
    cx = x + w / 2

    c.saveState()
    c.setFillColor(with_alpha(accent, 0.035))
    c.rect(x, y, w, h, fill=1, stroke=0)
    c.restoreState()

    image_key = "mediterraneanBotanicalLeft" if event["key"] == "henna" else "mediterraneanBotanicalRight"
    image_x = x - 31 * mm if event["key"] == "henna" else x + w - 69 * mm
    image_y = y + h - 69 * mm if event["key"] == "henna" else y - 8 * mm
    draw_cover_image(c, asset_path(asset_slots[image_key]), image_x, image_y, 78 * mm, 70 * mm, alpha=0.13)

    draw_panel_frame(c, x, y, w, h, accent, 0.24)
    margin = 18 * mm
    top = y + h - 28 * mm

    draw_tracking_text(
        c,
        clean_text(event["displayDate"]).upper(),
        cx,
        top,
        "NotoSansCustom",
        7.2,
        accent,
        1.05,
    )
    draw_center_text(c, event["title"], cx, top - 19 * mm, "GeorgiaCustomItalic", 31, CHARCOAL)

    if event.get("subtitle"):
        subtitle_style = ParagraphStyle(
            f"{event['key']}Subtitle",
            fontName="NotoSansCustom",
            fontSize=7.8,
            leading=11.2,
            alignment=1,
            textColor=soft,
        )
        draw_paragraph(c, event["subtitle"], x + margin, top - 29 * mm, w - 2 * margin, subtitle_style)

    draw_rule(c, cx, top - 44 * mm, 48 * mm, accent)

    label_style = ParagraphStyle(
        f"{event['key']}Label",
        fontName="NotoSansCustomBold",
        fontSize=6.7,
        leading=8.5,
        alignment=1,
        textColor=MUTED,
    )
    value_style = ParagraphStyle(
        f"{event['key']}Value",
        fontName="GeorgiaCustom",
        fontSize=13.2,
        leading=17,
        alignment=1,
        textColor=accent,
    )
    address_style = ParagraphStyle(
        f"{event['key']}Address",
        fontName="NotoSansCustom",
        fontSize=7.2,
        leading=10.2,
        alignment=1,
        textColor=MUTED,
    )

    detail_top = top - 57 * mm
    details = [
        ("Saat", event["displayTimeRange"]),
        ("Mekan", event["venueName"]),
    ]
    for label, value in details:
        draw_paragraph(c, label.upper(), x + margin, detail_top, w - 2 * margin, label_style)
        detail_top -= 8 * mm
        used = draw_paragraph(c, value, x + margin, detail_top, w - 2 * margin, value_style)
        detail_top -= used + 7 * mm

    draw_paragraph(c, "ADRES", x + margin, detail_top, w - 2 * margin, label_style)
    detail_top -= 7.6 * mm
    draw_paragraph(c, event["address"], x + margin, detail_top, w - 2 * margin, address_style)

    draw_tracking_text(c, "DETAYLAR: EVLENİYOZ.COM", cx, y + 15 * mm, "NotoSansCustom", 6.6, soft, 0.8)


def generate_main_invitation(
    site_copy: dict[str, Any],
    events: dict[str, Any],
    asset_slots: dict[str, str],
) -> Path:
    path = OUTPUT_DIR / "irem-ekrem-katlamali-davetiye-print.pdf"
    c = canvas.Canvas(str(path), pagesize=(MAIN_PAGE_W, MAIN_PAGE_H), pageCompression=1)
    c.setTitle("İrem & Ekrem Katlamalı Davetiye")
    c.setAuthor("İrem & Ekrem")

    draw_background(c, asset_slots, MAIN_PAGE_W, MAIN_PAGE_H)
    draw_back_cover(c, site_copy, asset_slots)
    draw_front_cover(c, site_copy, asset_slots)
    draw_crop_marks(c, MAIN_PAGE_W, MAIN_PAGE_H, MAIN_TRIM_W, MAIN_TRIM_H)
    draw_fold_marks(c, MAIN_PAGE_W / 2, MAIN_PAGE_H)
    c.showPage()

    draw_background(c, asset_slots, MAIN_PAGE_W, MAIN_PAGE_H)
    draw_event_panel(c, events["henna"], BLEED, BLEED, MAIN_PANEL_W, MAIN_TRIM_H, asset_slots)
    draw_event_panel(
        c,
        events["ceremony"],
        BLEED + MAIN_PANEL_W,
        BLEED,
        MAIN_PANEL_W,
        MAIN_TRIM_H,
        asset_slots,
    )
    draw_crop_marks(c, MAIN_PAGE_W, MAIN_PAGE_H, MAIN_TRIM_W, MAIN_TRIM_H)
    draw_fold_marks(c, MAIN_PAGE_W / 2, MAIN_PAGE_H)
    c.save()
    return path


def draw_tent_face(
    c: canvas.Canvas,
    event: dict[str, Any],
    url: str,
    x: float,
    y: float,
    w: float,
    h: float,
    asset_slots: dict[str, str],
) -> None:
    accent = event_accent(event)
    soft = event_soft_accent(event)
    cx = x + w / 2

    c.saveState()
    c.setFillColor(PEARL)
    c.rect(x, y, w, h, fill=1, stroke=0)
    c.setFillColor(with_alpha(accent, 0.045))
    c.rect(x, y, w, h, fill=1, stroke=0)
    c.restoreState()
    draw_cover_image(
        c,
        asset_path(asset_slots["mediterraneanBotanicalAccent"]),
        x - 17 * mm,
        y + h - 52 * mm,
        61 * mm,
        49 * mm,
        alpha=0.15,
    )
    draw_panel_frame(c, x, y, w, h, accent, 0.26)

    draw_tracking_text(c, "ANI DEFTERİ", cx, y + h - 24 * mm, "NotoSansCustom", 7, soft, 1.05)
    draw_center_text(c, event["title"], cx, y + h - 42 * mm, "GeorgiaCustomItalic", 28, CHARCOAL)
    body_style = ParagraphStyle(
        f"{event['key']}TentBody",
        fontName="NotoSansCustom",
        fontSize=8.2,
        leading=12.2,
        alignment=1,
        textColor=MUTED,
    )
    draw_paragraph(
        c,
        "Fotoğraf ve videolarınızı bizimle paylaşın.",
        x + 17 * mm,
        y + h - 55 * mm,
        w - 34 * mm,
        body_style,
    )
    qr_size = 46 * mm
    draw_qr_code(c, url, cx - qr_size / 2, y + 37 * mm, qr_size, CHARCOAL)
    draw_tracking_text(
        c,
        url.replace("https://", "").upper(),
        cx,
        y + 27 * mm,
        "NotoSansCustomBold",
        6.6,
        accent,
        0.55,
    )
    draw_rule(c, cx, y + 18.5 * mm, 38 * mm, accent)
    draw_center_text(c, "İrem & Ekrem", cx, y + 10.5 * mm, "GeorgiaCustomItalic", 13.5, CHARCOAL)


def generate_table_tent(event: dict[str, Any], url: str, asset_slots: dict[str, str]) -> Path:
    filename = f"irem-ekrem-masa-cadiri-{event['key']}-print.pdf"
    path = OUTPUT_DIR / filename
    c = canvas.Canvas(str(path), pagesize=landscape((TENT_PAGE_H, TENT_PAGE_W)), pageCompression=1)
    c.setTitle(f"İrem & Ekrem {event['title']} Masa Çadırı")
    c.setAuthor("İrem & Ekrem")
    draw_background(c, asset_slots, TENT_PAGE_W, TENT_PAGE_H)
    draw_tent_face(c, event, url, BLEED, BLEED, TENT_PANEL_W, TENT_TRIM_H, asset_slots)
    draw_tent_face(
        c,
        event,
        url,
        BLEED + TENT_PANEL_W,
        BLEED,
        TENT_PANEL_W,
        TENT_TRIM_H,
        asset_slots,
    )
    draw_crop_marks(c, TENT_PAGE_W, TENT_PAGE_H, TENT_TRIM_W, TENT_TRIM_H)
    draw_fold_marks(c, TENT_PAGE_W / 2, TENT_PAGE_H)
    c.save()
    return path


def cover_image(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    image = image.convert("RGBA")
    target_w, target_h = size
    scale = max(target_w / image.width, target_h / image.height)
    resized = image.resize((round(image.width * scale), round(image.height * scale)), Image.LANCZOS)
    left = (resized.width - target_w) // 2
    top = (resized.height - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))


def paste_asset(
    base: Image.Image,
    path: Path,
    box: tuple[int, int, int, int],
    alpha: float,
) -> None:
    asset = Image.open(path).convert("RGBA").resize((box[2], box[3]), Image.LANCZOS)
    if alpha < 1:
        a = asset.getchannel("A").point(lambda px: int(px * alpha))
        asset.putalpha(a)
    base.alpha_composite(asset, (box[0], box[1]))


def text_size(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont) -> tuple[int, int]:
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox[2] - bbox[0], bbox[3] - bbox[1]


def draw_centered_pillow(
    draw: ImageDraw.ImageDraw,
    text: str,
    y: int,
    font: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int],
    width: int,
) -> None:
    tw, _ = text_size(draw, text, font)
    draw.text(((width - tw) / 2, y), text, font=font, fill=fill)


def generate_og_image(site_copy: dict[str, Any], asset_slots: dict[str, str]) -> Path:
    path = PUBLIC_ASSETS_DIR / "og-invitation.png"
    width, height = 1200, 630
    texture = cover_image(Image.open(asset_path(asset_slots["paperTexture"])), (width, height))
    base = Image.new("RGBA", (width, height), hex_color(IVORY) + (255,))
    texture_layer = texture.convert("RGBA")
    texture_layer.putalpha(82)
    base.alpha_composite(texture_layer)
    overlay = Image.new("RGBA", (width, height), hex_color(PEARL) + (204,))
    base = Image.alpha_composite(base, overlay)

    paste_asset(base, asset_path(asset_slots["mediterraneanBotanicalLeft"]), (-170, -140, 520, 520), 0.22)
    paste_asset(base, asset_path(asset_slots["mediterraneanBotanicalRight"]), (805, 245, 520, 416), 0.2)
    paste_asset(base, asset_path(asset_slots["mediterraneanBotanicalAccent"]), (-90, 420, 330, 264), 0.12)

    draw = ImageDraw.Draw(base)
    display = ImageFont.truetype(str(FONT_PATHS.display_italic), 112)
    amp = ImageFont.truetype(str(FONT_PATHS.display_italic), 58)
    body = ImageFont.truetype(str(FONT_PATHS.body), 28)
    small = ImageFont.truetype(str(FONT_PATHS.body), 20)
    small_bold = ImageFont.truetype(str(FONT_PATHS.body_bold), 20)

    draw.rounded_rectangle((86, 72, 1114, 558), radius=18, outline=hex_color(GOLD), width=2)
    draw_centered_pillow(draw, "İrem", 145, display, hex_color(CHARCOAL), width)
    draw_centered_pillow(draw, "&", 255, amp, hex_color(GOLD), width)
    draw_centered_pillow(draw, "Ekrem", 314, display, hex_color(CHARCOAL), width)
    draw.line((470, 428, 730, 428), fill=hex_color(GOLD), width=2)
    draw.ellipse((594, 422, 606, 434), fill=hex_color(GOLD))
    draw_centered_pillow(draw, site_copy["hero"]["dateLine"], 454, body, hex_color(OLIVE), width)
    draw_centered_pillow(draw, "Kına gecemizde ve nikahımızda yanımızda olmanız dileğiyle.", 500, small, hex_color(MUTED), width)
    draw_centered_pillow(draw, "EVLENİYOZ.COM", 92, small_bold, hex_color(OLIVE), width)

    base.convert("RGB").save(path, "PNG", optimize=True)
    return path


def render_previews(pdf_paths: list[Path]) -> list[Path]:
    bundled_pdftoppm = (
        Path.home()
        / ".cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pdftoppm"
    )
    pdftoppm = (
        os.environ.get("PDFTOPPM_BINARY")
        or shutil.which("pdftoppm")
        or str(bundled_pdftoppm)
    )
    if not Path(pdftoppm).exists():
        raise RuntimeError("pdftoppm is required to render PDF previews.")

    rendered: list[Path] = []
    for pdf_path in pdf_paths:
        prefix = PREVIEW_DIR / pdf_path.stem
        subprocess.run(
            [pdftoppm, "-r", "180", "-png", str(pdf_path), str(prefix)],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
        rendered.extend(sorted(PREVIEW_DIR.glob(f"{pdf_path.stem}-*.png")))
    return rendered


def write_support_files(pdf_paths: list[Path], preview_paths: list[Path], og_path: Path) -> None:
    manifest = {
        "generated": {
            "pdfs": [str(path.relative_to(ROOT)) for path in pdf_paths],
            "previews": [str(path.relative_to(ROOT)) for path in preview_paths],
            "openGraphImage": str(og_path.relative_to(ROOT)),
        },
        "printSpecs": {
            "mainInvitation": {
                "closedTrim": "130x180 mm",
                "openTrim": "260x180 mm",
                "bleed": "3 mm",
                "pages": [
                    "outside spread: back cover on the left, front cover on the right",
                    "inside spread: kına on the left, nikah on the right",
                ],
            },
            "tableTents": {
                "openTrim": "210x148 mm",
                "foldedVisibleFace": "105x148 mm",
                "bleed": "3 mm",
            },
        },
        "qrTargets": {
            "mainInvitation": MAIN_SITE_URL,
            "hennaTableTent": HENNA_UPLOAD_URL,
            "ceremonyTableTent": CEREMONY_UPLOAD_URL,
        },
    }
    (OUTPUT_DIR / "print-assets-manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (OUTPUT_DIR / "whatsapp-message.txt").write_text(
        (
            "Sevgili ailemiz ve dostlarımız,\n\n"
            "Bu özel günümüzde sizi aramızda görmekten mutluluk duyarız.\n\n"
            "Davetiyemiz ve detaylar:\n"
            f"{MAIN_SITE_URL}\n\n"
            "İrem & Ekrem\n"
        ),
        encoding="utf-8",
    )
    (OUTPUT_DIR / "print-notes.md").write_text(
        (
            "# Print Notes\n\n"
            "- Ana davetiye iki sayfalı PDF'tir. 1. sayfa dış yüz, 2. sayfa iç yüzdür.\n"
            "- Ana davetiye kapalı ölçü 130x180 mm, açık ölçü 260x180 mm, 3 mm bleed ile hazırlanmıştır.\n"
            "- Masa çadırları açık A5 yataydır; ortadan katlanınca her yüz 105x148 mm görünür.\n"
            "- QR hedefleri `print-assets-manifest.json` içinde listelenmiştir.\n"
            "- Basımcı CMYK/PDF-X isterse bu PDF'lerden ayrıca matbaa profiline göre dönüştürme yapılmalıdır.\n"
        ),
        encoding="utf-8",
    )


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
    register_fonts()
    data = load_site_data()

    site_copy = data["siteCopy"]
    events = data["events"]
    asset_slots = data["assetSlots"]

    pdf_paths = [
        generate_main_invitation(site_copy, events, asset_slots),
        generate_table_tent(events["henna"], HENNA_UPLOAD_URL, asset_slots),
        generate_table_tent(events["ceremony"], CEREMONY_UPLOAD_URL, asset_slots),
    ]
    og_path = generate_og_image(site_copy, asset_slots)
    preview_paths = render_previews(pdf_paths)
    write_support_files(pdf_paths, preview_paths, og_path)

    print("Generated print package:")
    for path in pdf_paths:
        print(f"- {path.relative_to(ROOT)}")
    print(f"- {og_path.relative_to(ROOT)}")
    print(f"- {OUTPUT_DIR.relative_to(ROOT) / 'whatsapp-message.txt'}")
    print(f"- {OUTPUT_DIR.relative_to(ROOT) / 'print-assets-manifest.json'}")


if __name__ == "__main__":
    main()
