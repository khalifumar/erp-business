"""
Pipeline Anonimisasi Data Digipack
Mengubah entitas sensitif (nama brand, perusahaan, vendor, PIC, telepon) menjadi kode anonim
terstandar untuk keperluan penelitian skripsi.
"""

import os
import hashlib
import pandas as pd

class DataAnonymizer:
    def __init__(self):
        self.customer_map = {}
        self.vendor_map = {}
        self.customer_counter = 1
        self.vendor_counter = 1

    def anonymize_customer(self, name: str) -> str:
        if not name or pd.isna(name):
            return "CLIENT_ANON"
        clean_name = str(name).strip().lower()
        if clean_name not in self.customer_map:
            self.customer_map[clean_name] = f"CLIENT_{self.customer_counter:03d}"
            self.customer_counter += 1
        return self.customer_map[clean_name]

    def anonymize_vendor(self, code: str) -> str:
        if not code or pd.isna(code):
            return "VENDOR_DEFAULT"
        clean_code = str(code).strip().upper()
        # Jika sudah berbentuk SP0001, ubah ke VENDOR_SP0001
        if "SP" in clean_code:
            digits = "".join([c for c in clean_code if c.isdigit()])
            return f"VENDOR_SP{digits.zfill(4)}"
        if clean_code not in self.vendor_map:
            self.vendor_map[clean_code] = f"VENDOR_{self.vendor_counter:03d}"
            self.vendor_counter += 1
        return self.vendor_map[clean_code]

    def process_dataframe(self, df: pd.DataFrame, client_col='customer_name', vendor_col='vendor_name') -> pd.DataFrame:
        df_anon = df.copy()
        if client_col in df_anon.columns:
            df_anon['customer_code'] = df_anon[client_col].apply(self.anonymize_customer)
            df_anon.drop(columns=[client_col], inplace=True)
        if vendor_col in df_anon.columns:
            df_anon['vendor_code'] = df_anon[vendor_col].apply(self.anonymize_vendor)
            df_anon.drop(columns=[vendor_col], inplace=True)
            
        # Hapus kolom kontak yang sensitif jika ada
        sensitive_cols = ['email', 'phone', 'telepon', 'pic', 'contact_person', 'alamat', 'address']
        for col in sensitive_cols:
            if col in df_anon.columns:
                df_anon.drop(columns=[col], inplace=True)
                
        return df_anon

if __name__ == '__main__':
    print("Modul DataAnonymizer siap digunakan.")
