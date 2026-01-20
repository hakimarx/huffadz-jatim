---
description: How to import Hafiz data from raw text/excel
---

# Import Data Hafiz

This workflow explains how to import a large dataset of Hafiz into the Supabase database.

## Prerequisites

1.  **Raw Data File**: Prepare your raw data in a Tab-Separated Values (TSV) format.
    -   You can copy directly from Excel and paste it into a file.
    -   Save this file to `database/raw_data.txt`.
    -   Ensure the columns match the expected order:
        `0:TAHUN` `1:DAERAH` `2:NIK` `3:NAMA` `4:TEMPAT_LAHIR` `5:TGL_LAHIR` `6:UMUR` `7:JK` `8:ALAMAT` `9:RT` `10:RW` `11:DESA` `12:KECAMATAN` `13:KAB_KOTA` `14:SERTIFIKAT` `15:TEMPAT_MENGAJAR` `16:TMT_MENGAJAR` `17:TELEPON` `18:KETERANGAN` `19:LULUS_TAHUN`

## Steps

1.  **Update Database Schema**:
    Run the SQL in `database/01_update_hafiz_schema.sql` to add necessary columns (`tempat_mengajar`, `keterangan`) to the `hafiz` table.
    You can run this in the Supabase SQL Editor.

2.  **Prepare Data**:
    Overwrite `database/raw_data.txt` with your FULL dataset.
    (Currently it only contains a sample of the first ~20 records).

3.  **Generate SQL Script**:
    Run the generation script:
    ```bash
    node scripts/generate_import_sql.js
    ```
    This will create `database/02_import_huffadz_2015.sql`.

4.  **Execute Import**:
    Run the contents of `database/02_import_huffadz_2015.sql` in the Supabase SQL Editor.
    This uses `ON CONFLICT (nik) DO UPDATE`, so it is safe to re-run if needed.

## Troubleshooting

-   **Truncated Data**: If the Node script fails on a specific line, check for special characters or misaligned columns in `raw_data.txt`.
-   **Date Errors**: Ensure dates are in `DD/MM/YYYY` format.
