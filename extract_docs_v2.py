#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Извлечение текста из DOCX файлов с помощью python-docx
"""

from docx import Document
import os

def extract_text_from_docx(docx_path):
    """Извлекает текст из DOCX файла"""
    try:
        doc = Document(docx_path)
        paragraphs = []
        for para in doc.paragraphs:
            if para.text.strip():
                paragraphs.append(para.text)
        return '\n'.join(paragraphs)
    except Exception as e:
        return f"Ошибка: {str(e)}"

files = [
    "Положение конференция.docx",
    "Ямалетдинов Карим_работа.docx",
    "Ямалетдинов_Карим_тезисы.docx",
    "Мышенков_Роман_работа.docx",
    "Мышенков_Роман_тезисы.docx"
]

base_path = r"c:\Users\Karim\Downloads\secops-global"

for filename in files:
    filepath = os.path.join(base_path, filename)
    if os.path.exists(filepath):
        print(f"\n{'='*70}")
        print(f"ФАЙЛ: {filename}")
        print(f"{'='*70}")
        text = extract_text_from_docx(filepath)
        # Выводим текст, заменяя переносы строк на \n для читаемости
        print(text)
        print(f"\n[Размер: {len(text)} символов]")
    else:
        print(f"\nФайл не найден: {filepath}")
