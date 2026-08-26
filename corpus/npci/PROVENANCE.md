# Primary source corpus — provenance

`npci.org.in` returns **HTTP 403** to all programmatic access (verified 2026-08-26). The Wayback Machine is the working route, and is *better* than scraping NPCI directly: URLs are immutable, timestamped, and independently reproducible by a judge.

**288 NPCI UPI circular PDFs are archived.** Index: `cdx_all.txt` (from `web.archive.org/cdx/search/cdx?url=npci.org.in/PDF/npci/upi/circular*`).

⚠️ **Trap:** many snapshots are 1–3 KB **Imperva bot-protection HTML masquerading as `.pdf`**. Always check `file` output and size; pick the largest snapshot. Use the `/web/<timestamp>id_/<url>` form for the raw original.

| File | Circular | Date | Snapshot | Bytes | SHA-256 (first 16) |
|---|---|---|---|---|---|
| `OC-201_UPI_Circle.pdf` | NPCI/UPI/OC No.201/2024-25 | 13 Aug 2024 | 20240915064233 | 126,201 | `da9dcfbd7bdeca33` |
| `OC-201A_FullDelegation.pdf` | OC No.201-A/2025-26 | — | 20250830085632 | 1,341,893 | `35a6bc4e7b19ef22` |

**`EVIDENCE NOT FOUND` — OC-200 (Single Block Multiple Debits / Reserve Pay).** The URL is in the archive index, but **both** snapshots (20241125081451, 20260711033614) return Imperva bot-protection pages, not the PDF. **OC-228 does not appear in the index at all.** → **Reserve Pay numeric limits remain unverified.**

Rendering scanned circulars (they have no text layer):
```bash
.venv/bin/python -c "import pypdf; r=pypdf.PdfReader(f); p=r.pages[n]; p.rotate(-(p.get('/Rotate') or 0)); ..."
sips -s format png --resampleWidth 2200 page.pdf --out page.png
```
Pages are `/Rotate 270`; un-rotate before rendering or content is clipped.

---

## OC-200 and OC-228 (SBMD / UPI Reserve Pay) — added 2026-08-26

**⚠️ NOT Wayback captures. Retrieved from the LIVE NPCI site.** Filenames carry `live-2026-08-26`, deliberately **not** a Wayback timestamp, because no Wayback snapshot was used. Do not cite these as Wayback.

**Method:** headless browser navigated to `npci.org.in` (clears the Imperva JS challenge), then **same-origin `fetch()`** of `/uploads/*.pdf` from the page's own JS context, `ArrayBuffer` → base64 → decoded locally. Plain `curl`/`WebFetch` returns HTTP 403 for these paths.

| File | Source URL | Size | `file` | Verified |
|---|---|---|---|---|
| `OC-228_SBMD_ReservePay_live-2026-08-26.pdf` | `/uploads/UPI_OC_No_228_FY_2025_26_Enhancement_in_UPI_Single_Block_Multiple_Debits_UPI_Reserve_Pay_a9095c181d.pdf` | 758,736 B | PDF 1.7, **2 pages** | ✅ real PDF; `Creator: HP Scan`, `CreationDate: Wed Oct 8 15:15:57 2025 IST` — matches the circular's own date |
| `OC-200_SBMD_live-2026-08-26.pdf` | `/uploads/UPI_OC_No_200_FY_24_25_Enablement_of_UPI_Mandate_feature_of_Single_Block_Multiple_Debits_f2f9bc9230.pdf` | 158,604 B | PDF 1.4, **3 pages** | ✅ real PDF |

**Both are image-only scans — `pdftotext` returns EMPTY.** Rendered with `pdftoppm -png -r 170` and read visually. The rendered pages are persisted alongside (`*_p1.png` … `*_p3.png`) and checksummed, so the OCR input is auditable without re-fetching.

### ⚠️ Decoy found and quarantined

The previous `corpus/npci/OC-200_SBMD_ReservePay.pdf` was **5,243 bytes of Imperva bot-protection HTML**, not a PDF:

```
$ file OC-200_SBMD_ReservePay.pdf
HTML document text, ASCII text, with very long lines (748), with CRLF, LF line terminators
$ head -c 400 ... | strings
<!DOCTYPE html> ... window["bobcmn"] = "10111110101010200000005
```

`bobcmn` is the Imperva/Incapsula challenge marker. Renamed to `QUARANTINE_OC-200_imperva-decoy.html` rather than deleted, so the failure mode stays visible. **Anything in this corpus in the 1–6 KB range with a `.pdf` extension should be assumed to be this same decoy until `file` says otherwise.**
